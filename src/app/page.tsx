// src/app/page.tsx
//
// Portada TEMPORAL del sitio ("/"): título, una frase y un botón al catálogo.
// Se reemplaza en la fase 4. El catálogo real vive en /catalogo.

import Link from "next/link";
import { sitio } from "@/data/sitio";
import BotonWhatsApp from "@/components/BotonWhatsApp";

export default function PortadaPage() {
  return (
    <main className="flex min-h-[60vh] items-center bg-[#EFEDE7] px-6 py-16">
      <div className="mx-auto w-full max-w-3xl">
        <h1 className="break-words font-[var(--font-heading)] text-4xl font-bold text-[#232320]">
          {sitio.nombre}
        </h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-[#6B6862]">
          {sitio.descripcion}
        </p>
        <Link
          href="/catalogo"
          className="mt-8 inline-flex min-h-11 items-center bg-[#232320] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#A8562E]"
        >
          Ver catálogo
        </Link>
      </div>
      <BotonWhatsApp />
    </main>
  );
}
