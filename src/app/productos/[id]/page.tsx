// src/app/productos/[id]/page.tsx
//
// Página de detalle de producto. La carpeta "[id]" entre corchetes le dice
// a Next.js que esta es una ruta DINÁMICA - "id" puede ser cualquier valor,
// ej: /productos/betonhome-pearl, /productos/tessino-black, etc.

import { notFound } from "next/navigation"; // función especial que muestra la página 404 de Next.js
import Link from "next/link";
import { products } from "@/data/products";
import ProductGallery from "@/components/ProductGallery";
import AddToCartButton from "@/components/AddToCartButton"; // nuevo botón interactivo
import StockBadge from "@/components/StockBadge"; // nuevo badge de disponibilidad
import { getStock } from "@/lib/stock"; // nueva función desacoplada de stock


// Formatea el precio igual que en ProductCard - si es null, muestra "Consultar precio"
function formatPrice(price: number | null): string {
  if (price === null) {
    return "Consultar precio";
  }
  return new Intl.NumberFormat("es-EC", {
    style: "currency",
    currency: "USD",
  }).format(price);
}

// generateStaticParams le dice a Next.js, al momento de hacer el build,
// TODAS las páginas de producto que existen - así se generan como HTML
// estático de antemano (más rápido) en vez de generarse en cada visita
export async function generateStaticParams() {
  // Devolvemos un arreglo de objetos { id: "..." } - uno por cada producto
  return products.map((product) => ({
    id: product.id,
  }));
}

// revalidate = 60 le dice a Next.js que puede volver a generar esta página
// como máximo cada 60 segundos, en vez de dejarla 100% estática para siempre.
// No importa mucho hoy (el stock es un valor fijo), pero en cuanto conectemos
// el stock real, esto asegura que la página no muestre datos de hace días.
export const revalidate = 60;

// En Next.js 15+, "params" llega como una Promise, por eso la función
// es "async" y usamos "await" para obtener el valor real de adentro
export default async function ProductoPage({
  params,
}: {
  params: Promise<{ id: string }>; // el tipo indica que params es una promesa que resuelve a un objeto con "id"
}) {
  const { id } = await params; // desempaquetamos el id ya resuelto

  // Buscamos el producto cuyo id coincide con el de la URL
  const product = products.find((p) => p.id === id);

  // Si no se encuentra el producto (ej: alguien entra a una URL inválida),
  // mostramos automáticamente la página 404 de Next.js
  if (!product) {
    notFound();
  }

  // Consultamos el stock de este producto - hoy devuelve el placeholder "unknown"
  const stock = await getStock(product.id);

  return (
    <main className="min-h-screen bg-[#EFEDE7]">
      <div className="border-b border-[#D8D4CC] bg-white px-6 py-3">
        <Link href="/" className="text-sm text-[#6B6862] hover:text-[#232320]">
          ← Volver al catálogo
        </Link>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
          <ProductGallery images={product.images} productName={product.name} />

          <div>
            <p className="text-sm text-[#6B6862]">
              {product.subcategory ?? product.category}
              {product.brand && ` · ${product.brand}`}
            </p>

            <h1 className="mt-2 font-[var(--font-heading)] text-3xl font-bold text-[#232320]">
              {product.name}
            </h1>

            {/* Badge de disponibilidad, justo debajo del nombre */}
            <div className="mt-3">
              <StockBadge stock={stock} />
            </div>

            <p className="mt-4 text-base leading-relaxed text-[#6B6862]">
              {product.description}
            </p>

            <div className="mt-6">
              <p className="text-sm font-medium text-[#232320]">Formatos disponibles</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {product.variants.map((variant) => (
                  <span
                    key={variant.value}
                    className="border border-[#D8D4CC] bg-white px-3 py-1 text-sm text-[#232320]"
                  >
                    {variant.value}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-8 border-t border-[#D8D4CC] pt-6">
              <div className="flex items-center justify-between">
                <span className="text-[#6B6862]">Precio minorista</span>
                <span className="text-xl font-semibold text-[#232320]">
                  {formatPrice(product.prices.minorista)}
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-[#6B6862]">Precio mayorista</span>
                <span className="text-xl font-semibold text-[#232320]">
                  {formatPrice(product.prices.mayorista)}
                </span>
              </div>
            </div>

            {/* Reemplazamos el <button> estático por el componente interactivo,
                pasándole los datos del producto que necesita para agregarse al carrito */}
            <AddToCartButton
              id={product.id}
              name={product.name}
              image={product.images[0]}
              price={product.prices.minorista}
            />
          </div>
        </div>
      </div>
    </main>
  );
}

