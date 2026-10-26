// src/app/page.tsx
//
// Página de inicio ("/"), de arriba abajo:
//   1. Portada (hero) a ancho completo (src/data/portada.ts, componente Portada).
//   2. Catálogo resumido: una sección por categoría con hasta 4 productos
//      vendibles, disponibles primero (regla en src/lib/resumenCatalogo.ts,
//      ADR-31) y un enlace "Ver todos" al catálogo filtrado. Justo después de
//      Lavamanos, una fila "Combos lavamanos" con hasta 4 familias (ADR-32).
//   3. Un enlace de texto discreto al catálogo completo.
//
// Server component con ISR, igual que /catalogo: stock y precio de todos los
// productos y de las piezas de los combos con UNA sola llamada a getStockPorSkus().

import type { ReactNode } from "react";
import Link from "next/link";
import { sitio } from "@/data/sitio";
import { products } from "@/data/products";
import { getStockPorSkus, stockParaInterfaz, type StockInfo } from "@/lib/stock";
import { combosResumen, seccionesResumen } from "@/lib/resumenCatalogo";
import { PESTANA_COMBOS, urlCatalogo } from "@/lib/catalogoUrl";
import { FAMILIAS_COMBO } from "@/data/combos";
import { tarjetaFamilia } from "@/lib/combos";
import ComboCard from "@/components/ComboCard";
import Portada from "@/components/Portada";
import ProductCard from "@/components/ProductCard";
import BotonWhatsApp from "@/components/BotonWhatsApp";

// Mismo margen que /catalogo: la tabla stock_espejo solo cambia al correr sync-stock.js
export const revalidate = 60;

// La fila de combos va justo después de esta categoría (si no sale, al final)
const CATEGORIA_ANTES_DE_COMBOS = "Lavamanos";

// Una fila del resumen: título, enlace "Ver todos" y grid de tarjetas
function FilaResumen({ id, titulo, children }: { id: string; titulo: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id}>
      <div className="flex items-end justify-between gap-4 border-b border-[#D8D4CC] pb-3">
        <h2 id={id} className="font-[var(--font-heading)] text-xl font-bold text-[#232320] md:text-2xl">
          {titulo}
        </h2>
        <Link
          href={urlCatalogo(titulo)}
          aria-label={`Ver todos: ${titulo}`}
          className="inline-flex min-h-11 shrink-0 items-center text-sm text-[#232320] underline underline-offset-4 transition-colors hover:text-[#A8562E]"
        >
          Ver todos
        </Link>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">{children}</div>
    </section>
  );
}

export default async function PortadaPage() {
  const skusProductos = products.flatMap((p) => (p.sku ? [p.sku] : []));
  // Piezas de todos los combos: en la MISMA consulta (igual que /catalogo)
  const skusCombos = FAMILIAS_COMBO.flatMap((f) => [...f.lavamanos, ...f.muebles].map((p) => p.sku));
  const stockPorSku = await getStockPorSkus([...new Set([...skusProductos, ...skusCombos])]); // UNA sola consulta

  const sinSku: StockInfo = { status: "coming_soon", quantity: null, precio: null };
  const stockPorId: Record<string, StockInfo> = {};
  for (const product of products) {
    // Productos por medida: estado con su umbral y sin existencia (no viaja al HTML)
    stockPorId[product.id] = stockParaInterfaz(
      product.sku ? stockPorSku[product.sku] ?? sinSku : sinSku,
      product.ventaPorMedida
    );
  }

  const secciones = seccionesResumen(products, stockPorId);
  const combos = combosResumen(FAMILIAS_COMBO.map((f) => tarjetaFamilia(f, stockPorSku)));

  // Fila de combos (si hay alguno vendible) tras Lavamanos; sin Lavamanos, al final
  const filaCombos =
    combos.length > 0 ? (
      <FilaResumen key={PESTANA_COMBOS} id="resumen-combos" titulo={PESTANA_COMBOS}>
        {combos.map((combo) => (
          <ComboCard key={combo.id} combo={combo} compacta />
        ))}
      </FilaResumen>
    ) : null;
  const hayLavamanos = secciones.some((s) => s.categoria === CATEGORIA_ANTES_DE_COMBOS);

  return (
    <main>
      {/* El texto de la portada va dentro de la imagen: el h1 queda para lectores de pantalla */}
      <h1 className="sr-only">{sitio.nombre}</h1>
      <Portada />

      <div className="mx-auto max-w-7xl space-y-10 px-6 py-10 md:space-y-14 md:py-14">
        {secciones.flatMap(({ categoria, productos }, i) => {
          const fila = (
            // id por índice: el nombre tiene espacios
            <FilaResumen key={categoria} id={`resumen-${i}`} titulo={categoria}>
              {productos.map((product) => (
                <ProductCard key={product.id} product={product} stock={stockPorId[product.id]} compacta />
              ))}
            </FilaResumen>
          );
          return categoria === CATEGORIA_ANTES_DE_COMBOS ? [fila, filaCombos] : [fila];
        })}
        {!hayLavamanos && filaCombos}

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
