"use client";

// src/components/BotonWhatsAppFlotante.tsx
//
// Parte interactiva del botón flotante de WhatsApp (ver BotonWhatsApp.tsx):
// - Se oculta al hacer scroll hacia abajo y reaparece al subir o al detenerse
//   (así no tapa tarjetas de producto). Con el foco en el botón no se oculta.
// - Globo "¿Necesitas asesoría?": aparece a los 3 s de cargar, se oculta solo a los 8 s
//   y antes si hay scroll, se abre un menú (cualquier [aria-expanded]) o se toca el botón.
//   Una vez por visita (sessionStorage; si no está disponible, una vez por carga).
// Excepción buscada al sistema de diseño: el verde de WhatsApp (tono oscuro para que el
// ícono blanco contraste), sin sombra. z-10: por debajo de los menús (cabecera z-20,
// desplegables z-20/z-30). No sale al imprimir. Sin animación con prefers-reduced-motion
// (las transiciones llevan motion-safe:).

import { useEffect, useRef, useState } from "react";

const CLAVE_GLOBO = "maya-globo-whatsapp";
const MS_APARECE = 3000; // el globo aparece 3 s después de cargar
const MS_DESAPARECE = 8000; // y se oculta solo a los 8 s de la carga
const MS_QUIETO = 600; // sin scroll durante este tiempo, el botón reaparece
const PX_MINIMO = 80; // no se oculta cerca del inicio de la página

// Respaldo si sessionStorage no está disponible: una vez por carga de la app
let globoMostrado = false;

function yaSeMostro(): boolean {
  if (globoMostrado) return true;
  try {
    return window.sessionStorage.getItem(CLAVE_GLOBO) === "1";
  } catch {
    return false;
  }
}

function marcarMostrado() {
  globoMostrado = true;
  try {
    window.sessionStorage.setItem(CLAVE_GLOBO, "1");
  } catch {
    // sin almacenamiento: queda solo la marca en memoria
  }
}

export default function BotonWhatsAppFlotante({ href }: { href: string }) {
  const [oculto, setOculto] = useState(false); // oculto por scroll hacia abajo
  const [globo, setGlobo] = useState(false);
  const enlace = useRef<HTMLAnchorElement>(null);

  // Ocultar al bajar, reaparecer al subir o al detenerse (listener pasivo)
  useEffect(() => {
    let ultimoY = window.scrollY;
    let temporizador: ReturnType<typeof setTimeout> | undefined;
    function alScroll() {
      const y = window.scrollY;
      const baja = y > ultimoY && y > PX_MINIMO;
      const sube = y < ultimoY;
      ultimoY = y;
      if (baja && document.activeElement !== enlace.current) setOculto(true);
      else if (sube) setOculto(false);
      clearTimeout(temporizador);
      temporizador = setTimeout(() => setOculto(false), MS_QUIETO);
    }
    window.addEventListener("scroll", alScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", alScroll);
      clearTimeout(temporizador);
    };
  }, []);

  // Globo: aparece y se oculta solo; también se oculta con scroll o al abrir un menú
  useEffect(() => {
    if (yaSeMostro()) return;
    const ocultar = () => setGlobo(false);
    const abrir = setTimeout(() => {
      marcarMostrado();
      setGlobo(true);
    }, MS_APARECE);
    const cerrar = setTimeout(ocultar, MS_DESAPARECE);
    const alClic = (e: MouseEvent) => {
      if ((e.target as Element).closest?.("[aria-expanded]")) ocultar();
    };
    window.addEventListener("scroll", ocultar, { passive: true });
    document.addEventListener("click", alClic, true);
    return () => {
      clearTimeout(abrir);
      clearTimeout(cerrar);
      window.removeEventListener("scroll", ocultar);
      document.removeEventListener("click", alClic, true);
    };
  }, []);

  return (
    <div
      className={`pointer-events-none fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-[max(1.25rem,env(safe-area-inset-right))] z-10 flex items-center gap-2 motion-safe:transition-[opacity,transform] motion-safe:duration-200 md:bottom-[max(1.5rem,env(safe-area-inset-bottom))] md:right-[max(1.5rem,env(safe-area-inset-right))] print:hidden ${
        oculto ? "invisible translate-y-4 opacity-0" : "translate-y-0 opacity-100"
      }`}
    >
      {globo && (
        <span
          aria-hidden="true"
          className="whitespace-nowrap border border-[#D8D4CC] bg-white px-3 py-2 text-sm text-[#232320]"
        >
          ¿Necesitas asesoría?
        </span>
      )}
      <a
        ref={enlace}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Escribir a un asesor por WhatsApp"
        onClick={() => setGlobo(false)}
        className="pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full bg-[#128C7E] text-white transition-colors hover:bg-[#0E6F64] md:h-14 md:w-14"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-6 w-6 md:h-[30px] md:w-[30px]">
          <path d="M12.04 2a9.9 9.9 0 0 0-8.43 15.1L2 22l5.05-1.32A9.9 9.9 0 1 0 12.04 2Zm0 1.8a8.1 8.1 0 1 1-4.2 15.04l-.3-.18-3 .78.8-2.92-.2-.31A8.1 8.1 0 0 1 12.04 3.8Zm-3.2 3.7c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.5 0 1.47 1.07 2.9 1.22 3.1.15.2 2.1 3.2 5.1 4.5.71.3 1.27.49 1.7.63.72.23 1.37.2 1.88.12.57-.08 1.76-.72 2-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.6.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57Z" />
        </svg>
      </a>
    </div>
  );
}
