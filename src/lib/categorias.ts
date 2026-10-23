// src/lib/categorias.ts
//
// Orden de las opciones del catálogo, para la cinta de /catalogo (ADR-33):
// "Todos", las categorías de los productos y "Combos lavamanos" al final.
// Se calcula con los datos estáticos: no hay consultas. Sin cantidades (ya no
// se muestran en ningún sitio).

import { categories } from "@/data/products";
import { PESTANA_COMBOS, PESTANA_TODOS } from "@/lib/catalogoUrl";

export function categoriasCatalogo(): string[] {
  return [PESTANA_TODOS, ...categories, PESTANA_COMBOS];
}
