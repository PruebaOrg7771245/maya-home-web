// scripts/test-cajas.ts
//
// Prueba de la lógica pura de la venta por cajas (calcularVentaPorMedida en
// src/lib/unidadVenta.ts, ADR-36) y de la cantidad escrita a mano (src/lib/cantidad.ts).
// Ejecutar con:  node scripts/test-cajas.ts   (Node 22.18+ ejecuta TypeScript directo)
// Termina con código 1 si alguna comprobación falla.

import assert from "node:assert/strict";
import {
  calcularVentaPorMedida,
  formatCentavos,
  detalleCajasCarrito,
  textoCajasPedido,
  textoMedida,
  avisoCajas,
} from "../src/lib/unidadVenta.ts";
import {
  CANTIDAD_MAXIMA,
  cantidadDesdeTexto,
  esCantidadValida,
  esTextoCantidad,
} from "../src/lib/cantidad.ts";
import { products } from "../src/data/products.ts";

const PRECIO_M2 = 54.3; // $54,30 por m², IVA incluido (como llega del ERP)
const CAJA = 1.37;

// 1) Ejemplos del ERP: m² pedidos -> [cajas, m² facturados en centésimas, total en centavos]
const casos: Array<[number, number, number, number]> = [
  [1, 1, 137, 7439],
  [2, 1, 137, 7439],
  [3, 2, 274, 14878],
  [13, 9, 1233, 66952],
  [14, 10, 1370, 74391],
  [20, 15, 2055, 111587], // 111586,5 centavos exactos: mitad hacia arriba
  [25, 18, 2466, 133904],
  [50, 36, 4932, 267808],
  [9999, 7299, 999963, 54297991],
];
for (const [m2, cajas, centesimas, centavos] of casos) {
  const calculo = calcularVentaPorMedida(m2, PRECIO_M2, CAJA);
  assert.deepEqual(
    calculo,
    { cantidadPedida: m2, cajas, medidaFacturadaCentesimas: centesimas, totalCentavos: centavos },
    `${m2} m²`
  );
  assert.ok(Number.isInteger(calculo.totalCentavos) && Number.isInteger(calculo.medidaFacturadaCentesimas));
}

// Textos con los importes exactos
assert.equal(formatCentavos(111587), "$1.115,87");
assert.equal(formatCentavos(133904), "$1.339,04");
assert.equal(textoMedida(1233), "12,33");
assert.equal(textoMedida(137), "1,37");
assert.equal(textoMedida(999963), "9.999,63");
const trece = calcularVentaPorMedida(13, PRECIO_M2, CAJA);
assert.equal(detalleCajasCarrito(trece, "m²"), "9 cajas · 12,33 m²");
assert.equal(formatCentavos(trece.totalCentavos), "$669,52");
assert.equal(
  textoCajasPedido(trece, "m²", PRECIO_M2),
  "13 m² pedidos → 9 cajas (12,33 m²) · $669,52 ($54,30 por m² IVA incluido)"
);
assert.equal(detalleCajasCarrito(calcularVentaPorMedida(1, PRECIO_M2, CAJA), "m²"), "1 caja · 1,37 m²");
assert.equal(formatCentavos(calcularVentaPorMedida(1, PRECIO_M2, CAJA).totalCentavos), "$74,39");
assert.equal(avisoCajas(CAJA, "m²"), "Se vende por cajas de 1,37 m². La cantidad se ajusta a cajas completas.");

// 2) Sin medidaPorCaja: cantidad × precio, igual que antes
assert.deepEqual(calcularVentaPorMedida(3, 479.1), {
  cantidadPedida: 3,
  cajas: null,
  medidaFacturadaCentesimas: 300,
  totalCentavos: 143730,
});
assert.equal(calcularVentaPorMedida(7, 0.1).totalCentavos, 70); // sin residuos de 0,1 × 7
assert.equal(calcularVentaPorMedida(2, PRECIO_M2, null).totalCentavos, 10860);

// 3) Datos: ambos bambúes por cajas de 1,37 m² y con "Contenido por caja"; nadie más
const porCajas = products.filter((p) => p.ventaPorMedida?.medidaPorCaja);
assert.deepEqual(porCajas.map((p) => p.id), ["piso-bambu-natural", "piso-bambu-carbonized"]);
for (const p of porCajas) {
  assert.equal(p.ventaPorMedida?.medidaPorCaja, 1.37);
  assert.ok(p.especificaciones?.some((e) => e.etiqueta === "Contenido por caja" && e.valor === "1,37 m²"));
}

// 4) Cantidad escrita: texto -> entero entre 1 y 9999
const textos: Array<[string, number]> = [
  ["", 1],
  ["0", 1],
  ["abc", 1],
  ["12abc", 1],
  ["-5", 1],
  ["1e3", 1],
  ["007", 7],
  ["10000", 9999],
  [" 12 ", 12],
  ["13", 13],
  ["9999", 9999],
];
for (const [texto, esperado] of textos) assert.equal(cantidadDesdeTexto(texto), esperado, JSON.stringify(texto));
// Mientras se escribe solo entran dígitos (o vacío)
assert.deepEqual(
  ["", "0", "007", "13", "abc", "12abc", "-5", "1e3", " 12 ", "1.5"].map(esTextoCantidad),
  [true, true, true, true, false, false, false, false, false, false]
);

// 5) Validación del servidor: entero de 1 a CANTIDAD_MAXIMA, nada más
assert.equal(CANTIDAD_MAXIMA, 9999);
for (const ok of [1, 13, 9999]) assert.equal(esCantidadValida(ok), true, String(ok));
for (const mal of [0, -1, -5, 1.5, 10000, Number.NaN, Infinity, "3", null, undefined, 1e3 + 0.5]) {
  assert.equal(esCantidadValida(mal), false, String(mal));
}

console.log("OK: todas las comprobaciones pasaron");
