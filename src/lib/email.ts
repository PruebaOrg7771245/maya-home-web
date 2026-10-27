// src/lib/email.ts
//
// Envía al asesor un correo informativo con los datos de un pedido.
// Es puramente informativo - el asesor lee esto y se contacta directo
// con el cliente, no hay ningún link ni acción que el asesor deba hacer
// dentro del correo en sí.

import { Resend } from "resend";
import { formatPrice } from "@/lib/formatPrice"; // mismo formato de precio que el resto del sitio
import { calcularVentaPorMedida, cantidadConUnidad, sufijoPrecio, textoCajasPedido } from "@/lib/unidadVenta"; // "2 m²" / "por m²" y cajas en venta por medida

// El SDK busca RESEND_API_KEY automáticamente en las variables de
// entorno, así que no hace falta pasarla a mano acá.
const resend = new Resend();

// El destinatario ya no es fijo: route.ts decide a qué asesor le toca
// este pedido (round-robin vía obtener_asesor_disponible(), con
// ADVISOR_EMAIL como respaldo de emergencia) y nos lo pasa acá. Por eso
// ya no hace falta validar ADVISOR_EMAIL a nivel de módulo en este
// archivo - esa variable ahora se resuelve y valida en route.ts.
type DestinatarioAsesor = {
  email: string;
  nombre: string;
};

type ProductoPedido = {
  nombre: string;
  cantidad: number;
  precio: number; // precio público por unidad, IVA incluido
  unidad?: string; // solo venta por medida (ej. "m²"): cantidad y precio se escriben con ella
  medidaPorCaja?: number; // solo venta por cajas (ej. 1.37): la fila muestra m² pedidos, cajas, m² facturados y total
  sinStock?: boolean; // true si estaba agotado (out_of_stock) al hacer el pedido
  piezas?: Array<{ sku: string; nombre: string }>; // solo combos: lavamanos y mueble
};

type DatosPedido = {
  rucCedula: string;
  nombreRazonSocial: string;
  direccion: string | null;
  ciudad: string | null;
  telefono: string;
  email: string;
  productos: ProductoPedido[];
  total: number;
};

// Lista las piezas de un combo (lavamanos y mueble) bajo el nombre del combo
function filasPiezas(piezas: ProductoPedido["piezas"]): string {
  if (!piezas || piezas.length === 0) return "";
  return piezas
    .map(
      (pz) =>
        `<div style="font-size:0.9em;color:#6B6862;margin-top:2px;">· ${pz.nombre} (${pz.sku})</div>`
    )
    .join("");
}

// Celdas de cantidad y precio. Venta por cajas: "13 m² pedidos → 9 cajas (12,33 m²) ·
// $669,52 ($54,30 por m² IVA incluido)" en la cantidad (misma función que el resto del
// sitio) y el importe de la línea en la columna de precio.
function celdasCantidadPrecio(p: ProductoPedido): { cantidad: string; precio: string } {
  if (p.unidad && p.medidaPorCaja) {
    const calculo = calcularVentaPorMedida(p.cantidad, p.precio, p.medidaPorCaja);
    return {
      cantidad: textoCajasPedido(calculo, p.unidad, p.precio),
      precio: formatPrice(calculo.totalCentavos / 100),
    };
  }
  return { cantidad: cantidadConUnidad(p.cantidad, p.unidad), precio: `${formatPrice(p.precio)}${sufijoPrecio(p.unidad)}` };
}

// Arma el cuerpo HTML del correo. Nombre y dirección van en MAYÚSCULAS -
// misma regla que ya aplicamos en el mensaje de WhatsApp, porque el
// asesor termina cargando estos 2 campos así en su sistema.
function construirHtmlPedido(pedido: DatosPedido): string {
  const filasProductos = pedido.productos
    .map((p) => {
      const celdas = celdasCantidadPrecio(p);
      return `<tr>
          <td style="padding:8px;border-bottom:1px solid #D8D4CC;">${p.nombre}${p.sinStock ? ' <strong style="color:#B3261E;">(sin stock)</strong>' : ""}${filasPiezas(p.piezas)}</td>
          <td style="padding:8px;border-bottom:1px solid #D8D4CC;text-align:center;">${celdas.cantidad}</td>
          <td style="padding:8px;border-bottom:1px solid #D8D4CC;text-align:right;">${celdas.precio}</td>
        </tr>`;
    })
    .join("");

  return `
    <div style="font-family: Arial, sans-serif; color:#232320; max-width:600px;">
      <h2>Nuevo pedido - Maya Home</h2>
      <p>Un cliente pidió que un asesor se contacte directamente con él.</p>

      <h3>Datos del cliente</h3>
      <table style="width:100%; border-collapse:collapse;">
        <tr><td style="padding:4px 0;"><strong>RUC/Cédula:</strong></td><td>${pedido.rucCedula}</td></tr>
        <tr><td style="padding:4px 0;"><strong>Nombre/Razón social:</strong></td><td>${pedido.nombreRazonSocial.toUpperCase()}</td></tr>
        <tr><td style="padding:4px 0;"><strong>Dirección:</strong></td><td>${
          pedido.direccion ? pedido.direccion.toUpperCase() : "No especificada"
        }</td></tr>
        <tr><td style="padding:4px 0;"><strong>Ciudad:</strong></td><td>${pedido.ciudad ?? "No especificada"}</td></tr>
        <tr><td style="padding:4px 0;"><strong>Teléfono:</strong></td><td>${pedido.telefono}</td></tr>
        <tr><td style="padding:4px 0;"><strong>Email:</strong></td><td>${pedido.email}</td></tr>
      </table>

      <h3>Productos</h3>
      <table style="width:100%; border-collapse:collapse;">
        <thead>
          <tr style="background:#EFEDE7;">
            <th style="padding:8px;text-align:left;">Producto</th>
            <th style="padding:8px;text-align:center;">Cantidad</th>
            <th style="padding:8px;text-align:right;">Precio (IVA incluido)</th>
          </tr>
        </thead>
        <tbody>${filasProductos}</tbody>
      </table>

      <p style="text-align:right; font-size:1.1em; margin-top:12px;">
        <strong>Total (IVA incluido): ${formatPrice(pedido.total)}</strong>
      </p>

      <p style="color:#6B6862; font-size:0.9em; margin-top:24px;">
        Este correo es informativo - respondé a este mismo correo si
        necesitás contactar al cliente por email, o usá el teléfono de
        arriba. El "Responder" de tu cliente de correo va directo al
        email del cliente, no a este buzón.
      </p>
    </div>
  `;
}

// Envía el correo al asesor indicado en `destinatario` (resuelto por
// route.ts, vía round-robin o el respaldo de emergencia). Devuelve
// { exito: true } o { exito: false, error } para que quien la llame
// decida qué guardar en estado_correo.
// Exportada solo para revisar el HTML en pruebas, sin enviar nada
export { construirHtmlPedido };

export async function enviarCorreoAsesor(
  pedido: DatosPedido,
  destinatario: DestinatarioAsesor
): Promise<{ exito: true } | { exito: false; error: string }> {
  try {
    const resultado = await resend.emails.send({
      from: "Maya Home <pedidos@notificaciones.comercialmaya.com>",
      to: `${destinatario.nombre} <${destinatario.email}>`,
      replyTo: pedido.email, // al darle "Responder", el asesor le escribe directo al cliente
      subject: `Nuevo pedido - ${pedido.nombreRazonSocial}`,
      html: construirHtmlPedido(pedido),
    });

    if (resultado.error) {
      return { exito: false, error: resultado.error.message };
    }

    return { exito: true };
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : "Error desconocido";
    return { exito: false, error: mensaje };
  }
}
