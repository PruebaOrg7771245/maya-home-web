"use client";

// src/components/CarruselPortada.tsx
//
// Carrusel de la portada, solo cuando hay 2 o más imágenes (con una, Portada la
// dibuja fija y este componente no se usa). Recibe las imágenes ya armadas por
// el servidor y muestra una a la vez:
// - UNA flecha "Siguiente imagen" (al final vuelve a la primera). Sin puntos.
// - Avance automático cada 6 s, en pausa mientras el mouse está encima o el
//   foco está dentro, y desactivado con prefers-reduced-motion.
// - Las imágenes ocultas usan display:none y carga diferida: no se descargan
//   hasta que se muestran.

import { useEffect, useState, useSyncExternalStore, type ReactNode } from "react";

const INTERVALO_MS = 6000;
const CONSULTA_REDUCIDO = "(prefers-reduced-motion: reduce)";

function suscribirReducido(avisar: () => void) {
  const consulta = window.matchMedia(CONSULTA_REDUCIDO);
  consulta.addEventListener("change", avisar);
  return () => consulta.removeEventListener("change", avisar);
}

export default function CarruselPortada({ children }: { children: ReactNode[] }) {
  const total = children.length;
  const [indice, setIndice] = useState(0);
  const [encima, setEncima] = useState(false); // mouse sobre el carrusel
  const [conFoco, setConFoco] = useState(false); // foco dentro del carrusel
  // En el servidor no se sabe: se asume "reducido" para no arrancar nada antes de hidratar
  const reducido = useSyncExternalStore(
    suscribirReducido,
    () => window.matchMedia(CONSULTA_REDUCIDO).matches,
    () => true
  );
  const automatico = !reducido && !encima && !conFoco;

  // indice en las dependencias: tras pulsar la flecha, el contador vuelve a empezar
  useEffect(() => {
    if (!automatico) return;
    const temporizador = setTimeout(() => setIndice((i) => (i + 1) % total), INTERVALO_MS);
    return () => clearTimeout(temporizador);
  }, [automatico, indice, total]);

  return (
    <section
      aria-roledescription="carrusel"
      aria-label="Portada"
      className="relative"
      onMouseEnter={() => setEncima(true)}
      onMouseLeave={() => setEncima(false)}
      onFocus={() => setConFoco(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setConFoco(false);
      }}
    >
      {/* Con avance automático no se anuncia cada cambio; al pulsar la flecha (con foco) sí */}
      <div aria-live={automatico ? "off" : "polite"}>
        {children.map((imagen, i) => (
          <div
            key={i}
            role="group"
            aria-roledescription="diapositiva"
            aria-label={`${i + 1} de ${total}`}
            hidden={i !== indice}
          >
            {imagen}
          </div>
        ))}
      </div>

      <button
        type="button"
        aria-label="Siguiente imagen"
        onClick={() => setIndice((i) => (i + 1) % total)}
        className="absolute right-3 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-[#D8D4CC] bg-white text-[#232320] transition-colors hover:bg-[#EFEDE7] md:right-6"
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.75">
          <path d="m9 6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </section>
  );
}
