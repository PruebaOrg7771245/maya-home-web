// src/app/page.tsx
//
// Página de inicio ("/"), de arriba abajo:
//   1. Portada (hero) a ancho completo (src/data/portada.ts, componente Portada).
//   2. Catálogo resumido: una sección por categoría con hasta 4 productos
//      vendibles, disponibles primero (regla en src/lib/resumenCatalogo.ts,
//      ADR-31) y un enlace "Ver todos" al catálogo filtrado. Sin combos.
//   3. Un enlace de texto discreto al catálogo completo.
//
// Server component con ISR, igual que /catalogo: stock y precio de todos los
// productos con UNA sola llamada a getStockPorSkus().

import Link from "next/link";
import { sitio } from "@/data/sitio";
import { products } from "@/data/products";
import { getStockPorSkus, type StockInfo } from "@/lib/stock";
import { seccionesResumen } from "@/lib/resumenCatalogo";
import { urlCatalogo } from "@/lib/catalogoUrl";
import Portada from "@/components/Portada";
import ProductCard from "@/components/ProductCard";
import BotonWhatsApp from "@/components/BotonWhatsApp";

// Mismo margen que /catalogo: la tabla stock_espejo solo cambia al correr sync-stock.js
export const revalidate = 60;

export default async function PortadaPage() {
  const skus = products.flatMap((p) => (p.sku ? [p.sku] : []));
  const stockPorSku = await getStockPorSkus([...new Set(skus)]); // UNA sola consulta

  const sinSku: StockInfo = { status: "coming_soon", quantity: null, precio: null };
  const stockPorId: Record<string, StockInfo> = {};
  for (const product of products) {
    stockPorId[product.id] = product.sku ? stockPorSku[product.sku] ?? sinSku : sinSku;
  }

  const secciones = seccionesResumen(products, stockPorId);

  return (
    <main>
      {/* El texto de la portada va dentro de la imagen: el h1 queda para lectores de pantalla */}
      <h1 className="sr-only">{sitio.nombre}</h1>
      <Portada />

      <div className="mx-auto max-w-7xl space-y-10 px-6 py-10 md:space-y-14 md:py-14">
        {secciones.map(({ categoria, productos }, i) => (
          <section key={categoria} aria-labelledby={`resumen-${i}`}>
            <div className="flex items-end justify-between gap-4 border-b border-[#D8D4CC] pb-3">
              <h2
                id={`resumen-${i}`} // por índice: el nombre tiene espacios
                className="font-[var(--font-heading)] text-xl font-bold text-[#232320] md:text-2xl"
              >
                {categoria}
              </h2>
              <Link
                href={urlCatalogo(categoria)}
                aria-label={`Ver todos: ${categoria}`}
                className="inline-flex min-h-11 shrink-0 items-center text-sm text-[#232320] underline underline-offset-4 transition-colors hover:text-[#A8562E]"
              >
                Ver todos
              </Link>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
              {productos.map((product) => (
                <ProductCard key={product.id} product={product} stock={stockPorId[product.id]} compacta />
              ))}
            </div>
          </section>
        ))}

        <p className="text-center">
          <Link
            href={urlCatalogo()}
            className="inline-flex min-h-11 items-center text-sm text-[#232320] underline underline-offset-4 transition-colors hover:text-[#A8562E]"
          >
            Ver catálogo completo
          </Link>
        </p>
      </div>

      <BotonWhatsApp />
    </main>
  );
}
