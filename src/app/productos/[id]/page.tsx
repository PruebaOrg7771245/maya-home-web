// src/app/productos/[id]/page.tsx
//
// Página de detalle de producto. La carpeta "[id]" entre corchetes le dice
// a Next.js que esta es una ruta DINÁMICA - "id" puede ser cualquier valor,
// ej: /productos/betonhome-pearl, /productos/tessino-black, etc.

import { notFound } from "next/navigation"; // función especial que muestra la página 404 de Next.js
import Link from "next/link";
import { products } from "@/data/products";
import ProductGallery from "@/components/ProductGallery";
import { formatPrice } from "@/lib/formatPrice";
import AddToCartButton from "@/components/AddToCartButton"; // nuevo botón interactivo
import StockBadge from "@/components/StockBadge"; // nuevo badge de disponibilidad
import AvisoSinPrecio from "@/components/AvisoSinPrecio"; // qué mostrar cuando el producto no tiene precio
import { getStock } from "@/lib/stock"; // adaptador de stock y precio (ADR-1)


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
// El stock y el precio vienen de stock_espejo, que se llena a mano con
// sync-stock.js: esto asegura que la página no muestre datos de hace días
// respecto de lo último que haya en la tabla.
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

  // Stock y precio reales (tabla stock_espejo). Se consulta por sku, el código
  // del ERP; si el producto no tiene sku, getStock() devuelve "coming_soon"
  // sin consultar nada.
  const stock = await getStock(product.sku);

  // Sin precio = no se puede vender: no se muestra precio ni botón de compra.
  // Agotado (con precio y sin existencias) SÍ se puede agregar, con aviso.
  const precio = stock.precio;
  const agotado = stock.status === "out_of_stock";

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

            {/* Badge de disponibilidad, justo debajo del nombre. Sin precio no
                mostramos el estado de stock (diría "En stock" de algo que no se
                vende): va el aviso "Próximamente" / "No disponible por ahora" */}
            <div className="mt-3">
              {precio !== null ? <StockBadge stock={stock} /> : <AvisoSinPrecio stock={stock} />}
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

            {/* Precio y botón de compra solo si el producto tiene precio */}
            {precio !== null && (
              <>
                <div className="mt-8 border-t border-[#D8D4CC] pt-6">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-[#6B6862]">Precio (IVA incluido)</span>
                    <span className="text-xl font-semibold text-[#232320]">
                      {formatPrice(precio)}
                    </span>
                  </div>
                </div>

                {/* Componente interactivo (cliente): botón "Agregar al pedido" / selector de
                    cantidad. Si está agotado igual se puede agregar, con aviso debajo */}
                <AddToCartButton
                  id={product.id}
                  name={product.name}
                  image={product.images[0]}
                  price={precio}
                  agotado={agotado}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

