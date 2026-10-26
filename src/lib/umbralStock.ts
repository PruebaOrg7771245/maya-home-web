// src/lib/umbralStock.ts
//
// ÚNICA definición de los umbrales de stock (productos y combos) y ÚNICO punto
// donde se calcula el estado a partir de la existencia (ADR-1). Sin
// dependencias de ejecución (ni Supabase ni stock.ts: solo `import type`) para
// poder usarse y probarse en cualquier lado (scripts/test-*.ts).

import type { StockInfo, StockStatus } from "./stock.ts";
import type { VentaPorMedida } from "../data/products.ts";

// Umbral de "pocas unidades" por defecto: de más de 0 a 5 existencias inclusive
export const UMBRAL_POCO_STOCK = 5;

// Estados que se derivan solo de la existencia (los demás de StockStatus,
// "unknown" y "coming_soon", dependen de que falte el dato)
export type EstadoPorExistencia = "out_of_stock" | "low_stock" | "in_stock";

// existencia <= 0 -> agotado; más de 0 hasta umbralPocas inclusive -> pocas
// unidades; más -> en stock. Admite decimales (productos por medida, ej. 779.53 m²).
// OJO: no pasarla directo a .map() (el índice entraría como umbralPocas).
export function clasificarExistencia(
  existencia: number,
  umbralPocas: number = UMBRAL_POCO_STOCK
): EstadoPorExistencia {
  if (existencia <= 0) return "out_of_stock";
  if (existencia <= umbralPocas) return "low_stock";
  return "in_stock";
}

// ¿El estado salió de la existencia (y por tanto se puede reclasificar)?
function esEstadoPorExistencia(status: StockStatus): status is EstadoPorExistencia {
  return status === "in_stock" || status === "low_stock" || status === "out_of_stock";
}

// Estado de un producto teniendo en cuenta su venta por medida, si la tiene.
// Sin venta: info.status tal cual. Con venta y estado derivado de la existencia:
// se reclasifica con su umbralPocas. "unknown" / "coming_soon" no cambian.
// Pensada para el servidor (ej. snapshot de /api/pedido): la existencia real
// sigue en info.quantity, esta función no la toca.
export function estadoDeProducto(info: StockInfo, venta?: VentaPorMedida): StockStatus {
  if (!venta || info.quantity === null || !esEstadoPorExistencia(info.status)) {
    return info.status;
  }
  return clasificarExistencia(info.quantity, venta.umbralPocas);
}

// StockInfo que puede viajar a la interfaz (props de componentes cliente / HTML).
// Sin venta por medida: devuelve `info` tal cual (todo como siempre). Con venta:
// estado reclasificado con su umbral y `quantity: null`, para que la existencia
// real NUNCA llegue al navegador (solo el estado).
export function stockParaInterfaz(info: StockInfo, venta?: VentaPorMedida): StockInfo {
  if (!venta) return info;
  return { status: estadoDeProducto(info, venta), quantity: null, precio: info.precio };
}
