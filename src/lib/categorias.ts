// src/lib/categorias.ts
//
// Lista de categorías del catálogo con su cantidad, para el menú desplegable
// (cabecera y /catalogo). Se calcula con los datos estáticos: no hay consultas.

import { products, categories } from "@/data/products";
import { FAMILIAS_COMBO } from "@/data/combos";
import { PESTANA_COMBOS, PESTANA_TODOS } from "@/lib/catalogoUrl";

export type OpcionCategoria = {
  nombre: string; // texto del menú y valor de ?categoria=
  cantidad: number; // productos de la categoría (en Combos, familias de combos)
};

// "Todos" + las categorías de los productos + "Combos" al final
export function opcionesCategorias(): OpcionCategoria[] {
  return [
    { nombre: PESTANA_TODOS, cantidad: products.length },
    ...categories.map((nombre) => ({
      nombre,
      cantidad: products.filter((p) => p.category === nombre).length,
    })),
    { nombre: PESTANA_COMBOS, cantidad: FAMILIAS_COMBO.length },
  ];
}
