// src/components/Header.tsx
//
// Encabezado global del sitio: logo + nombre a la izquierda; navegación (Inicio,
// menú desplegable "Catálogo" con las categorías, Combos), buscador y carrito con
// su contador a la derecha. En móvil todo se pliega detrás de un botón de menú
// (aria-expanded, se cierra con Escape o al elegir un enlace) y el buscador pasa
// a ser un campo dentro de ese menú.
"use client";  // necesita "use client": usa el carrito (useCart), el estado del menú y la ruta actual

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useSearchParams } from "next/navigation";
import { useCart } from "@/context/CartContext"; // hook para leer el estado del carrito
import { sitio } from "@/data/sitio";
import { PESTANA_COMBOS, PESTANA_TODOS, urlCatalogo } from "@/lib/catalogoUrl";
import type { OpcionCategoria } from "@/lib/categorias"; // solo el TIPO: las categorías llegan por props desde layout.tsx
import MenuCategorias from "@/components/MenuCategorias";
import { BuscadorEscritorio, FormBusqueda } from "@/components/BuscadorCabecera";
import { claseEnlaceNav } from "@/components/estilosNav";

type SeccionActiva = "inicio" | "catalogo" | "combos" | null;

type NavegacionProps = {
  activa: SeccionActiva;
  categoriaActiva: string | null; // categoría marcada en el menú (solo dentro de /catalogo)
  opciones: OpcionCategoria[];
  abierto: boolean;
  alElegir: () => void;
};

// Parte visual de la navegación (no lee la URL: recibe cuál sección está activa)
function Navegacion({ activa, categoriaActiva, opciones, abierto, alElegir }: NavegacionProps) {
  return (
    // En móvil: panel a todo el ancho bajo la fila del logo, solo si está abierto.
    // Desde md: fila horizontal siempre visible.
    <nav
      id="menu-principal"
      aria-label="Principal"
      className={`${abierto ? "block" : "hidden"} order-3 w-full border-t border-[#D8D4CC] pt-2 md:order-none md:flex md:w-auto md:border-t-0 md:pt-0`}
    >
      {/* Buscador: solo en el menú plegable móvil (en escritorio es la lupa de la cabecera) */}
      <div className="py-2 md:hidden">
        <FormBusqueda alEnviar={alElegir} />
      </div>

      <ul className="flex flex-col md:flex-row md:items-center md:gap-8">
        <li>
          <Link
            href="/"
            onClick={alElegir}
            aria-current={activa === "inicio" ? "page" : undefined}
            className={claseEnlaceNav(activa === "inicio")}
          >
            Inicio
          </Link>
        </li>
        <li>
          <MenuCategorias
            variante="cabecera"
            etiqueta="Catálogo"
            opciones={opciones}
            activa={categoriaActiva}
            seccionActiva={activa === "catalogo"}
            alElegir={alElegir}
          />
        </li>
        <li>
          <Link
            href={urlCatalogo(PESTANA_COMBOS)}
            onClick={alElegir}
            aria-current={activa === "combos" ? "page" : undefined}
            className={claseEnlaceNav(activa === "combos")}
          >
            Combos
          </Link>
        </li>
      </ul>
    </nav>
  );
}

// Calcula la sección activa con la ruta y ?categoria= (por eso va dentro de Suspense)
function NavegacionConRuta(props: Omit<NavegacionProps, "activa" | "categoriaActiva">) {
  const pathname = usePathname();
  const categoria = useSearchParams().get("categoria");

  let activa: SeccionActiva = null;
  let categoriaActiva: string | null = null;
  if (pathname === "/") activa = "inicio";
  else if (pathname === "/catalogo") {
    activa = categoria === PESTANA_COMBOS ? "combos" : "catalogo";
    categoriaActiva = props.opciones.some((o) => o.nombre === categoria) ? categoria : PESTANA_TODOS;
  }

  return <Navegacion activa={activa} categoriaActiva={categoriaActiva} {...props} />;
}

export default function Header({ opciones }: { opciones: OpcionCategoria[] }) {
  const { totalItems } = useCart();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const botonMenu = useRef<HTMLButtonElement>(null);

  // Escape cierra el menú y devuelve el foco al botón que lo abrió
  useEffect(() => {
    if (!menuAbierto) return;
    function alTeclear(e: KeyboardEvent) {
      // defaultPrevented: un desplegable abierto dentro del menú ya consumió este Escape
      if (e.key === "Escape" && !e.defaultPrevented) {
        setMenuAbierto(false);
        botonMenu.current?.focus();
      }
    }
    document.addEventListener("keydown", alTeclear);
    return () => document.removeEventListener("keydown", alTeclear);
  }, [menuAbierto]);

  const cerrarMenu = () => setMenuAbierto(false);

  return (
    <header className="border-b border-[#D8D4CC] bg-white px-6 py-3">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-6">
        <Link href="/" onClick={cerrarMenu} className="flex items-center gap-3" aria-label={`${sitio.nombre}, ir al inicio`}>
          {/* Reemplazamos el SVG placeholder por el ícono real del logo de Maya Home.
              Usamos solo el ícono (casa + M) recortado del logo completo, para que
              quede compacto al lado del texto - el logo completo (con "MAYA HOME"
              debajo) se guarda aparte por si se necesita en otra parte del sitio
              (ej: pie de página, favicon, etc.) */}
          <Image
            src="/images/brand/logo-icon.png"
            alt=""
            width={36}
            height={34}
            className="shrink-0"
          />

          <div>
            <p className="font-[var(--font-heading)] text-lg font-bold leading-none text-[#232320]">
              {sitio.nombre}
            </p>
            {/* Tagline provisional - el anterior ("Porcelanatos y pisos...")
                ya no aplica porque el catálogo real es de línea sanitaria.
                Ajustar cuando el cliente confirme cómo quiere describirse.
                Oculto en pantallas muy angostas (320 px) para que quepan los botones. */}
            <p className="mt-1 hidden text-xs text-[#6B6862] min-[400px]:block">
               Accesorios  y acabados para el hogar
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-1 md:order-last">
          <BuscadorEscritorio />

          <Link
            href="/carrito"
            onClick={cerrarMenu}
            aria-label="Ver carrito de pedido"
            className="relative flex h-11 w-11 items-center justify-center rounded-full transition-colors hover:bg-[#EFEDE7]"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path
                d="M3 3H5L5.4 5M5.4 5H21L18 13H7M5.4 5L7 13M7 13L5.5 16H18"
                stroke="#232320"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="9" cy="20" r="1.4" fill="#232320" />
              <circle cx="17" cy="20" r="1.4" fill="#232320" />
            </svg>

            {totalItems > 0 && (
              <span className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#A8562E] text-[10px] font-medium text-white">
                {totalItems}
              </span>
            )}
          </Link>

          {/* Botón de menú: solo en móvil */}
          <button
            ref={botonMenu}
            type="button"
            aria-label={menuAbierto ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={menuAbierto}
            aria-controls="menu-principal"
            onClick={() => setMenuAbierto((abierto) => !abierto)}
            className="flex h-11 w-11 items-center justify-center rounded-full transition-colors hover:bg-[#EFEDE7] md:hidden"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d={menuAbierto ? "M6 6L18 18M18 6L6 18" : "M4 7H20M4 12H20M4 17H20"}
                stroke="#232320"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* Suspense: useSearchParams lo exige para que las páginas sigan siendo estáticas.
            Mientras tanto se ve la misma navegación sin sección marcada. */}
        <Suspense
          fallback={
            <Navegacion
              activa={null}
              categoriaActiva={null}
              opciones={opciones}
              abierto={menuAbierto}
              alElegir={cerrarMenu}
            />
          }
        >
          <NavegacionConRuta opciones={opciones} abierto={menuAbierto} alElegir={cerrarMenu} />
        </Suspense>
      </div>
    </header>
  );
}
