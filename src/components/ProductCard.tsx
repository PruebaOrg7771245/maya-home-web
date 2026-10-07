// src/components/ProductCard.tsx
//
// Este componente muestra UNA tarjeta de producto dentro del grid del catálogo.
// Recibe el producto como "prop" (dato de entrada) y solo se encarga de mostrarlo,
// no maneja lógica de filtrado ni de carrito - eso vive en el componente padre.

import Image from "next/image"; // componente optimizado de imágenes de Next.js (comprime y hace lazy-load automático)
import Link from "next/link"; // componente para navegación sin recargar la página completa
import type { Product } from "@/data/products"; // importamos el tipo TypeScript para tener autocompletado y validación

// Definimos qué props (propiedades) recibe este componente
type ProductCardProps = {
  product: Product; // un solo producto, con la forma que ya definimos en products.ts
  precio: number | null; // precio público del ERP (IVA incluido) - null si no hay precio cargado
};

// Función auxiliar: formatea un precio a texto legible, o muestra "Consultar precio" si es null
function formatPrice(price: number | null): string {
  if (price === null) {
    return "Consultar precio"; // caso cuando el cliente aún no definió el precio
  }
  // Intl.NumberFormat da formato de moneda correcto (ej: $25.00) sin tener que armarlo a mano
  return new Intl.NumberFormat("es-EC", {
    style: "currency",
    currency: "USD", // Ecuador usa USD como moneda oficial
  }).format(price);
}

// Componente principal - recibe "product" desestructurado directamente de las props
export default function ProductCard({ product, precio }: ProductCardProps) {
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

        {/* Línea divisoria fina antes del precio */}
        <div className="mt-3 border-t border-[#D8D4CC] pt-3">
          {/* Un solo precio: el precio público del ERP (IVA incluido). El mayorista ya no se muestra */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#6B6862]">Precio (IVA incl.)</span>
            <span className="font-medium text-[#232320]">
              {formatPrice(precio)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
