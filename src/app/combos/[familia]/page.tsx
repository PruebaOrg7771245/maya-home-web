// src/app/combos/[familia]/page.tsx
//
// Detalle de una FAMILIA de combos (lavamanos + mueble). Igual que
// productos/[id]: la carpeta "[familia]" es una ruta dinámica, ej:
// /combos/lux-600, /combos/lux-800. Es un server component: consulta el stock
// y precio de las piezas y se los pasa ya calculados a SelectorCombo (cliente),
// que se encarga de elegir lavamanos y mueble.

import { notFound } from "next/navigation";
import Link from "next/link";
import { FAMILIAS_COMBO } from "@/data/combos";
import { vistaCombinaciones } from "@/lib/combos";
import { getStockPorSkus } from "@/lib/stock"; // adaptador de stock y precio (ADR-1); solo servidor
import SelectorCombo from "@/components/SelectorCombo";

// Se generan de antemano las páginas de todas las familias (HTML estático)
export async function generateStaticParams() {
  return FAMILIAS_COMBO.map((familia) => ({
    familia: familia.id,
  }));
}

// Igual que productos/[id]: se puede regenerar como máximo cada 60 segundos,
// porque stock y precio salen de stock_espejo y pueden cambiar entre corridas
// de sync-stock.js
export const revalidate = 60;

export default async function ComboPage({
  params,
}: {
  params: Promise<{ familia: string }>; // en Next.js 15 params llega como Promise
}) {
  const { familia: id } = await params;

  // Familia cuyo id coincide con el de la URL; si no existe, 404
  const familia = FAMILIAS_COMBO.find((f) => f.id === id);
  if (!familia) {
    notFound();
  }

  // UNA sola consulta con los skus de todas las piezas de la familia
  const mapa = await getStockPorSkus(
    [...familia.lavamanos, ...familia.muebles].map((p) => p.sku)
  );

  // Precio, stock y estado de cada pareja lavamanos × mueble (datos simples, serializables)
  const combinaciones = vistaCombinaciones(familia, mapa);

  return (
    <main className="min-h-screen bg-[#EFEDE7]">
      <div className="border-b border-[#D8D4CC] bg-white px-6 py-3">
        <Link
          href="/"
          className="text-sm text-[#6B6862] hover:text-[#232320] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#A8562E]"
        >
          ← Volver al catálogo
        </Link>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-10">
        <p className="text-sm text-[#6B6862]">Combo lavamanos + mueble</p>

        <h1 className="mt-2 break-words font-[var(--font-heading)] text-3xl font-bold text-[#232320]">
          {familia.nombre}
        </h1>

        <p className="mt-4 max-w-2xl text-base leading-relaxed text-[#6B6862]">
          {familia.descripcion}
        </p>

        {/* Parte interactiva: elegir lavamanos y mueble, ver precio y agregar al pedido */}
        <div className="mt-8">
          <SelectorCombo familia={familia} combinaciones={combinaciones} />
        </div>
      </div>
    </main>
  );
}
