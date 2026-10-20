// src/components/VolverAlCatalogo.tsx
//
// Enlace "← Volver al catálogo" de las fichas. Si la persona llegó desde el
// catálogo, hace lo mismo que el botón "atrás" del navegador (mismo filtro,
// misma búsqueda, sin llenar el historial). Si abrió la ficha directamente (o
// recargó, con Ctrl+clic, o desde otra página), va a `hrefPorDefecto`: el catálogo
// filtrado por la categoría de la ficha. El href real siempre está en el enlace,
// así que clic central, Ctrl+clic y lectores de pantalla funcionan igual.

"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { debeVolverAtras, leerOrigen } from "@/lib/origenCatalogo";

export default function VolverAlCatalogo({
  hrefPorDefecto,
  className,
}: {
  hrefPorDefecto: string;
  className?: string;
}) {
  const router = useRouter();
  const ruta = usePathname();

  return (
    <Link
      href={hrefPorDefecto}
      className={className}
      onClick={(e) => {
        // solo el clic normal: con teclas modificadoras se deja el comportamiento del navegador
        if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        if (debeVolverAtras(leerOrigen(), ruta)) {
          e.preventDefault();
          router.back();
        }
      }}
    >
      ← Volver al catálogo
    </Link>
  );
}
