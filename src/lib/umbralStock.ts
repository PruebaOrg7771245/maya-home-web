// src/lib/umbralStock.ts
//
// ÚNICA definición de los umbrales de stock (productos y combos). Sin
// dependencias (ni Supabase ni stock.ts) para poder usarse y probarse en cualquier lado.

// Umbral de "pocas unidades": de 1 a 5 existencias inclusive
export const UMBRAL_POCO_STOCK = 5;

// Estados que se derivan solo de la existencia (los demás de StockStatus,
// "unknown" y "coming_soon", dependen de que falte el dato)
export type EstadoPorExistencia = "out_of_stock" | "low_stock" | "in_stock";

// existencia <= 0 -> agotado; 1 a 5 -> pocas unidades; más de 5 -> en stock
export function clasificarExistencia(existencia: number): EstadoPorExistencia {
  if (existencia <= 0) return "out_of_stock";
  if (existencia <= UMBRAL_POCO_STOCK) return "low_stock";
  return "in_stock";
}
