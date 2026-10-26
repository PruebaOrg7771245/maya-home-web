// scripts/test-stock.ts
//
// Prueba de la lógica pura de estados de stock (src/lib/umbralStock.ts), sin
// Supabase: clasificarExistencia con umbral por defecto y personalizado, y las
// funciones para productos por medida (stockParaInterfaz, estadoDeProducto).
// Ejecutar con:  node scripts/test-stock.ts   (Node 22.18+ ejecuta TypeScript directo)
// Termina con código 1 si alguna comprobación falla.

import assert from "node:assert/strict";
import {
  UMBRAL_POCO_STOCK,
  clasificarExistencia,
  estadoDeProducto,
  stockParaInterfaz,
} from "../src/lib/umbralStock.ts";
import type { StockInfo } from "../src/lib/stock.ts";
import type { VentaPorMedida } from "../src/data/products.ts";

// 1) Umbral por defecto (5): sin cambios respecto de antes
assert.equal(UMBRAL_POCO_STOCK, 5);
assert.deepEqual(
  [-3, 0, 0.5, 1, 5, 5.01, 6, 24].map((n) => clasificarExistencia(n)),
  ["out_of_stock", "out_of_stock", "low_stock", "low_stock", "low_stock", "in_stock", "in_stock", "in_stock"]
);

// 2) Umbral personalizado 20 (ej. piso por m²), con decimales
const conVeinte = (n: number) => clasificarExistencia(n, 20);
assert.equal(conVeinte(0), "out_of_stock");
assert.equal(conVeinte(-1), "out_of_stock");
assert.equal(conVeinte(1), "low_stock");
assert.equal(conVeinte(0.25), "low_stock");
assert.equal(conVeinte(20), "low_stock");
assert.equal(conVeinte(20.01), "in_stock");
assert.equal(conVeinte(21), "in_stock");
assert.equal(conVeinte(779.53), "in_stock");

// 3) stockParaInterfaz / estadoDeProducto
const m2: VentaPorMedida = { unidad: "m²", umbralPocas: 20 };
const fila = (quantity: number, precio: number | null = 30): StockInfo => ({
  status: clasificarExistencia(quantity), // como lo deja stock.ts (umbral por defecto)
  quantity,
  precio,
});

// Sin venta por medida: idéntico (misma referencia, mismo contenido)
for (const info of [
  fila(0),
  fila(3),
  fila(779.53),
  { status: "unknown", quantity: null, precio: null } satisfies StockInfo,
  { status: "coming_soon", quantity: null, precio: null } satisfies StockInfo,
]) {
  assert.equal(stockParaInterfaz(info), info);
  assert.equal(stockParaInterfaz(info, undefined), info);
  assert.equal(estadoDeProducto(info), info.status);
}

// Con venta: estado reclasificado con umbralPocas y SIN existencia
assert.deepEqual(stockParaInterfaz(fila(12), m2), { status: "low_stock", quantity: null, precio: 30 }); // con 5 sería in_stock
assert.deepEqual(stockParaInterfaz(fila(20), m2), { status: "low_stock", quantity: null, precio: 30 });
assert.deepEqual(stockParaInterfaz(fila(21), m2), { status: "in_stock", quantity: null, precio: 30 });
assert.deepEqual(stockParaInterfaz(fila(779.53), m2), { status: "in_stock", quantity: null, precio: 30 });
assert.deepEqual(stockParaInterfaz(fila(0), m2), { status: "out_of_stock", quantity: null, precio: 30 });
assert.deepEqual(stockParaInterfaz(fila(3, null), m2), { status: "low_stock", quantity: null, precio: null });
// "unknown" / "coming_soon" no cambian (y siguen sin existencia)
assert.deepEqual(stockParaInterfaz({ status: "unknown", quantity: null, precio: null }, m2), {
  status: "unknown",
  quantity: null,
  precio: null,
});
assert.deepEqual(stockParaInterfaz({ status: "coming_soon", quantity: null, precio: null }, m2), {
  status: "coming_soon",
  quantity: null,
  precio: null,
});
// No modifica el objeto recibido (el mapa del servidor conserva la existencia real)
const original = fila(12);
stockParaInterfaz(original, m2);
assert.deepEqual(original, { status: "in_stock", quantity: 12, precio: 30 });

// estadoDeProducto (servidor): mismo estado que la interfaz, existencia intacta en info
assert.equal(estadoDeProducto(fila(12), m2), "low_stock");
assert.equal(estadoDeProducto(fila(21), m2), "in_stock");
assert.equal(estadoDeProducto(fila(779.53), m2), "in_stock");
assert.equal(estadoDeProducto(fila(0), m2), "out_of_stock");
assert.equal(estadoDeProducto({ status: "unknown", quantity: null, precio: null }, m2), "unknown");
assert.equal(estadoDeProducto({ status: "coming_soon", quantity: null, precio: null }, m2), "coming_soon");

console.log("OK: todas las comprobaciones pasaron");
