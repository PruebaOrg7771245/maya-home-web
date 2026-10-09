// src/lib/stock.ts
//
// Este archivo es el ÚNICO lugar del proyecto que "sabe" de dónde vienen el
// stock y el precio. El resto del código (páginas, componentes) solo llama a
// getStock() / getStockPorSkus() / getPrecioProducto() de aquí abajo, sin
// saber de dónde sale el dato (ver ADR-1 en docs/DECISIONS.md).
//
// FUENTE ACTUAL: tabla `stock_espejo` en Supabase, un "espejo" del ERP:
//   codigo_producto (text, PK) | producto | existencia (numeric)
//   | precio_publico (numeric) | actualizado_en
//
// IMPORTANTE - los datos pueden estar DESACTUALIZADOS: la tabla no se
// sincroniza sola. Se llena a mano ejecutando sync-stock.js desde la red de
// la oficina (el ERP no es accesible desde internet). Entre una corrida y la
// siguiente, el stock y el precio que ve el cliente son los de la última
// corrida, no los del ERP en vivo. `actualizado_en` indica cuándo fue.
//
// `precio_publico` YA incluye el 15% de IVA y es el ÚNICO precio que se
// muestra en la web. Los precios mayoristas no se usan.
//
// Este módulo usa el cliente de servidor (service_role), así que solo puede
// importarse desde server components o rutas de servidor, nunca desde un
// componente "use client". Los componentes cliente reciben los datos por props.

import { supabaseServidor } from "@/lib/supabase";
import { clasificarExistencia } from "@/lib/umbralStock"; // umbral y clasificación compartidos con los combos

// Los posibles estados de disponibilidad que puede mostrar la web
export type StockStatus =
  | "in_stock"
  | "low_stock"
  | "out_of_stock"
  | "unknown" // no hay fila en la tabla, o falló la consulta: no sabemos
  | "coming_soon"; // el producto no tiene sku (código del ERP): ni se consulta

// Lo que devuelve getStock(): el estado + la cantidad exacta + el precio
export type StockInfo = {
  status: StockStatus;
  quantity: number | null; // null cuando no tenemos el dato real
  precio: number | null; // precio_publico (IVA incluido); null si no hay fila o es 0
};

// Resultado para productos sin sku (no se consulta nada)
const SIN_SKU: StockInfo = { status: "coming_soon", quantity: null, precio: null };

// Resultado cuando no sabemos nada (sin fila en la tabla o error de Supabase)
const DESCONOCIDO: StockInfo = { status: "unknown", quantity: null, precio: null };

// Convierte una fila de stock_espejo en el StockInfo que usa la web
function filaAStockInfo(fila: { existencia: number | string | null; precio_publico: number | string | null }): StockInfo {
  // numeric puede llegar como número o como texto según el driver: normalizamos
  const existencia = Number(fila.existencia ?? 0);
  const precioPublico = Number(fila.precio_publico ?? 0);

  const status: StockStatus = clasificarExistencia(existencia);

  return {
    status,
    quantity: existencia,
    // un precio 0 (o inválido) significa "sin precio cargado": la web muestra "Consultar precio"
    precio: precioPublico > 0 ? precioPublico : null,
  };
}

// Resuelve el stock y precio de VARIOS skus con UNA sola consulta a Supabase.
// Devuelve un Record con una entrada por cada sku recibido (la clave es el sku
// tal como llegó). Si Supabase falla, registra el error y devuelve "unknown"
// con precio null para todos: la página nunca se rompe por esto.
export async function getStockPorSkus(
  skus: string[]
): Promise<Record<string, StockInfo>> {
  const resultado: Record<string, StockInfo> = {};

  // sku limpio (sin espacios) -> skus originales que lo usan
  const skusLimpios = new Map<string, string[]>();
  for (const sku of skus) {
    const limpio = sku.trim();
    if (limpio === "") {
      resultado[sku] = SIN_SKU; // sku vacío = producto sin código del ERP
      continue;
    }
    skusLimpios.set(limpio, [...(skusLimpios.get(limpio) ?? []), sku]);
  }

  // Nada que consultar: evitamos el viaje a la red
  if (skusLimpios.size === 0) return resultado;

  const { data, error } = await supabaseServidor
    .from("stock_espejo")
    .select("codigo_producto, existencia, precio_publico")
    .in("codigo_producto", [...skusLimpios.keys()]);

  if (error) {
    console.error("[stock] No se pudo leer stock_espejo en Supabase:", error);
    for (const originales of skusLimpios.values()) {
      for (const original of originales) resultado[original] = DESCONOCIDO;
    }
    return resultado;
  }

  const filasPorCodigo = new Map(
    (data ?? []).map((fila) => [String(fila.codigo_producto).trim(), fila])
  );

  for (const [limpio, originales] of skusLimpios) {
    const fila = filasPorCodigo.get(limpio);
    // sin fila en la tabla = "unknown" (no inventamos ni 0 ni precio)
    const info = fila ? filaAStockInfo(fila) : DESCONOCIDO;
    for (const original of originales) resultado[original] = info;
  }

  return resultado;
}

// Stock y precio de UN producto. Acepta sku vacío/ausente: en ese caso
// devuelve "coming_soon" sin consultar nada.
export async function getStock(sku: string | undefined | null): Promise<StockInfo> {
  if (!sku || sku.trim() === "") return SIN_SKU;
  const resultado = await getStockPorSkus([sku]);
  return resultado[sku] ?? DESCONOCIDO;
}

// ÚNICA función de precio del proyecto: precio público (IVA incluido) de un
// producto según su sku, o null si no hay fila / no hay precio / no hay sku.
// /api/pedido debe usar esta misma fuente para recalcular el total en el
// servidor. Si se necesitan varios productos, usar getStockPorSkus() y leer
// `.precio` de cada uno (una sola consulta en vez de N).
export async function getPrecioProducto(
  sku: string | undefined | null
): Promise<number | null> {
  return (await getStock(sku)).precio;
}
