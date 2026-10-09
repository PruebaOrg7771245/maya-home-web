// src/components/CatalogoConFiltro.tsx
//
// Parte interactiva de la página principal. Es un "client component" porque
// maneja estado en el navegador (cuál categoría está seleccionada). El stock
// y el precio llegan YA resueltos por props desde src/app/page.tsx (server
// component) - este archivo nunca consulta el stock por su cuenta (ADR-1).

"use client"; // le dice a Next.js que este archivo se ejecuta en el navegador, no en el servidor

import { useState, useMemo } from "react"; // hooks de React para manejar estado y cálculos memorizados
import { products, categories } from "@/data/products"; // nuestros datos del catálogo
import ProductCard from "@/components/ProductCard"; // tarjeta individual de producto
import CategoryFilter from "@/components/CategoryFilter"; // filtro de categorías
import ComboCard, { type ComboCardData } from "@/components/ComboCard"; // tarjeta de una familia de combos
import type { StockInfo } from "@/lib/stock"; // solo el TIPO: no arrastra el cliente de servidor al navegador

type CatalogoConFiltroProps = {
  // stock y precio del ERP de cada producto, indexados por product.id
  stockPorId: Record<string, StockInfo>;
  // una entrada por familia de combos, ya con su "Desde $X" calculado en el servidor
  combos: ComboCardData[];
};

// Nombre de la pestaña de combos. Va al final de las categorías; "Todos" NO
// incluye combos (solo productos).
const PESTANA_COMBOS = "Combos";

// Respaldo por si algún producto no llegara en el mapa (no debería pasar:
// page.tsx arma una entrada por producto). Sin precio = no se puede vender.
const STOCK_DESCONOCIDO: StockInfo = { status: "unknown", quantity: null, precio: null };

export default function CatalogoConFiltro({ stockPorId, combos }: CatalogoConFiltroProps) {
  // Estado que guarda qué categoría está seleccionada actualmente. Empieza en "Todos".
  const [activeCategory, setActiveCategory] = useState("Todos");

  // ¿Está elegida la pestaña de combos? Entonces el grid muestra familias, no productos
  const verCombos = activeCategory === PESTANA_COMBOS;

  // Categorías del filtro: las de los productos + "Combos" al final
  const categoriasConCombos = useMemo(() => [...categories, PESTANA_COMBOS], []);

  // useMemo evita recalcular el filtrado en cada render si "activeCategory" no cambió,
  // mejora el rendimiento cuando el catálogo crezca a cientos de productos
  const filteredProducts = useMemo(() => {
    if (activeCategory === "Todos") {
      return products; // sin filtro, mostramos todo el catálogo
    }
    // filter() devuelve solo los productos cuya categoría coincide con la seleccionada
    return products.filter((p) => p.category === activeCategory);
  }, [activeCategory]); // se vuelve a calcular solo cuando "activeCategory" cambia

  return (
    // Quitamos el <header> que estaba aquí antes - ahora ese contenido
    // (título, subtítulo) vive en el componente Header.tsx global.
    // Esta página empieza directo con el contenido del catálogo.
    <main className="min-h-screen bg-[#EFEDE7]">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <CategoryFilter
          categories={categoriasConCombos}
          active={activeCategory}
          onChange={setActiveCategory}
        />

        {/* Mismo grid para productos y para combos (5 tarjetas, una por familia) */}
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {verCombos
            ? combos.map((combo) => <ComboCard key={combo.id} combo={combo} />)
            : filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  stock={stockPorId[product.id] ?? STOCK_DESCONOCIDO}
                />
              ))}
        </div>

        {!verCombos && filteredProducts.length === 0 && (
          <p className="mt-12 text-center text-[#6B6862]">
            No hay productos en esta categoría todavía.
          </p>
        )}

        {verCombos && combos.length === 0 && (
          <p className="mt-12 text-center text-[#6B6862]">
            Todavía no hay combos disponibles. Vuelve pronto o consulta con tu asesor.
          </p>
        )}
      </div>
    </main>
  );
}
