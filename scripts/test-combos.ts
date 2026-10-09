// scripts/test-combos.ts
//
// Prueba de la lógica pura de combos (sin Supabase: usa un mapa de stock simulado).
// Ejecutar con:  node scripts/test-combos.ts   (Node 22.18+ ejecuta TypeScript directo)
// Termina con código 1 si alguna comprobación falla.

import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { FAMILIAS_COMBO, FOTOS_COMBINACION } from "../src/data/combos.ts";
import {
  calcularCombo,
  generarCombinaciones,
  generarTodasLasCombinaciones,
  parsearIdCombinacion,
  skusDeCombinaciones,
  vistaCombinaciones,
} from "../src/lib/combos.ts";
import type { StockInfo } from "../src/lib/stock.ts";
import { formatPrice } from "../src/lib/formatPrice.ts";
import { clasificarExistencia } from "../src/lib/umbralStock.ts";

// Atajo para armar un StockInfo simulado con los mismos umbrales que stock.ts
function info(quantity: number, precio: number | null): StockInfo {
  const status = quantity <= 0 ? "out_of_stock" : quantity <= 5 ? "low_stock" : "in_stock";
  return { status, quantity, precio };
}

// Mapa simulado (existencias de docs/MAPEO-PRODUCTOS-ERP.md; precios con IVA inventados pero estables)
const mapa: Record<string, StockInfo> = {
  "LAVLUX-600BL": info(30, 100.1),
  "MUEBLLUX-600SMOKE": info(30, 200.2),
  LAVFLUTE800BL: info(12, 150.55),
  MUEBLFLUTE800NATURA: info(12, 321.5),
  LAVCONNONSX800BL: info(6, 180),
  LAVCONNONSX800BLACK: info(6, 190),
  "MUEBLCONNOSX-800SMOK": info(12, 360),
  "LAVLUX-800BL": info(12, 140),
  "LAVLUX-800BLACK": info(12, 150),
  "MUEBLLUX-800HONEY": info(12, 340),
  "MUEBLLUX-800SUNTH": info(12, 340),
  "LAVLUMINA-1600BL": info(12, 300),
  "MUEBLLUMINA-1600DANI": info(6, 498.64),
};

// 1) Exactamente 9 combinaciones, impresas con precio y stock
const todas = generarTodasLasCombinaciones();
console.log(`Combinaciones: ${todas.length}`);
for (const c of todas) {
  const r = calcularCombo(c, mapa);
  console.log(`${c.id.padEnd(62)} precio=${r.precio} stock=${r.stock} status=${r.status}`);
}
assert.equal(todas.length, 9, "deben ser exactamente 9 combinaciones");
assert.equal(new Set(todas.map((c) => c.id)).size, 9, "los ids deben ser únicos");
// cada familia genera sus pares y nada más (LUX-800 = 4, CONNON = 2)
assert.equal(generarCombinaciones(FAMILIAS_COMBO.find((f) => f.id === "lux-800")!).length, 4);
// una sola lista de skus para una sola consulta: 13 piezas distintas
assert.equal(skusDeCombinaciones(todas).length, 13);

// 2) Ids: ida y vuelta de todos
for (const c of todas) {
  const p = parsearIdCombinacion(c.id);
  assert.ok(p, `id válido rechazado: ${c.id}`);
  assert.equal(p.lavamanos.sku, c.lavamanos.sku);
  assert.equal(p.mueble.sku, c.mueble.sku);
}

// 3) Precio: suma con redondeo único al final (100.1 + 200.2 = 300.3 sin ruido de coma flotante)
const lux600 = todas.find((c) => c.familia.id === "lux-600")!;
assert.deepEqual(calcularCombo(lux600, mapa), { precio: 300.3, stock: 30, status: "in_stock" });

// 4) Stock = mínimo de las dos piezas (LUMINA: 12 vs 6 -> 6; 6 es > 5, así que in_stock)
const lumina = todas.find((c) => c.familia.id === "lumina-1600")!;
assert.deepEqual(calcularCombo(lumina, mapa), { precio: 798.64, stock: 6, status: "in_stock" });

// 5) Pieza inexistente (sin entrada en el mapa) -> no vendible
const sinPieza = { ...mapa };
delete sinPieza["MUEBLLUX-600SMOKE"];
assert.deepEqual(calcularCombo(lux600, sinPieza), { precio: null, stock: null, status: "no_vendible" });

// 5b) Pieza ausente en el LAVAMANOS (mapa en memoria, sin tocar la base de datos)
const sinLav = { ...mapa };
delete sinLav["LAVLUX-600BL"];
assert.deepEqual(calcularCombo(lux600, sinLav), { precio: null, stock: null, status: "no_vendible" });
// ...y el mapa vacío (p. ej. falla de lectura): ningún combo se vende
for (const c of todas) assert.equal(calcularCombo(c, {}).status, "no_vendible");

// 6) Pieza con precio 0 / null -> no vendible
assert.equal(calcularCombo(lux600, { ...mapa, "LAVLUX-600BL": info(30, null) }).status, "no_vendible");
assert.equal(calcularCombo(lux600, { ...mapa, "LAVLUX-600BL": info(30, 0) }).status, "no_vendible");

// 6b) Mueble con precio 0 -> no vendible
assert.equal(calcularCombo(lux600, { ...mapa, "MUEBLLUX-600SMOKE": info(30, 0) }).status, "no_vendible");

// 7) Pieza agotada -> combo agotado pero CON precio (se puede agregar con aviso)
const agotado = calcularCombo(lux600, { ...mapa, "LAVLUX-600BL": info(0, 100.1) });
assert.deepEqual(agotado, { precio: 300.3, stock: 0, status: "out_of_stock" });

// 8) Pocas unidades: mínimo 5 -> low_stock
assert.equal(calcularCombo(lux600, { ...mapa, "LAVLUX-600BL": info(5, 100.1) }).status, "low_stock");

// 9) Ids manipulados -> null
const lux800Mueble = "MUEBLLUX-800HONEY";
assert.equal(parsearIdCombinacion(`lux-600__LAVLUX-600BL__${lux800Mueble}`), null, "LUX-600 + mueble LUX-800 debe rechazarse");
assert.equal(parsearIdCombinacion("lux-800__LAVLUX-600BL__MUEBLLUX-800HONEY"), null, "lavamanos de otra familia");
assert.equal(parsearIdCombinacion("lux-600__MUEBLLUX-600SMOKE__LAVLUX-600BL"), null, "piezas invertidas");
assert.equal(parsearIdCombinacion("no-existe__LAVLUX-600BL__MUEBLLUX-600SMOKE"), null, "familia inexistente");
assert.equal(parsearIdCombinacion("lux-600__LAVLUX-600BL"), null, "faltan partes");
assert.equal(parsearIdCombinacion(""), null, "id vacío");
assert.equal(parsearIdCombinacion("lux-600__LAVLUX-600BL__MUEBLLUX-600SMOKE__x"), null, "sobran partes");

// 10) Etiquetas de los selectores: no vacías y distintas entre hermanas (si no, el selector confunde)
for (const f of FAMILIAS_COMBO) {
  for (const lista of [f.lavamanos, f.muebles]) {
    const etiquetas = lista.map((p) => p.etiqueta);
    assert.ok(etiquetas.every((e) => e.trim() !== ""), `etiqueta vacía en ${f.id}`);
    assert.equal(new Set(etiquetas).size, etiquetas.length, `etiquetas repetidas en ${f.id}`);
  }
}

// 11) Umbral compartido: mismos cortes para productos y combos
assert.deepEqual([0, 1, 5, 6].map(clasificarExistencia), ["out_of_stock", "low_stock", "low_stock", "in_stock"]);

// 12) Formato de precio sin cambios ($479,10); se normaliza el espacio especial que Intl puede insertar
assert.equal(formatPrice(479.1).replace(/s/g, ""), "$479,10");

// 13) Fotos: cada clave del mapa es una combinación válida, el archivo existe y no es el placeholder
for (const [id, ruta] of Object.entries(FOTOS_COMBINACION)) {
  assert.ok(parsearIdCombinacion(id), `clave de foto inválida: ${id}`);
  assert.ok(existsSync(new URL(`../public${ruta}`, import.meta.url)), `falta el archivo ${ruta}`);
  assert.ok(!ruta.includes("placeholder"), "no se usa el placeholder en los combos");
}
for (const f of FAMILIAS_COMBO) {
  assert.ok(existsSync(new URL(`../public${f.imagen}`, import.meta.url)), `falta la foto de la familia ${f.id}`);
  assert.ok(!f.imagen.includes("placeholder"));
}
// 6 fotos propias; las otras 3 combinaciones usan la de la familia y quedan marcadas como referenciales
assert.equal(Object.keys(FOTOS_COMBINACION).length, 6);
const referenciales = FAMILIAS_COMBO.flatMap((f) => vistaCombinaciones(f, mapa))
  .filter((v) => v.imagenReferencial)
  .map((v) => v.id)
  .sort();
assert.deepEqual(referenciales, [
  "connon-sx800__LAVCONNONSX800BL__MUEBLCONNOSX-800SMOK",
  "lux-800__LAVLUX-800BLACK__MUEBLLUX-800HONEY",
  "lux-800__LAVLUX-800BL__MUEBLLUX-800SUNTH",
]);
const sinPropia = FAMILIAS_COMBO.flatMap((f) => vistaCombinaciones(f, mapa)).find((v) => v.imagenReferencial)!;
assert.ok(sinPropia.imagen.startsWith("/images/combos/"));

console.log("OK: todas las comprobaciones pasaron");
