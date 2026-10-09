// src/app/api/pedido/route.ts
//
// Recibe un pedido desde el carrito, lo valida en el SERVIDOR (nunca hay
// que confiar en datos que vienen del navegador - ni precios, ni si el
// cliente "ya validó" algo del lado del cliente), lo guarda en Supabase,
// y devuelve el id del pedido creado.
//
// Si el canal es "correo", el pedido se guarda primero con
// estado_correo = "pendiente" y, recién después del insert exitoso, se
// intenta el envío real con Resend (src/lib/email.ts) - el resultado
// actualiza esa misma fila a "enviado" o "fallido". Nunca al revés: la
// acción externa no debe decidir si el pedido se guarda o no.

import { NextRequest, NextResponse } from "next/server";
import { products } from "@/data/products";
import { getStockPorSkus, type StockStatus } from "@/lib/stock";
import { calcularCombo, nombreCombinacion, parsearIdCombinacion, pareceIdCombo } from "@/lib/combos";
import type { PiezaCombo } from "@/data/combos";
import { validarIdentificacion } from "@/lib/identificacion";
import { validarTelefono } from "@/lib/telefono";
import { supabaseServidor } from "@/lib/supabase";
import { enviarCorreoAsesor } from "@/lib/email";

// Forma esperada del cuerpo de la petición. El navegador solo manda el id
// del producto y la cantidad - nunca el nombre ni el precio, esos los
// busca el servidor (nombre en products.ts o src/data/combos.ts, precio en
// stock_espejo). El id puede ser de un producto normal o de un combo
// ("<familia>__<sku lavamanos>__<sku mueble>", ver src/lib/combos.ts).
type ItemPedido = { id: string; cantidad: number };

// Fila que devuelve la función Postgres obtener_asesor_disponible() (ver
// SQL en el SQL Editor de Supabase). supabaseServidor no está tipado con
// un Database generado, así que el resultado de .rpc() llega sin tipo -
// lo afirmamos acá a mano con la forma que la función devuelve.
type AsesorDisponible = {
  id: string;
  email: string;
  nombre: string;
};

type CuerpoPedido = {
  items: ItemPedido[];
  rucCedula: string;
  nombreRazonSocial: string;
  direccion: string; // puede venir vacío, es opcional
  ciudad: string; // puede venir vacío, es opcional
  telefono: string;
  email: string;
  canal: "whatsapp" | "correo";
  // Honeypot: input oculto en el form de /carrito, siempre vacío para un
  // humano. Si viene con contenido, es casi seguro un bot rellenando todos
  // los campos del formulario.
  sitioWeb?: string;
};

// Validación mínima de email - la misma regla simple que ya usa el
// formulario del carrito (texto@texto.com), no hace falta más rigor acá.
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Ventanas de las protecciones anti-bot/anti-abuso (en milisegundos).
const VENTANA_LIMITE_IP_MS = 10 * 60 * 1000; // 10 minutos
const MAX_PEDIDOS_POR_IP = 5;
const VENTANA_DEDUP_MS = 60 * 1000; // 60 segundos

// Saca la IP real del pedido desde el header que inyecta Vercel. Si viene
// una lista separada por comas (proxies intermedios), solo nos interesa la
// primera, que es el cliente original.
function obtenerIp(request: NextRequest): string | null {
  const encabezado = request.headers.get("x-forwarded-for");
  if (!encabezado) return null;
  const primera = encabezado.split(",")[0]?.trim();
  return primera || null;
}

export async function POST(request: NextRequest) {
  let cuerpo: CuerpoPedido;

  try {
    cuerpo = await request.json();
  } catch {
    return NextResponse.json(
      { error: "El cuerpo de la petición no es JSON válido" },
      { status: 400 }
    );
  }

  // --- Protección 1: honeypot ---
  // No revelamos que es una trampa anti-bot; el mensaje es indistinguible
  // de un error de validación normal.
  if (typeof cuerpo.sitioWeb === "string" && cuerpo.sitioWeb.trim() !== "") {
    return NextResponse.json(
      { error: "No se pudo procesar el formulario, intenta de nuevo" },
      { status: 400 }
    );
  }

  // --- Validaciones de servidor (independientes de lo que haya validado el navegador) ---
  // El body es JSON no confiable (puede no cumplir el tipo CuerpoPedido en
  // runtime aunque TS lo asuma en compile time) - forzamos a string antes
  // de pasarle los valores a validarIdentificacion/validarTelefono, que
  // asumen string y no coercionan (a diferencia de un regex.test()).

  const rucCedula = typeof cuerpo.rucCedula === "string" ? cuerpo.rucCedula : "";
  const resultadoIdentificacion = validarIdentificacion(rucCedula);
  if (!resultadoIdentificacion.valido) {
    return NextResponse.json(
      { error: resultadoIdentificacion.mensaje || "RUC/Cédula inválido" },
      { status: 400 }
    );
  }

  if (typeof cuerpo.nombreRazonSocial !== "string" || !cuerpo.nombreRazonSocial.trim()) {
    return NextResponse.json(
      { error: "Nombre/Razón social es obligatorio" },
      { status: 400 }
    );
  }

  const telefono = typeof cuerpo.telefono === "string" ? cuerpo.telefono : "";
  const resultadoTelefono = validarTelefono(telefono);
  if (!resultadoTelefono.valido || !resultadoTelefono.normalizado) {
    return NextResponse.json(
      { error: resultadoTelefono.mensaje || "Teléfono inválido" },
      { status: 400 }
    );
  }

  if (typeof cuerpo.email !== "string" || !EMAIL_REGEX.test(cuerpo.email)) {
    return NextResponse.json({ error: "Email inválido" }, { status: 400 });
  }

  if (!Array.isArray(cuerpo.items) || cuerpo.items.length === 0) {
    return NextResponse.json({ error: "El pedido no tiene productos" }, { status: 400 });
  }

  if (cuerpo.canal !== "whatsapp" && cuerpo.canal !== "correo") {
    return NextResponse.json({ error: "Canal inválido" }, { status: 400 });
  }

  // --- Reconstruir los productos y el total DESDE EL SERVIDOR ---
  // Nunca usamos un precio que venga del navegador: del item solo leemos el
  // id y la cantidad. El nombre sale de products.ts y el precio público
  // (IVA incluido) del ERP, vía stock_espejo (src/lib/stock.ts).

  // Paso 1: validar id y cantidad de cada item y resolver si es producto o combo.
  type ItemValidado =
    | { tipo: "producto"; producto: (typeof products)[number]; cantidad: number }
    | { tipo: "combo"; combo: NonNullable<ReturnType<typeof parsearIdCombinacion>>; id: string; cantidad: number };
  const itemsValidados: ItemValidado[] = [];

  for (const item of cuerpo.items) {
    const idItem = item?.id;

    // Id con forma de combo: debe ser un combo válido y de UNA sola familia
    if (typeof idItem === "string" && pareceIdCombo(idItem)) {
      const combo = parsearIdCombinacion(idItem);
      if (!combo) {
        return NextResponse.json({ error: `Combo inválido: ${idItem}` }, { status: 400 });
      }
      if (!Number.isInteger(item.cantidad) || item.cantidad < 1) {
        return NextResponse.json(
          { error: `Cantidad inválida para ${nombreCombinacion(combo.familia)}` },
          { status: 400 }
        );
      }
      itemsValidados.push({ tipo: "combo", combo, id: idItem, cantidad: item.cantidad });
      continue;
    }

    const producto = products.find((p) => p.id === idItem);

    if (!producto) {
      return NextResponse.json(
        { error: `Producto no encontrado: ${String(idItem)}` },
        { status: 400 }
      );
    }

    if (!Number.isInteger(item.cantidad) || item.cantidad < 1) {
      return NextResponse.json(
        { error: `Cantidad inválida para ${producto.name}` },
        { status: 400 }
      );
    }

    itemsValidados.push({ tipo: "producto", producto, cantidad: item.cantidad });
  }

  // Paso 2: stock y precio de TODOS los items (productos y piezas de combos)
  // con UNA sola consulta.
  const skus = itemsValidados.flatMap((it) =>
    it.tipo === "combo"
      ? [it.combo.lavamanos.sku, it.combo.mueble.sku]
      : it.producto.sku
        ? [it.producto.sku]
        : []
  );
  const infoPorSku = await getStockPorSkus(skus);

  // Paso 3: armar el snapshot. Un producto o combo sin precio (sin sku, sin
  // fila, precio 0 o error de lectura) rechaza el pedido completo. Uno
  // agotado CON precio sí se acepta (se marca en el snapshot).
  const productosDelPedido: Array<{
    id: string;
    nombre: string;
    cantidad: number;
    precio: number; // precio público CON IVA por unidad
    stock: StockStatus; // estado de stock al momento del pedido
    piezas?: Array<{ sku: string; nombre: string }>; // solo en combos: lavamanos y mueble
  }> = [];

  for (const it of itemsValidados) {
    if (it.tipo === "combo") {
      const { familia, lavamanos, mueble } = it.combo;
      // el precio del combo se recalcula SIEMPRE acá; nada del body cuenta
      const calculo = calcularCombo({ lavamanos, mueble }, infoPorSku);
      if (calculo.precio === null || calculo.status === "no_vendible") {
        return NextResponse.json(
          {
            error: `El combo "${nombreCombinacion(familia)}" (${lavamanos.nombre} + ${mueble.nombre}) todavía no tiene precio confirmado`,
          },
          { status: 400 }
        );
      }
      const piezas = [lavamanos, mueble].map(({ sku, nombre }: PiezaCombo) => ({ sku, nombre }));
      productosDelPedido.push({
        id: it.id,
        nombre: nombreCombinacion(familia),
        cantidad: it.cantidad,
        precio: calculo.precio,
        stock: calculo.status,
        piezas,
      });
      continue;
    }

    const { producto, cantidad } = it;
    const info = producto.sku ? infoPorSku[producto.sku] : undefined;

    if (!info || info.precio === null || !(info.precio > 0)) {
      return NextResponse.json(
        {
          error: `El producto "${producto.name}" todavía no tiene precio confirmado`,
        },
        { status: 400 }
      );
    }

    productosDelPedido.push({
      id: producto.id,
      nombre: producto.name,
      cantidad,
      precio: info.precio,
      stock: info.status,
    });
  }

  // Total con IVA, redondeado a centavos para evitar residuos de punto flotante.
  const total =
    Math.round(
      productosDelPedido.reduce((suma, p) => suma + p.precio * p.cantidad, 0) * 100
    ) / 100;

  const ip = obtenerIp(request);

  // --- Protección 2: límite de pedidos por IP ---
  // Si no pudimos determinar la IP (no debería pasar en Vercel, pero puede
  // pasar en local sin el header), no bloqueamos el pedido por esto - solo
  // protege contra ráfagas desde una misma IP.
  if (ip) {
    const desde = new Date(Date.now() - VENTANA_LIMITE_IP_MS).toISOString();
    const { count: pedidosDesdeIp, error: errorConteoIp } = await supabaseServidor
      .from("pedidos")
      .select("id", { count: "exact", head: true })
      .eq("ip", ip)
      .gt("creado_en", desde);

    if (errorConteoIp) {
      // Si falla la verificación en sí, no bloqueamos al usuario por un
      // problema nuestro - solo lo registramos.
      console.error("Error contando pedidos por IP:", errorConteoIp);
    } else if ((pedidosDesdeIp ?? 0) >= MAX_PEDIDOS_POR_IP) {
      return NextResponse.json(
        { error: "Demasiados intentos, esperá unos minutos" },
        { status: 429 }
      );
    }
  }

  // --- Protección 3: deduplicación (mismo ruc/cédula + teléfono en los
  // últimos 60 segundos) ---
  // Cubre principalmente el doble clic / doble submit, que es mucho más
  // común que un intento real de abuso.
  const desdeDedup = new Date(Date.now() - VENTANA_DEDUP_MS).toISOString();
  const { count: pedidosDuplicados, error: errorDedup } = await supabaseServidor
    .from("pedidos")
    .select("id", { count: "exact", head: true })
    .eq("ruc_cedula", rucCedula)
    .eq("telefono", resultadoTelefono.normalizado)
    .gt("creado_en", desdeDedup);

  if (errorDedup) {
    console.error("Error verificando pedidos duplicados:", errorDedup);
  } else if ((pedidosDuplicados ?? 0) > 0) {
    return NextResponse.json(
      {
        error: "Ya recibimos este pedido, revisá que no lo hayas enviado dos veces",
      },
      { status: 409 }
    );
  }

  // --- Elegir asesor (round-robin) SOLO si el canal es "correo" ---
  // WhatsApp sigue yendo siempre al coordinador fijo (NEXT_PUBLIC_ADVISOR_PHONE),
  // no pasa por esta lógica - asesorId queda null en ese caso.
  //
  // La elección es 100% server-side: el navegador no interviene ni elige
  // asesor. Se resuelve ANTES del insert para poder guardar el asesor_id
  // en la misma fila del pedido.
  let asesorId: string | null = null;
  let destinatarioCorreo: { email: string; nombre: string } | null = null;

  if (cuerpo.canal === "correo") {
    const { data: asesorDisponibleRaw, error: errorAsesor } = await supabaseServidor
      .rpc("obtener_asesor_disponible")
      .maybeSingle();
    const asesorDisponible = asesorDisponibleRaw as AsesorDisponible | null;

    if (errorAsesor) {
      console.error("Error llamando a obtener_asesor_disponible():", errorAsesor);
    }

    if (asesorDisponible) {
      asesorId = asesorDisponible.id;
      destinatarioCorreo = {
        email: asesorDisponible.email,
        nombre: asesorDisponible.nombre,
      };
    } else {
      // No debería pasar en operación normal - señal de que hay que
      // revisar la tabla "asesores" (¿todos inactivos? ¿tabla vacía?).
      console.warn(
        "ADVERTENCIA: obtener_asesor_disponible() no devolvió ningún asesor activo. " +
          "Usando ADVISOR_EMAIL de respaldo. Revisar la tabla 'asesores' en Supabase."
      );

      if (!process.env.ADVISOR_EMAIL) {
        console.error(
          "No hay asesor disponible NI ADVISOR_EMAIL de respaldo configurado - no se puede enviar el correo del pedido."
        );
      } else {
        destinatarioCorreo = {
          email: process.env.ADVISOR_EMAIL,
          nombre: "Asesor Maya Home",
        };
      }
    }
  }

  // --- Guardar en Supabase ---
  // Si el canal es "correo", queda "pendiente" hasta que, más abajo,
  // intentemos el envío real y actualicemos esta misma fila.

  const { data, error } = await supabaseServidor
    .from("pedidos")
    .insert({
      ruc_cedula: rucCedula,
      nombre_razon_social: cuerpo.nombreRazonSocial.trim(),
      direccion: typeof cuerpo.direccion === "string" && cuerpo.direccion.trim() ? cuerpo.direccion.trim() : null,
      ciudad: typeof cuerpo.ciudad === "string" && cuerpo.ciudad.trim() ? cuerpo.ciudad.trim() : null,
      telefono: resultadoTelefono.normalizado,
      email: cuerpo.email,
      productos: productosDelPedido,
      total,
      canal: cuerpo.canal,
      estado_correo: cuerpo.canal === "correo" ? "pendiente" : "no_aplica",
      asesor_id: asesorId,
      ip,
    })
    .select("id")
    .single();

  if (error) {
    // No exponemos el error interno de Supabase al cliente, solo lo
    // registramos en el log del servidor para que Claude Code/Mateo lo vea
    // en Vercel si algo falla.
    console.error("Error guardando pedido en Supabase:", error);
    return NextResponse.json(
      { error: "No se pudo guardar el pedido, intenta de nuevo" },
      { status: 500 }
    );
  }

  // --- Envío de correo al asesor (solo si el canal elegido es "correo") ---
  // El pedido ya quedó guardado - si el envío falla, no lo exponemos al
  // cliente ni bloqueamos la respuesta, solo dejamos constancia en
  // estado_correo y en los logs para revisarlo después.
  if (cuerpo.canal === "correo") {
    // Si no hay NI asesor de la tabla NI ADVISOR_EMAIL de respaldo, no hay
    // a quién enviarle el correo - se registra como "fallido" sin intentar
    // el envío (ya quedó el console.error de más arriba explicando por qué).
    const resultadoCorreo = destinatarioCorreo
      ? await enviarCorreoAsesor(
          {
            rucCedula,
            nombreRazonSocial: cuerpo.nombreRazonSocial.trim(),
            direccion: typeof cuerpo.direccion === "string" && cuerpo.direccion.trim() ? cuerpo.direccion.trim() : null,
            ciudad: typeof cuerpo.ciudad === "string" && cuerpo.ciudad.trim() ? cuerpo.ciudad.trim() : null,
            telefono: resultadoTelefono.normalizado,
            email: cuerpo.email,
            productos: productosDelPedido.map((p) => ({
              nombre: p.nombre,
              cantidad: p.cantidad,
              precio: p.precio,
              sinStock: p.stock === "out_of_stock",
              piezas: p.piezas, // solo combos: el asesor ve lavamanos y mueble
            })),
            total,
          },
          destinatarioCorreo
        )
      : { exito: false as const, error: "Sin destinatario disponible (ni asesor ni ADVISOR_EMAIL)" };

    const nuevoEstadoCorreo = resultadoCorreo.exito ? "enviado" : "fallido";

    if (!resultadoCorreo.exito) {
      console.error(
        `Error enviando correo del pedido ${data.id}:`,
        resultadoCorreo.error
      );
    }

    const { error: errorUpdateEstado } = await supabaseServidor
      .from("pedidos")
      .update({ estado_correo: nuevoEstadoCorreo })
      .eq("id", data.id);

    if (errorUpdateEstado) {
      // Si falla el UPDATE en sí (no el envío), tampoco bloqueamos la
      // respuesta al cliente - el pedido ya está guardado, esto solo
      // queda pendiente de revisar en los logs.
      console.error(
        `Error actualizando estado_correo del pedido ${data.id}:`,
        errorUpdateEstado
      );
    }
  }

  return NextResponse.json({ id: data.id, total }, { status: 201 });
}
