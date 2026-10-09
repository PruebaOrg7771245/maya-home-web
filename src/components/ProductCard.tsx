// src/components/ProductCard.tsx
//
// Este componente muestra UNA tarjeta de producto dentro del grid del catálogo.
// Recibe el producto como "prop" (dato de entrada) y solo se encarga de mostrarlo,
// no maneja lógica de filtrado ni de carrito - eso vive en el componente padre.

import Image from "next/image"; // componente optimizado de imágenes de Next.js (comprime y hace lazy-load automático)
import Link from "next/link"; // componente para navegación sin recargar la página completa
import type { Product } from "@/data/products"; // importamos el tipo TypeScript para tener autocompletado y validación
import type { StockInfo } from "@/lib/stock"; // solo el TIPO: no arrastra el cliente de servidor al navegador
import AvisoSinPrecio from "@/components/AvisoSinPrecio"; // qué mostrar cuando el producto no tiene precio
import { formatPrice } from "@/lib/formatPrice";

// Definimos qué props (propiedades) recibe este componente
type ProductCardProps = {
  product: Product; // un solo producto, con la forma que ya definimos en products.ts
  stock: StockInfo; // stock y precio del ERP (precio con IVA incluido; null = no se puede vender)
};

// Componente principal - recibe "product" desestructurado directamente de las props
export default function ProductCard({ product, stock }: ProductCardProps) {
  const precio = stock.precio; // null = producto sin precio: no se muestra precio y no se vende

  return (
    // Contenedor de la tarjeta completa - Link envuelve todo para que la tarjeta sea clickeable
    <Link
      href={`/productos/${product.id}`} // navega a la página de detalle usando el id del producto
      className="group block border border-[#D8D4CC] bg-white transition-colors hover:border-[#A8562E]"
      // "group" permite que los hijos reaccionen al hover del padre (usado abajo en la imagen)
    >
      {/* Contenedor de la imagen con proporción fija para que el grid quede alineado */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#EFEDE7]">
        <Image
          src={product.images[0]} // usamos la primera imagen del arreglo como foto principal
          alt={product.name} // texto alternativo para accesibilidad y SEO
          fill // hace que la imagen llene el contenedor padre (que tiene position: relative)
          sizes="(max-width: 768px) 50vw, 25vw" // ayuda a Next.js a servir el tamaño de imagen correcto según pantalla
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          // object-cover recorta la imagen sin deformarla; el scale da un leve zoom al pasar el mouse
        />
      </div>

      {/* Contenido de texto debajo de la imagen */}
      <div className="p-4">
        {/* Categoría/subcategoría en texto pequeño y discreto */}
        <p className="text-xs text-[#6B6862]">
          {product.subcategory ?? product.category}
          {/* si no tiene subcategoría, mostramos la categoría general */}
        </p>

        {/* Nombre del producto - usa la tipografía de headings */}
        <h3 className="mt-1 font-[var(--font-heading)] text-lg font-semibold text-[#232320]">
          {product.name}
        </h3>

        {/* Lista de formatos disponibles, como pequeñas etiquetas separadas por punto */}
        <p className="mt-1 text-sm text-[#6B6862]">
          {product.variants.map((v) => v.value).join(" · ")}
          {/* ej: "60x120 · 80x160" si tuviera más de un formato */}
        </p>

        {/* Línea divisoria fina antes del precio (o del aviso, si no hay precio) */}
        <div className="mt-3 border-t border-[#D8D4CC] pt-3">
          {precio !== null ? (
            // Un solo precio: el precio público del ERP (IVA incluido). El mayorista ya no se muestra.
            // Apilado (etiqueta arriba, precio abajo) porque en el grid de 2 columnas
            // del móvil la etiqueta larga y el precio no caben en la misma línea.
            <div>
              <p className="text-xs text-[#6B6862]">Precio (IVA incluido)</p>
              <p className="mt-0.5 text-base font-semibold text-[#232320]">
                {formatPrice(precio)}
              </p>
            </div>
          ) : (
            // Sin precio: no se muestra precio. "Próximamente" si no tiene sku,
            // "No disponible por ahora" si tiene sku pero no precio
            <AvisoSinPrecio stock={stock} />
          )}
        </div>
      </div>
    </Link>
  );
}
