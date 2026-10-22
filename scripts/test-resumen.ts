// scripts/test-resumen.ts
//
// Prueba de la lógica pura del catálogo resumido de la portada (src/lib/resumenCatalogo.ts).
// Ejecutar con:  node scripts/test-resumen.ts   (Node 22.18+ ejecuta TypeScript directo)
// Termina con código 1 si alguna comprobación falla.

import assert from "node:assert/strict";
import { POR_CATEGORIA, seccionesResumen } from "../src/lib/resumenCatalogo.ts";

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

if (fallos > 0) {
  console.log(`\n${fallos} prueba(s) fallaron`);
  process.exit(1);
}
console.log("\nTodas las pruebas pasaron");
