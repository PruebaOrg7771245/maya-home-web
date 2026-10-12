// src/lib/catalogoUrl.ts
//
// URLs del catálogo en un solo lugar. El catálogo vive en /catalogo; la
// categoría (o la pestaña de combos) elegida va en ?categoria=... y la búsqueda
// en ?q=... Se importa desde servidor y cliente (no depende del navegador).

// Nombre de la categoría de combos. Va al final de las categorías; "Todos" NO
// incluye combos (solo productos), salvo cuando hay una búsqueda.
export const PESTANA_COMBOS = "Combos";

// Opción que muestra todos los productos (no lleva parámetro en la URL)
export const PESTANA_TODOS = "Todos";

// Ruta del catálogo con la categoría y/o la búsqueda si se indican:
//   urlCatalogo("Combos")           → "/catalogo?categoria=Combos"
//   urlCatalogo(undefined, "sanit") → "/catalogo?q=sanit"
//   urlCatalogo("Sanitarios", "sd") → "/catalogo?categoria=Sanitarios&q=sd"
// Sin nada (o "Todos" y búsqueda vacía) → "/catalogo".
export function urlCatalogo(categoria?: string, q?: string): string {
  const params = new URLSearchParams();
  if (categoria && categoria !== PESTANA_TODOS) params.set("categoria", categoria);
  const consulta = q?.trim();
  if (consulta) params.set("q", consulta);
  const texto = params.toString();
  return texto ? `/catalogo?${texto}` : "/catalogo";
}
