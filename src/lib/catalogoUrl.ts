// src/lib/catalogoUrl.ts
//
// URLs del catálogo en un solo lugar. El catálogo vive en /catalogo y la
// categoría (o la pestaña de combos) elegida va en ?categoria=...
// Se importa desde servidor y cliente (no depende de nada del navegador).

// Nombre de la pestaña de combos. Va al final de las categorías; "Todos" NO
// incluye combos (solo productos).
export const PESTANA_COMBOS = "Combos";

// Pestaña que muestra todos los productos (no lleva parámetro en la URL)
export const PESTANA_TODOS = "Todos";

// Ruta del catálogo, con la categoría elegida si se indica: urlCatalogo("Combos")
// → "/catalogo?categoria=Combos". Sin categoría (o "Todos") → "/catalogo".
export function urlCatalogo(categoria?: string): string {
  if (!categoria || categoria === PESTANA_TODOS) return "/catalogo";
  return `/catalogo?${new URLSearchParams({ categoria }).toString()}`;
}
