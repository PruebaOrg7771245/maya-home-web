// src/components/MenuCategorias.tsx
//
// Menú desplegable de categorías: un botón y, debajo, la lista de categorías
// (con su cantidad) como ENLACES a /catalogo?categoria=... Se usa en dos sitios:
//  - variante "cabecera": botón "Catálogo" de la navegación. En escritorio el panel
//    flota bajo el botón; en el menú plegable móvil se abre dentro del flujo.
//  - variante "control": botón "Categoría: <activa>" en /catalogo, de ancho fijo.
// La categoría viaja en la URL; al elegir, Next.js navega (sin recargar).
"use client";

import Link from "next/link";
import { useId } from "react";
import { useDesplegable } from "@/components/useDesplegable";
import { claseEnlaceNav } from "@/components/estilosNav";
import { urlCatalogo } from "@/lib/catalogoUrl";
import type { OpcionCategoria } from "@/lib/categorias";

type MenuCategoriasProps = {
  opciones: OpcionCategoria[];
  activa: string | null; // categoría marcada; null = ninguna (fuera de /catalogo)
  variante: "cabecera" | "control";
  etiqueta: string; // texto del botón en la cabecera ("Catálogo")
  seccionActiva?: boolean; // cabecera: ¿se subraya el botón? (estamos en el catálogo)
  q?: string; // búsqueda a conservar al cambiar de categoría (solo en /catalogo)
  alElegir?: () => void; // ej. cerrar el menú plegable de la cabecera
};

// Flecha del botón: gira al abrir (sin animación si se pidió reducir el movimiento)
function Chevron({ abierto }: { abierto: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`shrink-0 motion-safe:transition-transform ${abierto ? "rotate-180" : ""}`}
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

export default function MenuCategorias({
  opciones,
  activa,
  variante,
  etiqueta,
  seccionActiva = false,
  q,
  alElegir,
}: MenuCategoriasProps) {
  const idPanel = useId();
  const { abierto, contenedor, boton, panel, cerrar, alternar, alTeclearBoton, alTeclearPanel } =
    useDesplegable();
  const esControl = variante === "control";

  return (
    <div ref={contenedor} className={esControl ? "relative w-full sm:w-72" : "relative"}>
      <button
        ref={boton}
        type="button"
        aria-expanded={abierto}
        aria-controls={idPanel}
        onClick={alternar}
        onKeyDown={alTeclearBoton}
        className={
          esControl
            ? "flex h-11 w-full items-center justify-between gap-3 border border-[#D8D4CC] bg-white px-4 text-left text-sm text-[#232320] transition-colors hover:border-[#A8562E]"
            : `${claseEnlaceNav(seccionActiva)} w-full gap-1 md:w-auto`
        }
      >
        {esControl ? (
          // truncate: el ancho del botón es fijo, un nombre largo se corta en vez de empujar el diseño
          <span className="truncate">
            <span className="text-[#6B6862]">Categoría: </span>
            <span className="font-medium">{activa ?? "Todos"}</span>
          </span>
        ) : (
          etiqueta
        )}
        <Chevron abierto={abierto} />
      </button>

      <div
        ref={panel}
        id={idPanel}
        hidden={!abierto}
        onKeyDown={alTeclearPanel}
        className={
          esControl
            ? "absolute left-0 top-full z-20 mt-1 w-full border border-[#D8D4CC] bg-white"
            : // móvil: dentro del flujo del menú plegable; md: flotante bajo el botón
              "ml-3 border-l border-[#D8D4CC] md:absolute md:left-0 md:top-full md:z-30 md:ml-0 md:mt-3 md:w-72 md:border md:bg-white"
        }
      >
        <ul>
          {opciones.map((opcion) => {
            const esActiva = opcion.nombre === activa;
            return (
              <li key={opcion.nombre}>
                <Link
                  href={urlCatalogo(opcion.nombre, q)}
                  data-item
                  scroll={!esControl} // en /catalogo no se salta al inicio de la página
                  aria-current={esActiva ? "true" : undefined}
                  onClick={() => {
                    cerrar();
                    alElegir?.();
                  }}
                  className={`flex min-h-11 items-center justify-between gap-4 px-4 text-sm transition-colors hover:bg-[#EFEDE7] ${
                    esActiva ? "bg-[#EFEDE7] font-medium text-[#232320]" : "text-[#6B6862] hover:text-[#232320]"
                  }`}
                >
                  <span>{opcion.nombre}</span>
                  <span className="text-xs text-[#6B6862]">{opcion.cantidad}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
