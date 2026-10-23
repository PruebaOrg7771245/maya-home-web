// scripts/test-resumen.ts
//
// Prueba de la lógica pura del catálogo resumido de la portada (src/lib/resumenCatalogo.ts).
// Ejecutar con:  node scripts/test-resumen.ts   (Node 22.18+ ejecuta TypeScript directo)
// Termina con código 1 si alguna comprobación falla.

import assert from "node:assert/strict";
import { POR_CATEGORIA, combosResumen, seccionesResumen } from "../src/lib/resumenCatalogo.ts";
import { tarjetaFamilia } from "../src/lib/combos.ts";
import type { FamiliaCombo } from "../src/data/combos.ts";
import type { StockInfo } from "../src/lib/stock.ts";

let fallos = 0;
function prueba(nombre: string, fn: () => void) {
  try {
    fn();
    console.log(`ok   ${nombre}`);
  } catch (e) {
    fallos++;
    console.log(`FALLA ${nombre}\n     ${(e as Error).message}`);
  }
}

const p = (id: string, category: string) => ({ id, category });
const conPrecio = { status: "in_stock", precio: 10 };
const agotado = { status: "out_of_stock", precio: 10 };
const sinPrecio = { status: "in_stock", precio: null };

const ids = (s: { productos: { id: string }[] }) => s.productos.map((x) => x.id);

prueba("salta los sin precio y pone los disponibles primero (orden estable)", () => {
  const productos = [p("a", "X"), p("b", "X"), p("c", "X"), p("d", "X")];
  const s = seccionesResumen(productos, { a: agotado, b: sinPrecio, c: conPrecio, d: conPrecio });
  assert.deepEqual(s.map(ids), [["c", "d", "a"]]);
});

prueba(`máximo ${POR_CATEGORIA} por categoría; con menos, los que haya`, () => {
  const productos = ["1", "2", "3", "4", "5"].map((id) => p(id, "X")).concat([p("y", "Y")]);
  const stock = Object.fromEntries(productos.map((x) => [x.id, conPrecio]));
  const s = seccionesResumen(productos, stock);
  assert.deepEqual(s.map(ids), [["1", "2", "3", "4"], ["y"]]);
});

prueba("una categoría sin ninguno vendible no sale; respeta el orden de categorías", () => {
  const productos = [p("a", "B"), p("b", "A"), p("c", "C")];
  const s = seccionesResumen(productos, { a: conPrecio, b: sinPrecio, c: agotado });
  assert.deepEqual(s.map((x) => x.categoria), ["B", "C"]);
});

prueba("sin dato de stock = no se vende", () => {
  assert.deepEqual(seccionesResumen([p("a", "X")], {}), []);
});

// ---------- fila de combos ----------
const c = (id: string, desde: number | null, disponible = true) => ({ id, desde, disponible });
const idsCombos = (lista: { id: string }[]) => lista.map((x) => x.id);

// Familia de prueba: un lavamanos y dos muebles (dos combinaciones)
const familia: FamiliaCombo = {
  id: "f",
  nombre: "F",
  descripcion: "",
  imagen: "/f.jpg",
  lavamanos: [{ sku: "LAV", nombre: "Lavamanos F", etiqueta: "Blanco" }],
  muebles: [
    { sku: "MUE1", nombre: "Mueble F 1", etiqueta: "Uno" },
    { sku: "MUE2", nombre: "Mueble F 2", etiqueta: "Dos" },
  ],
};
const st = (precio: number | null, quantity: number): StockInfo => ({
  status: quantity > 0 ? "in_stock" : "out_of_stock",
  quantity,
  precio,
});

prueba("combo con una pieza sin precio: esa combinación no cuenta para el 'Desde'", () => {
  const t = tarjetaFamilia(familia, { LAV: st(100, 5), MUE1: st(null, 5), MUE2: st(50, 5) });
  assert.equal(t.desde, 150);
  assert.equal(t.disponible, true);
});

prueba("combo cuya única pieza común no tiene precio: no se puede calcular y se omite", () => {
  const t = tarjetaFamilia(familia, { LAV: st(null, 5), MUE1: st(40, 5), MUE2: st(50, 5) });
  assert.equal(t.desde, null);
  assert.deepEqual(combosResumen([t, c("otro", 10)]).map((x) => x.id), ["otro"]);
});

prueba("combo vendible pero agotado: disponible = false (va después)", () => {
  const t = tarjetaFamilia(familia, { LAV: st(100, 0), MUE1: st(40, 5), MUE2: st(50, 5) });
  assert.equal(t.desde, 140);
  assert.equal(t.disponible, false);
  assert.deepEqual(idsCombos(combosResumen([{ ...t, id: "agotado" }, c("ok", 10)])), ["ok", "agotado"]);
});

prueba(`combos: disponibles primero (orden estable) y máximo ${POR_CATEGORIA}`, () => {
  const lista = [c("1", 1, false), c("2", 1), c("3", null), c("4", 1), c("5", 1), c("6", 1), c("7", 1)];
  assert.deepEqual(idsCombos(combosResumen(lista)), ["2", "4", "5", "6"]);
});

prueba("menos de 4 combos vendibles: salen los que haya", () => {
  assert.deepEqual(idsCombos(combosResumen([c("a", 5), c("b", null), c("c", 7, false)])), ["a", "c"]);
});

prueba("ningún combo vendible: lista vacía (la fila no sale)", () => {
  assert.deepEqual(combosResumen([c("a", null), c("b", null)]), []);
  assert.deepEqual(combosResumen([]), []);
});

if (fallos > 0) {
  console.log(`\n${fallos} prueba(s) fallaron`);
  process.exit(1);
}
console.log("\nTodas las pruebas pasaron");
