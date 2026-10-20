// scripts/test-ficha.ts
//
// Prueba de la lógica pura de la ficha de producto (src/lib/fichaProducto.ts) sobre el
// catálogo real. Ejecutar con:  node scripts/test-ficha.ts   (Node 22.18+ ejecuta TypeScript directo)
// Termina con código 1 si alguna comprobación falla.

import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { products } from "../src/data/products.ts";
import { normalizar } from "../src/lib/busqueda.ts";
import {
  caracteristicasProducto,
  detallesProducto,
  IMAGEN_PLACEHOLDER,
  esPlaceholder,
  filasEspecificaciones,
  fotosProducto,
} from "../src/lib/fichaProducto.ts";

let pruebas = 0;
function prueba(nombre: string, fn: () => void) {
  fn();
  pruebas++;
  console.log(`  ok  ${nombre}`);
}

const producto = (id: string) => products.find((p) => p.id === id)!;

// ---------- especificaciones ----------
prueba("'medidas' de variants es la fila 'Medidas', primera", () => {
  // la fila "Medidas" sale de variants (500 x 350 x 120 mm); la del JSON (en cm) se descarta por repetida
  assert.deepEqual(filasEspecificaciones(producto("lavamanos-9636")), [
    { etiqueta: "Medidas", valor: "500 x 350 x 120 mm" },
    { etiqueta: "Material", valor: "Cerámica" },
    { etiqueta: "Instalación", valor: "Sobre mesón" },
    { etiqueta: "Color", valor: "Blanco" },
  ]);
});

prueba("las demás variants son filas con la etiqueta en mayúscula inicial", () => {
  const filas = filasEspecificaciones({
    variants: [
      { attribute: "medidas", value: "120 x 100 x 200" },
      { attribute: "vidrio", value: "6 mm" },
    ],
  });
  assert.deepEqual(filas, [
    { etiqueta: "Medidas", valor: "120 x 100 x 200" },
    { etiqueta: "Vidrio", valor: "6 mm" },
  ]);
  // sin "medidas": solo las demás variants, en el orden en que están escritas
  assert.deepEqual(
    filasEspecificaciones({
      variants: [
        { attribute: "accionamiento", value: "Manual" },
        { attribute: "material", value: "Plástico blanco" },
      ],
    }),
    [
      { etiqueta: "Accionamiento", valor: "Manual" },
      { etiqueta: "Material", valor: "Plástico blanco" },
    ]
  );
});

prueba("'especificaciones' van entre Medidas y las demás variants; no se repite una etiqueta", () => {
  const filas = filasEspecificaciones({
    variants: [
      { attribute: "material", value: "Acero" },
      { attribute: "medidas", value: "60 cm" },
    ],
    especificaciones: [
      { etiqueta: "Garantía", valor: "12 meses" },
      { etiqueta: "MATERIAL", valor: "Acero antimanchas" }, // gana frente a la variante "material"
      { etiqueta: "Medidas", valor: "otra" }, // las medidas salen de variants: esta se descarta
    ],
  });
  assert.deepEqual(filas, [
    { etiqueta: "Medidas", valor: "60 cm" },
    { etiqueta: "Garantía", valor: "12 meses" },
    { etiqueta: "MATERIAL", valor: "Acero antimanchas" },
  ]);
});

prueba("sin datos no hay filas (el bloque no se muestra); vacíos se descartan", () => {
  assert.deepEqual(filasEspecificaciones({ variants: [] }), []);
  assert.deepEqual(
    filasEspecificaciones({
      variants: [{ attribute: "medidas", value: "  " }],
      especificaciones: [{ etiqueta: "", valor: "x" }, { etiqueta: "y", valor: "" }],
    }),
    []
  );
});

prueba("varias variants del mismo atributo se unen en una fila", () => {
  assert.deepEqual(
    filasEspecificaciones({
      variants: [
        { attribute: "color", value: "Blanco" },
        { attribute: "color", value: "Negro" },
      ],
    }),
    [{ etiqueta: "Color", valor: "Blanco, Negro" }]
  );
});

// ---------- fotos ----------
prueba("fotos: las del producto; sin ninguna, el placeholder", () => {
  assert.deepEqual(fotosProducto(["/a.jpg", "/b.jpg"]), ["/a.jpg", "/b.jpg"]);
  assert.deepEqual(fotosProducto([]), [IMAGEN_PLACEHOLDER]);
  assert.deepEqual(fotosProducto(["", "  "]), [IMAGEN_PLACEHOLDER]);
  assert.ok(esPlaceholder(IMAGEN_PLACEHOLDER) && !esPlaceholder("/a.jpg"));
});

prueba("catálogo real: toda foto existe en public/ y todo producto tiene al menos una", () => {
  for (const p of products) {
    const fotos = fotosProducto(p.images);
    assert.ok(fotos.length >= 1);
    for (const ruta of fotos) {
      assert.ok(existsSync(new URL(`../public${ruta}`, import.meta.url)), `falta ${ruta} (${p.id})`);
    }
  }
});

// ---------- características y detalles ----------
prueba("características: se recortan y se descartan las vacías; sin datos, []", () => {
  assert.deepEqual(caracteristicasProducto([" a ", "", "  ", "b"]), ["a", "b"]);
  assert.deepEqual(caracteristicasProducto([]), []);
  assert.deepEqual(caracteristicasProducto(undefined), []);
});

prueba("detalles: se descartan los que no tienen ruta o medidas; sin datos, []", () => {
  const ok = { src: "/a.jpg", alt: "a", width: 10, height: 5 };
  assert.deepEqual(detallesProducto([ok, { ...ok, src: " " }, { ...ok, width: 0 }, { ...ok, height: 0 }]), [ok]);
  assert.deepEqual(detallesProducto(undefined), []);
});

prueba("168W: foto principal sola; 8 características; 2 detalles con medidas reales", () => {
  const p = producto("sanitario-168w");
  assert.deepEqual(p.images, ["/images/products/sanitario-168w.jpg"]);
  assert.equal(caracteristicasProducto(p.caracteristicas).length, 8);
  assert.equal(p.caracteristicas?.[0], "Conexión 1/2 por la parte posterior"); // tal cual del JSON (unidad sin confirmar)
  const detalles = detallesProducto(p.detalles);
  assert.equal(detalles.length, 2);
  for (const d of detalles) {
    assert.ok(existsSync(new URL(`../public${d.src}`, import.meta.url)), `falta ${d.src}`);
    assert.ok(d.alt.trim() !== "");
  }
  assert.deepEqual([detalles[0].width, detalles[0].height], [1536, 1024]);
  assert.deepEqual([detalles[1].width, detalles[1].height], [1227, 1282]);
});

prueba("solo el 168W tiene imágenes de detalle", () => {
  for (const p of products.filter((p) => p.id !== "sanitario-168w")) {
    assert.equal(detallesProducto(p.detalles).length, 0, p.id);
  }
});

// ---------- contenido de las fichas (viene de fichas-productos.json) ----------
const sinRepetidos = (textos: string[]) =>
  new Set(textos.map((t) => normalizar(t))).size === textos.length;

prueba("los 25 productos tienen descripción no vacía", () => {
  assert.equal(products.length, 25);
  for (const p of products) assert.ok(p.description.trim() !== "", `${p.id}: sin descripción`);
});

prueba("características y especificaciones: sin textos vacíos ni repetidos", () => {
  for (const p of products) {
    const car = p.caracteristicas ?? [];
    const esp = p.especificaciones ?? [];
    assert.ok(car.length > 0 && esp.length > 0, `${p.id}: faltan características o especificaciones`);
    assert.ok(car.every((c) => c.trim() !== ""), `${p.id}: característica vacía`);
    assert.ok(esp.every((e) => e.etiqueta.trim() !== "" && e.valor.trim() !== ""), `${p.id}: especificación vacía`);
    assert.ok(sinRepetidos(car), `${p.id}: características repetidas`);
    assert.ok(sinRepetidos(esp.map((e) => e.etiqueta)), `${p.id}: etiquetas repetidas`);
    // la tabla que se ve en la ficha tampoco repite etiquetas
    const filas = filasEspecificaciones(p).map((f) => f.etiqueta);
    assert.ok(sinRepetidos(filas), `${p.id}: filas repetidas en la tabla`);
  }
});

prueba("los 5 nombres cambiados coinciden con el JSON", () => {
  const esperados: Record<string, string> = {
    "SD-1001": "Sanitario SD-1001 con bidet · blanco",
    "SD-1001MB": "Sanitario SD-1001 con bidet · negro mate",
    "KW-7501GUNGREY": "Barra de seguridad · acero antimanchas",
    "SN96129-1200": "Sauna · 120 × 100 × 200 cm",
    "SN96137-1350": "Sauna infrarrojo de espectro completo · 135 × 110 × 210 cm",
  };
  for (const [sku, nombre] of Object.entries(esperados)) {
    assert.equal(products.find((p) => p.sku === sku)?.name, nombre, sku);
  }
});

// ---------- resumen: qué bloques tiene cada producto ----------
const conMiniaturas = products.filter((p) => fotosProducto(p.images).length > 1).map((p) => p.id);
const sinDescripcion = products.filter((p) => !p.description.trim()).map((p) => p.id);
const sinTabla = products.filter((p) => filasEspecificaciones(p).length === 0).map((p) => p.id);
const conExtra = products.filter((p) => (p.especificaciones ?? []).length > 0).map((p) => p.id);
const conMedidas = products.filter((p) => filasEspecificaciones(p)[0]?.etiqueta === "Medidas").length;
console.log(`\nProductos: ${products.length}`);
console.log(`  con miniaturas (más de una foto): ${conMiniaturas.length} ${JSON.stringify(conMiniaturas)}`);
console.log(`  sin bloque Descripción: ${sinDescripcion.length} ${JSON.stringify(sinDescripcion)}`);
console.log(`  sin bloque Especificaciones: ${sinTabla.length} ${JSON.stringify(sinTabla)}`);
console.log(`  con fila Medidas: ${conMedidas}`);
console.log(`  con campo 'especificaciones': ${conExtra.length}`);
console.log(`\n${pruebas} pruebas ok`);
