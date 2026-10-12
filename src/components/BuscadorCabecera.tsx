// src/components/BuscadorCabecera.tsx
//
// Buscador de la cabecera. Al enviar lleva a /catalogo?q=<texto>; el filtrado
// real ocurre en el catálogo, en el navegador. Lo escrito no se guarda ni se
// envía a ningún sitio (solo queda en la URL de /catalogo).
//  - FormBusqueda: el campo + botón. En móvil va dentro del menú plegable.
//  - BuscadorEscritorio: icono de lupa en la cabecera que abre un panel con el campo.
"use client";

import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import { useDesplegable } from "@/components/useDesplegable";
import { urlCatalogo } from "@/lib/catalogoUrl";
import { LARGO_MAXIMO_CONSULTA } from "@/lib/busqueda";

// Lupa (mismo estilo de trazo que el resto de iconos del sitio)
export function IconoLupa({ tamano = 22 }: { tamano?: number }) {
  return (
    <svg
      width={tamano}
      height={tamano}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="10" cy="10" r="7" />
      <path d="M21 21l-6-6" />
    </svg>
  );
}

export function FormBusqueda({ alEnviar }: { alEnviar?: () => void }) {
  const id = useId();
  const router = useRouter();
  const [valor, setValor] = useState("");

  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        router.push(urlCatalogo(undefined, valor));
        setValor("");
        alEnviar?.();
      }}
      className="flex"
    >
      <label htmlFor={id} className="sr-only">
        Buscar productos
      </label>
      {/* Alto fijo (h-11) y text-base en móvil: no cambia de tamaño al escribir ni hace zoom en iOS */}
      <input
        id={id}
        data-item
        type="search"
        name="q"
        value={valor}
        onChange={(e) => setValor(e.target.value)}
        maxLength={LARGO_MAXIMO_CONSULTA}
        placeholder="Buscar productos"
        autoComplete="off"
        enterKeyHint="search"
        className="h-11 min-w-0 flex-1 border border-[#D8D4CC] bg-white px-3 text-base text-[#232320] placeholder:text-[#6B6862] focus:border-[#A8562E] sm:text-sm [&::-webkit-search-cancel-button]:hidden"
      />
      <button
        type="submit"
        aria-label="Buscar"
        className="flex h-11 w-11 shrink-0 items-center justify-center bg-[#232320] text-white transition-colors hover:bg-[#A8562E]"
      >
        <IconoLupa />
      </button>
    </form>
  );
}

// Solo escritorio (md+): en móvil el campo está en el menú plegable
export function BuscadorEscritorio() {
  const idPanel = useId();
  const { abierto, contenedor, boton, panel, abrir, cerrar } = useDesplegable();

  return (
    <div ref={contenedor} className="relative hidden md:block">
      <button
        ref={boton}
        type="button"
        aria-label="Buscar productos"
        aria-expanded={abierto}
        aria-controls={idPanel}
        onClick={() => (abierto ? cerrar() : abrir(true))} // al abrir, el foco pasa al campo
        className="flex h-11 w-11 items-center justify-center rounded-full text-[#232320] transition-colors hover:bg-[#EFEDE7]"
      >
        <IconoLupa tamano={24} />
      </button>

      <div
        ref={panel}
        id={idPanel}
        hidden={!abierto}
        className="absolute right-0 top-full z-30 mt-3 w-80 border border-[#D8D4CC] bg-white p-3"
      >
        <FormBusqueda alEnviar={() => cerrar()} />
      </div>
    </div>
  );
}
