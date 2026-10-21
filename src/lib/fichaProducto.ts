// src/lib/fichaProducto.ts
//
// Lógica PURA de la ficha de producto (sin React ni red; se prueba con
// scripts/test-ficha.ts): arma las filas de la tabla "Especificaciones" y elige
// las fotos a mostrar. Regla de la ficha: lo que no existe NO se muestra; aquí
// nunca se inventa ni se rellena un dato.

import { normalizar } from "./busqueda.ts";

// Foto que se usa cuando un producto no tiene ninguna
export const IMAGEN_PLACEHOLDER = "/images/products/placeholder.jpg";

// Una fila de la tabla de especificaciones
export type FilaFicha = { etiqueta: string; valor: string };

// Lo único que se lee del producto (tipos estructurales: no depende de data/products.ts)
type DatosFicha = {
  variants: { attribute: string; value: string }[];
  especificaciones?: { etiqueta: string; valor: string }[];
};

// "accionamiento" → "Accionamiento"
function conMayuscula(texto: string): string {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

// Filas de la tabla "Especificaciones", en este orden:
//   1. "Medidas": las variants con attribute "medidas" (varias se unen con ", ")
//   2. las filas de "especificaciones" (campo opcional)
//   3. el resto de variants (etiqueta = attribute con mayúscula inicial)
// Si dos filas tienen la misma etiqueta (sin importar mayúsculas ni tildes) se queda la
// primera. Las filas sin etiqueta o sin valor se descartan. [] = no se muestra el bloque.
export function filasEspecificaciones(producto: DatosFicha): FilaFicha[] {
  const filas: FilaFicha[] = [];
  const vistas = new Set<string>();
  const agregar = (etiqueta: string, valor: string) => {
    const e = etiqueta.trim();
    const v = valor.trim();
    if (!e || !v) return;
    const clave = normalizar(e);
    if (vistas.has(clave)) return;
    vistas.add(clave);
    filas.push({ etiqueta: e, valor: v });
  };

  // Variants agrupadas por atributo (el primero de cada uno fija el orden y el texto de la etiqueta)
  const porAtributo = new Map<string, { atributo: string; valores: string[] }>();
  for (const { attribute, value } of producto.variants) {
    const clave = normalizar(attribute.trim());
    const grupo = porAtributo.get(clave) ?? { atributo: attribute.trim(), valores: [] };
    if (value.trim()) grupo.valores.push(value.trim());
    porAtributo.set(clave, grupo);
  }

  const medidas = porAtributo.get("medidas");
  if (medidas?.valores.length) agregar("Medidas", medidas.valores.join(", "));
  for (const { etiqueta, valor } of producto.especificaciones ?? []) agregar(etiqueta, valor);
  for (const [clave, { atributo, valores }] of porAtributo) {
    if (clave !== "medidas" && valores.length) agregar(conMayuscula(atributo), valores.join(", "));
  }
  return filas;
}

// Una imagen del bloque "Detalles del producto"
export type DetalleFicha = { src: string; alt: string; width: number; height: number };

// Bloque "Características": las frases con texto (recortadas). [] = no se muestra el bloque.
export function caracteristicasProducto(caracteristicas?: string[]): string[] {
  return (caracteristicas ?? []).map((c) => c.trim()).filter((c) => c !== "");
}

// Bloque "Detalles del producto": solo las imágenes con ruta y medidas válidas (sin ellas no
// se puede reservar el espacio). [] = no se muestra el bloque.
export function detallesProducto(detalles?: DetalleFicha[]): DetalleFicha[] {
  return (detalles ?? []).filter(
    (d) => d.src.trim() !== "" && d.width > 0 && d.height > 0
  );
}

// ¿La imagen de detalle es vertical (alto mayor que el ancho en más de un 20 %)? Esas se
// muestran con altura máxima para que no ocupen más de una pantalla en escritorio.
export function esDetalleVertical(d: { width: number; height: number }): boolean {
  return d.height > d.width * 1.2;
}

// Fotos a mostrar: las del producto o, si no hay ninguna, el placeholder
export function fotosProducto(images: string[]): string[] {
  const fotos = images.filter((ruta) => ruta.trim() !== "");
  return fotos.length > 0 ? fotos : [IMAGEN_PLACEHOLDER];
}

// ¿La foto es el placeholder (no una foto real del producto)?
export function esPlaceholder(ruta: string): boolean {
  return ruta === IMAGEN_PLACEHOLDER;
}
