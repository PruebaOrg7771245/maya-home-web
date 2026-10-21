// src/app/productos/[id]/page.tsx
//
// Página de detalle de producto. La carpeta "[id]" entre corchetes le dice
// a Next.js que esta es una ruta DINÁMICA - "id" puede ser cualquier valor,
// ej: /productos/betonhome-pearl, /productos/tessino-black, etc.

import { notFound } from "next/navigation"; // función especial que muestra la página 404 de Next.js
import VolverAlCatalogo from "@/components/VolverAlCatalogo"; // "atrás" al mismo filtro del catálogo
import { urlCatalogo } from "@/lib/catalogoUrl";
import { products } from "@/data/products";
import ProductGallery from "@/components/ProductGallery";
import { formatPrice } from "@/lib/formatPrice";
import AddToCartButton from "@/components/AddToCartButton"; // nuevo botón interactivo
import StockBadge from "@/components/StockBadge"; // nuevo badge de disponibilidad
import AvisoSinPrecio from "@/components/AvisoSinPrecio"; // qué mostrar cuando el producto no tiene precio
import { getStock } from "@/lib/stock"; // adaptador de stock y precio (ADR-1)
import {
  caracteristicasProducto,
  detallesProducto,
  esDetalleVertical,
  filasEspecificaciones,
  fotosProducto,
} from "@/lib/fichaProducto"; // bloques de la ficha y fotos (con placeholder)
import Image from "next/image";
import BotonWhatsApp from "@/components/BotonWhatsApp";


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

  // Bloques de información: cada uno aparece SOLO si tiene contenido (no se muestran
  // títulos vacíos ni "pendiente"). "Medidas" es la primera fila de la tabla.
  const fotos = fotosProducto(product.images);
  const descripcion = product.description.trim();
  const filas = filasEspecificaciones(product);
  const caracteristicas = caracteristicasProducto(product.caracteristicas);
  const detalles = detallesProducto(product.detalles);

  return (
    <main className="min-h-screen bg-[#EFEDE7]">
      <div className="border-b border-[#D8D4CC] bg-white px-6 py-3">
        <VolverAlCatalogo
          hrefPorDefecto={urlCatalogo(product.category)} // sin historial: catálogo de la categoría del producto
          className="text-sm text-[#6B6862] hover:text-[#232320]"
        />
      </div>

      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
          <ProductGallery images={fotos} productName={product.name} />

          {/* min-w-0: un texto largo no debe ensanchar la columna del grid (scroll horizontal a 320 px) */}
          <div className="min-w-0">
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

            {/* Descripción: va ANTES del precio */}
            {descripcion && (
              <section aria-labelledby="titulo-descripcion" className="mt-6">
                <h2 id="titulo-descripcion" className="sr-only">
                  Descripción
                </h2>
                <p className="break-words text-base leading-relaxed text-[#6B6862]">
                  {descripcion}
                </p>
              </section>
            )}

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
                  image={fotos[0]}
                  price={precio}
                  agotado={agotado}
                />
              </>
            )}

          </div>
        </div>

        {/* Bloques a ancho completo, cada uno solo si tiene contenido */}
        {caracteristicas.length > 0 && (
          <section aria-labelledby="titulo-caracteristicas" className="mt-12 border-t border-[#D8D4CC] pt-8">
            <h2 id="titulo-caracteristicas" className="font-[var(--font-heading)] text-xl font-semibold text-[#232320]">
              Características
            </h2>
            <ul className="mt-4 grid gap-x-10 gap-y-3 md:grid-cols-2">
              {caracteristicas.map((c) => (
                <li key={c} className="flex gap-3 break-words text-base leading-relaxed text-[#232320]">
                  {/* Marca cuadrada (sin radios) en acento: único punto de color del bloque */}
                  <span aria-hidden="true" className="mt-2.5 h-1.5 w-1.5 shrink-0 bg-[#A8562E]" />
                  <span className="min-w-0">{c}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {filas.length > 0 && (
          <section aria-labelledby="titulo-especificaciones" className="mt-12 border-t border-[#D8D4CC] pt-8">
            <h2 id="titulo-especificaciones" className="font-[var(--font-heading)] text-xl font-semibold text-[#232320]">
              Especificaciones
            </h2>
            {/* Tabla a ancho completo: etiqueta a la izquierda, valor a la derecha */}
            <dl className="mt-4 border border-[#D8D4CC] bg-white">
              {filas.map((fila) => (
                <div
                  key={fila.etiqueta}
                  className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-4 border-t border-[#D8D4CC] px-4 py-3 text-sm first:border-t-0"
                >
                  <dt className="break-words text-[#6B6862]">{fila.etiqueta}</dt>
                  <dd className="break-words text-[#232320]">{fila.valor}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        {detalles.length > 0 && (
          <section aria-labelledby="titulo-detalles" className="mt-12 border-t border-[#D8D4CC] pt-8">
            <h2 id="titulo-detalles" className="font-[var(--font-heading)] text-xl font-semibold text-[#232320]">
              Detalles del producto
            </h2>
            <ul className="mt-4 flex flex-col gap-6">
              {detalles.map((d) => (
                <li key={d.src}>
                  {/* Enlace a la imagen completa en pestaña nueva (para leerla en móvil). Sin zoom ni lightbox. */}
                  <a
                    href={d.src}
                    target="_blank"
                    rel="noopener"
                    aria-label={`Ver imagen completa: ${d.alt}`}
                    className="block border border-[#D8D4CC] bg-white motion-safe:transition-colors hover:border-[#A8562E]"
                  >
                    <Image
                      src={d.src}
                      alt={d.alt}
                      width={d.width}
                      height={d.height}
                      sizes="(max-width: 1023px) calc(100vw - 50px), 974px"
                      className={
                        esDetalleVertical(d)
                          ? "h-auto max-h-[80vh] w-full object-contain"
                          : "h-auto w-full"
                      }
                    />
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
      <BotonWhatsApp producto={product.name} />
    </main>
  );
}

