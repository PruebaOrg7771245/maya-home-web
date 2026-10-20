// scripts/test-busqueda.ts
//
// Prueba de la lógica pura del buscador (src/lib/busqueda.ts) sobre el catálogo real.
// Ejecutar con:  node scripts/test-busqueda.ts   (Node 22.18+ ejecuta TypeScript directo)
// Termina con código 1 si alguna comprobación falla.

import assert from "node:assert/strict";
import { products } from "../src/data/products.ts";
import { FAMILIAS_COMBO } from "../src/data/combos.ts";
import {
  coincide,
  normalizar,
  prepararConsulta,
  textoBusquedaCombo,
  textoBusquedaProducto,
} from "../src/lib/busqueda.ts";
import { urlCatalogo } from "../src/lib/catalogoUrl.ts";
import { debeVolverAtras } from "../src/lib/origenCatalogo.ts";

// Ids de los productos que cumplen la consulta
function buscarProductos(consulta: string): string[] {
  const grupos = prepararConsulta(consulta);
  return products.filter((p) => coincide(textoBusquedaProducto(p), grupos)).map((p) => p.id);
}

// Ids de las familias de combos que cumplen la consulta
function buscarCombos(consulta: string): string[] {
  const grupos = prepararConsulta(consulta);
  return FAMILIAS_COMBO.filter((f) => coincide(textoBusquedaCombo(f), grupos)).map((f) => f.id);
}

let pruebas = 0;
function prueba(nombre: string, fn: () => void) {
  fn();
  pruebas++;
  console.log(`  ok  ${nombre}`);
}

// ---------- normalización ----------
prueba("sin tildes ni mayúsculas", () => {
  assert.equal(normalizar("Sanitário"), "sanitario");
  assert.equal(normalizar("DESAGÜE"), "desague");
});

// ---------- consulta vacía ----------
prueba("vacía o con solo espacios no filtra nada", () => {
  assert.deepEqual(prepararConsulta(""), []);
  assert.deepEqual(prepararConsulta("   "), []);
  assert.equal(buscarProductos("   ").length, products.length);
});

// ---------- mayúsculas y tildes ----------
prueba("'Lavamanos' = 'lavamanos' = 'LAVAMANOS'", () => {
  const base = buscarProductos("lavamanos");
  assert.ok(base.length > 0);
  assert.deepEqual(buscarProductos("Lavamanos"), base);
  assert.deepEqual(buscarProductos("LAVAMANOS"), base);
});

prueba("'sanitario' = 'Sanitário' = 'SANITARIO'", () => {
  const base = buscarProductos("sanitario");
  assert.ok(base.length > 0);
  assert.deepEqual(buscarProductos("Sanitário"), base);
  assert.deepEqual(buscarProductos("SANITARIO"), base);
});

// ---------- sinónimo y plural ----------
prueba("'lavabo' encuentra los lavamanos (sinónimo)", () => {
  assert.deepEqual(buscarProductos("lavabo"), buscarProductos("lavamanos"));
});

prueba("plural: 'sanitarios' encuentra lo mismo que 'sanitario'", () => {
  assert.deepEqual(buscarProductos("sanitarios"), buscarProductos("sanitario"));
});

// ---------- varias palabras ----------
prueba("varias palabras: todas deben coincidir (y el orden no importa)", () => {
  const juntas = buscarProductos("lavamanos blanco");
  assert.ok(juntas.length > 0);
  assert.ok(juntas.length < buscarProductos("lavamanos").length);
  assert.deepEqual(buscarProductos("blanco lavamanos"), juntas);
  for (const id of juntas) assert.ok(id.startsWith("lavamanos"));
});

// ---------- campos: sku, categoría, descripción ----------
prueba("por sku (sin importar mayúsculas)", () => {
  const conSku = products.find((p) => p.sku);
  assert.ok(conSku?.sku);
  assert.ok(buscarProductos(conSku.sku.toLowerCase()).includes(conSku.id));
});

prueba("por categoría y por descripción", () => {
  assert.ok(buscarProductos("secadores").length > 0); // categoría "Secadores de manos"
  assert.ok(buscarProductos("cerámica").length > 0); // texto de la descripción
  assert.deepEqual(buscarProductos("ceramica"), buscarProductos("cerámica"));
});

// ---------- sin resultados ----------
prueba("sin resultados", () => {
  assert.deepEqual(buscarProductos("zzzxxx"), []);
  assert.deepEqual(buscarCombos("zzzxxx"), []);
  assert.deepEqual(buscarProductos("lavamanos zzzxxx"), []);
});

// ---------- combos ----------
prueba("combos: por nombre de familia (sin importar mayúsculas)", () => {
  assert.deepEqual(buscarCombos("lux-600"), ["lux-600"]);
  assert.deepEqual(buscarCombos("LUX-600"), ["lux-600"]);
});

prueba("combos: por etiqueta de pieza ('nogal ahumado')", () => {
  const ids = buscarCombos("nogal ahumado");
  assert.ok(ids.includes("lux-600"));
});

prueba("combos: la palabra 'combo' los encuentra todos", () => {
  assert.equal(buscarCombos("combo").length, FAMILIAS_COMBO.length);
});

prueba("combos: una búsqueda que no es de combos no los trae", () => {
  assert.deepEqual(buscarCombos("sauna"), []);
});

// ---------- URL ----------
prueba("urlCatalogo: categoría y búsqueda en la URL", () => {
  assert.equal(urlCatalogo(), "/catalogo");
  assert.equal(urlCatalogo("Todos"), "/catalogo");
  assert.equal(urlCatalogo("Combos"), "/catalogo?categoria=Combos");
  assert.equal(urlCatalogo(undefined, " sanitario "), "/catalogo?q=sanitario");
  assert.equal(urlCatalogo("Sanitarios", "sd"), "/catalogo?categoria=Sanitarios&q=sd");
  assert.equal(urlCatalogo("Todos", "   "), "/catalogo");
  // lo que sale de la URL vuelve igual (tildes, espacios)
  const url = new URL("http://x" + urlCatalogo("Dispensadores de jabón", "sanitário blanco"));
  assert.equal(url.searchParams.get("categoria"), "Dispensadores de jabón");
  assert.equal(url.searchParams.get("q"), "sanitário blanco");
});

prueba("volver al catálogo: atrás solo si la ficha se abrió desde el catálogo", () => {
  const origen = { url: "/catalogo?categoria=Combos", destino: "/productos/x" };
  assert.equal(debeVolverAtras(origen, "/productos/x"), true);
  assert.equal(debeVolverAtras(origen, "/productos/y"), false); // otra ficha: no es la que se abrió desde el catálogo
  assert.equal(debeVolverAtras(null, "/productos/x"), false); // entrada directa
});

console.log(`\n${pruebas} pruebas ok`);
