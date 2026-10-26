// src/components/CintaCategorias.tsx
//
// Cinta horizontal de categorías de /catalogo (ADR-33). Recibe una lista GENÉRICA
// de elementos { etiqueta, href, activo }: no sabe qué son (hoy categorías; más
// adelante, grupos de categorías) y no trae ninguna fija.
//
// Comportamiento:
//  - Si los chips caben: cinta estática, sin copias ni movimiento.
//  - Si no caben: la cinta está quieta y cada 5 s da UN salto, igual que pulsar la flecha ›
//    (60 % del ancho visible, animación de ~350 ms), y vuelve a quedarse quieta. El
//    bucle es una SEGUNDA copia de los chips (aria-hidden, sin foco) pegada detrás de
//    la primera; al pasar del final de la primera, scrollLeft vuelve atrás exactamente
//    su ancho y la vista queda idéntica (sin salto visible).
//  - Es scroll nativo (overflow-x), así que dedo, rueda/trackpad y teclado siguen
//    funcionando; con mouse también se arrastra. Flechas ‹ › solo con desbordamiento
//    y puntero fino.
//  - Los saltos se programan con un setTimeout que se reinicia tras cada salto y tras
//    cualquier interacción (hover, foco, toque, arrastre, rueda, flechas): el siguiente
//    salto ocurre 5 s después. Con hover, foco de teclado, toque o pestaña oculta no
//    salta. Con prefers-reduced-motion no hay saltos: solo scroll manual y flechas.
//  - Al montar centra el chip activo, sin animación (si está al principio, la cinta
//    arranca en su orden normal).
"use client";

import Link from "next/link";
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type FocusEvent, type PointerEvent } from "react";

export type ElementoCinta = {
  etiqueta: string; // texto del chip (también su key: debe ser único)
  href: string;
  activo: boolean; // lleva aria-current
};

type CintaCategoriasProps = {
  elementos: ElementoCinta[];
  etiqueta: string; // aria-label del <nav>
};

const ESPERA_SALTO_MS = 5000; // quieta entre un salto y el siguiente (y tras una interacción)
const UMBRAL_ARRASTRE_PX = 5; // menos que esto es un clic, no un arrastre
const DURACION_FLECHA_MS = 350; // desplazamiento animado de las flechas

// Clases de un chip. Alto táctil de 44 px; activo = relleno oscuro (texto principal),
// el acento queda solo para el hover, como en las tarjetas.
function claseChip(activo: boolean): string {
  return `flex h-11 shrink-0 items-center whitespace-nowrap border px-4 text-sm transition-colors ${
    activo
      ? "border-[#232320] bg-[#232320] font-medium text-white"
      : "border-[#D8D4CC] bg-white text-[#232320] hover:border-[#A8562E]"
  }`;
}

// Botón redondo de control (flechas): mismo patrón que los iconos de la cabecera
// (sin display: las flechas lo cambian según el tipo de puntero)
const CLASE_CONTROL =
  "h-11 w-11 shrink-0 items-center justify-center rounded-full text-[#232320] transition-colors hover:bg-[#EFEDE7]";

function Icono({ d }: { d: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

// Una fila de chips. pr-2 = el mismo espacio que gap-2: así el ancho de la fila es
// exactamente el período del bucle y la copia empieza donde debe.
function Fila({ elementos, copia = false }: { elementos: ElementoCinta[]; copia?: boolean }) {
  return (
    <ul className="flex shrink-0 gap-2 pr-2" aria-hidden={copia || undefined}>
      {elementos.map((el) => (
        <li key={el.etiqueta} className="shrink-0">
          <Link
            href={el.href}
            scroll={false} // misma página: no saltar al inicio
            draggable={false} // el arrastre con mouse mueve la cinta, no el enlace
            tabIndex={copia ? -1 : undefined}
            aria-current={!copia && el.activo ? "page" : undefined}
            data-activo={el.activo || undefined}
            className={claseChip(el.activo)}
          >
            {el.etiqueta}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default function CintaCategorias({ elementos, etiqueta }: CintaCategoriasProps) {
  const pista = useRef<HTMLDivElement>(null); // contenedor con overflow-x (el que se desplaza)
  const fila = useRef<HTMLDivElement>(null); // envuelve la fila real (mide el período)

  const [desborda, setDesborda] = useState(false);
  // prefers-reduced-motion. Leerlo ya en el primer render no rompe la hidratación:
  // hasta medir (desborda = false) el HTML es el mismo con o sin la preferencia.
  const [reducido, setReducido] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  // Valores que cambian a cada evento: refs, no estado (sin re-render)
  const periodo = useRef(0); // ancho de una fila completa
  const ultimoPuesto = useRef(-1); // último scrollLeft que puso este componente
  const encima = useRef(false); // mouse sobre la cinta
  const enfocada = useRef(false); // foco dentro de la cinta
  const tocando = useRef(false); // dedo o botón del mouse abajo
  const temporizador = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const saltar = useRef<() => void>(() => {}); // salto automático (siempre la versión del último render)
  const arrastre = useRef<{ x: number; inicio: number; movido: boolean; id: number } | null>(null);
  const centrado = useRef(false);

  const bucle = desborda && !reducido; // ¿se dibuja la copia y salta sola?

  // prefers-reduced-motion, con cambios en vivo
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const actualizar = () => setReducido(mq.matches);
    actualizar();
    mq.addEventListener("change", actualizar);
    return () => mq.removeEventListener("change", actualizar);
  }, []);

  // Solo las etiquetas cambian la medida (el href cambia con cada tecla del buscador)
  const claveMedida = elementos.map((el) => el.etiqueta).join("|");

  // ¿Caben los chips? Se mide la fila REAL (la copia no cambia su ancho, así no oscila)
  useLayoutEffect(() => {
    const p = pista.current;
    const f = fila.current;
    if (!p || !f) return;
    const medir = () => {
      periodo.current = f.offsetWidth;
      // -8: el pr-2 final de la fila no cuenta para "caber"
      setDesborda(f.offsetWidth - 8 > p.clientWidth + 1);
    };
    medir();
    const ro = new ResizeObserver(medir);
    ro.observe(p);
    ro.observe(f);
    return () => ro.disconnect();
  }, [claveMedida]);

  // Pone scrollLeft y lo anota (para distinguir nuestro movimiento del del usuario)
  const poner = useCallback((x: number) => {
    const p = pista.current;
    if (!p) return;
    p.scrollLeft = x;
    ultimoPuesto.current = p.scrollLeft;
  }, []);

  // Lleva x al primer período [0, periodo): misma vista, sin salto
  const normalizar = useCallback((x: number) => {
    const w = periodo.current;
    return w > 0 ? ((x % w) + w) % w : x;
  }, []);

  // Al montar: centra el chip activo (antes de pintar, sin animación)
  useLayoutEffect(() => {
    if (centrado.current) return;
    const p = pista.current;
    const chip = fila.current?.querySelector<HTMLElement>("[data-activo]");
    if (!p || !chip || !desborda) return;
    centrado.current = true;
    // Posición del chip dentro de la pista (offsetLeft no sirve: es relativo a otro ancestro)
    const rp = p.getBoundingClientRect();
    const rc = chip.getBoundingClientRect();
    const x = p.scrollLeft + rc.left - rp.left - (p.clientWidth - rc.width) / 2;
    // Nunca antes del inicio: un chip del principio (ej. "Todos") deja la cinta en su orden
    const destino = x <= 0 ? 0 : bucle ? normalizar(x) : x;
    poner(destino);
  }, [desborda, bucle, normalizar, poner]);

  // (Re)programa el próximo salto automático a 5 s desde ahora. Se llama tras cada
  // salto y tras cada interacción, así que el salto nunca llega antes de esos 5 s.
  const programar = useCallback(() => {
    clearTimeout(temporizador.current);
    if (!bucle) return;
    temporizador.current = setTimeout(() => saltar.current(), ESPERA_SALTO_MS);
  }, [bucle]);

  const interactuar = programar;

  // Al activarse el salto (o dejar de estar activo) se arranca/cancela el temporizador
  useEffect(() => {
    programar();
    return () => clearTimeout(temporizador.current);
  }, [programar]);

  // Con la pestaña oculta no se salta; al volver, 5 s de espera desde ese momento
  useEffect(() => {
    if (!bucle) return;
    const alCambiarVisibilidad = () => {
      if (document.visibilityState === "visible") programar();
    };
    document.addEventListener("visibilitychange", alCambiarVisibilidad);
    return () => document.removeEventListener("visibilitychange", alCambiarVisibilidad);
  }, [bucle, programar]);

  // Scroll del usuario: cuenta como interacción y, con bucle, se mantiene en el primer
  // período (también hacia la izquierda: en 0 salta a "periodo", que se ve igual)
  const alDesplazar = () => {
    const p = pista.current;
    if (!p) return;
    if (Math.abs(p.scrollLeft - ultimoPuesto.current) <= 1) return; // fue nuestro
    interactuar();
    if (!bucle) return;
    const w = periodo.current;
    if (p.scrollLeft >= w) poner(p.scrollLeft - w);
    else if (p.scrollLeft < 1) poner(p.scrollLeft + w);
  };

  // Arrastre con mouse (en táctil ya lo hace el scroll nativo)
  const alBajar = (e: PointerEvent<HTMLDivElement>) => {
    tocando.current = true;
    interactuar();
    if (e.pointerType !== "mouse" || e.button !== 0 || !desborda) return;
    arrastre.current = { x: e.clientX, inicio: pista.current?.scrollLeft ?? 0, movido: false, id: e.pointerId };
  };
  const alMover = (e: PointerEvent<HTMLDivElement>) => {
    const a = arrastre.current;
    if (!a) return;
    const dx = e.clientX - a.x;
    if (!a.movido && Math.abs(dx) < UMBRAL_ARRASTRE_PX) return;
    if (!a.movido) {
      a.movido = true;
      // Captura recién al arrastrar: un clic simple sigue llegando al enlace
      pista.current?.setPointerCapture(a.id);
    }
    const x = bucle ? normalizar(a.inicio - dx) : a.inicio - dx;
    poner(x);
    interactuar();
  };
  const alSoltar = () => {
    tocando.current = false;
    interactuar();
    const a = arrastre.current;
    arrastre.current = null;
    // Tras un arrastre, el clic que sigue no debe abrir el enlace donde se soltó
    if (a?.movido) {
      const anular = (ev: MouseEvent) => {
        ev.preventDefault();
        ev.stopPropagation();
      };
      window.addEventListener("click", anular, { capture: true, once: true });
      setTimeout(() => window.removeEventListener("click", anular, { capture: true }), 0);
    }
  };

  // Flechas: un 60 % del ancho visible, con animación corta (instantánea si se pidió menos movimiento)
  const mover = (sentido: 1 | -1) => {
    const p = pista.current;
    if (!p) return;
    interactuar();
    const distancia = sentido * p.clientWidth * 0.6;
    if (!bucle) {
      p.scrollBy({ left: distancia, behavior: reducido ? "auto" : "smooth" });
      return;
    }
    const inicio = p.scrollLeft;
    const t0 = performance.now();
    const paso = (ahora: number) => {
      const t = Math.min((ahora - t0) / DURACION_FLECHA_MS, 1);
      const suave = 1 - (1 - t) ** 3; // ease-out
      poner(normalizar(inicio + distancia * suave));
      if (t < 1) requestAnimationFrame(paso);
      else interactuar(); // al terminar, 5 s de quietud hasta el siguiente salto
    };
    requestAnimationFrame(paso);
  };

  // Salto automático: como pulsar ›, salvo que haya hover, foco de teclado, toque o pestaña oculta
  useEffect(() => {
    saltar.current = () => {
      const quieta = encima.current || enfocada.current || tocando.current || document.visibilityState !== "visible";
      if (quieta) programar();
      else mover(1);
    };
  });

  return (
    <nav
      aria-label={etiqueta}
      className="flex items-center gap-1"
      onMouseEnter={() => (encima.current = true)}
      onMouseLeave={() => {
        encima.current = false;
        interactuar();
      }}
      // Solo el foco de teclado pausa (tras un clic el enlace queda enfocado y no debe frenarla)
      onFocus={(e: FocusEvent<HTMLElement>) => {
        if (e.target.matches(":focus-visible")) enfocada.current = true;
      }}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          enfocada.current = false;
          interactuar();
        }
      }}
    >
      <div
        ref={pista}
        onScroll={alDesplazar}
        onWheel={interactuar}
        onPointerDown={alBajar}
        onPointerMove={alMover}
        onPointerUp={alSoltar}
        onPointerCancel={alSoltar}
        // Sin barra visible; con desbordamiento, los bordes se desvanecen para indicar que hay más
        className={`min-w-0 flex-1 select-none overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
          desborda
            ? "[mask-image:linear-gradient(to_right,transparent,black_24px,black_calc(100%-24px),transparent)]"
            : ""
        }`}
      >
        <div className="flex w-max">
          <div ref={fila} className="flex shrink-0">
            <Fila elementos={elementos} />
          </div>
          {bucle && <Fila elementos={elementos} copia />}
        </div>
      </div>

      {desborda && (
        <div className="flex shrink-0 items-center">
          <button type="button" onClick={() => mover(-1)} aria-label="Ver categorías anteriores" className={`${CLASE_CONTROL} hidden pointer-fine:flex`}>
            <Icono d="M15 6l-6 6 6 6" />
          </button>
          <button type="button" onClick={() => mover(1)} aria-label="Ver más categorías" className={`${CLASE_CONTROL} hidden pointer-fine:flex`}>
            <Icono d="M9 6l6 6-6 6" />
          </button>
        </div>
      )}
    </nav>
  );
}
