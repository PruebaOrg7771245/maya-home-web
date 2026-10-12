// src/components/useDesplegable.ts
//
// Comportamiento común de los paneles desplegables (menú de categorías de la
// cabecera, control "Categoría" del catálogo y buscador de la cabecera):
//  - botón con aria-expanded; el panel se muestra/oculta con el atributo hidden
//  - Escape cierra y devuelve el foco al botón
//  - clic fuera o Tab hacia fuera cierran (sin robar el foco)
//  - flecha abajo en el botón abre y pasa al primer elemento; flechas arriba/abajo,
//    Inicio y Fin recorren los elementos marcados con data-item
"use client";

import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react";

export function useDesplegable() {
  const [abierto, setAbierto] = useState(false);
  const contenedor = useRef<HTMLDivElement>(null); // envuelve botón + panel
  const boton = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const enfocarPrimero = useRef(false); // al abrir con teclado, enfocar el primer elemento

  const cerrar = useCallback((devolverFoco = false) => {
    setAbierto(false);
    if (devolverFoco) boton.current?.focus();
  }, []);

  const abrir = useCallback((conTeclado = false) => {
    enfocarPrimero.current = conTeclado;
    setAbierto(true);
  }, []);

  const alternar = useCallback(() => {
    enfocarPrimero.current = false;
    setAbierto((valor) => !valor);
  }, []);

  useEffect(() => {
    if (!abierto) return;

    if (enfocarPrimero.current) {
      enfocarPrimero.current = false;
      panel.current?.querySelector<HTMLElement>("[data-item]")?.focus();
    }

    // Fase de captura + preventDefault: si hay otro Escape escuchando (el menú plegable
    // de la cabecera), este panel lo consume primero y solo se cierra él.
    function alTeclear(e: globalThis.KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        cerrar(true);
      }
    }
    // Un clic fuera cierra; el foco se queda donde la persona hizo clic
    function alPulsar(e: PointerEvent) {
      if (!contenedor.current?.contains(e.target as Node)) cerrar();
    }
    // Tab hacia fuera del contenedor cierra. Se usa focusin (y no blur) porque Safari
    // no da foco a los enlaces al hacer clic y cerraría el panel antes del clic.
    function alEnfocar(e: FocusEvent) {
      if (!contenedor.current?.contains(e.target as Node)) cerrar();
    }

    document.addEventListener("keydown", alTeclear, true);
    document.addEventListener("pointerdown", alPulsar);
    document.addEventListener("focusin", alEnfocar);
    return () => {
      document.removeEventListener("keydown", alTeclear, true);
      document.removeEventListener("pointerdown", alPulsar);
      document.removeEventListener("focusin", alEnfocar);
    };
  }, [abierto, cerrar]);

  // Teclas en el botón: flecha abajo abre y enfoca el primer elemento
  function alTeclearBoton(e: KeyboardEvent<HTMLButtonElement>) {
    if (e.key !== "ArrowDown") return;
    e.preventDefault();
    if (abierto) panel.current?.querySelector<HTMLElement>("[data-item]")?.focus();
    else abrir(true);
  }

  // Teclas dentro del panel: recorrer los elementos con las flechas
  function alTeclearPanel(e: KeyboardEvent<HTMLElement>) {
    const teclas = ["ArrowDown", "ArrowUp", "Home", "End"];
    if (!teclas.includes(e.key)) return;
    const elementos = Array.from(panel.current?.querySelectorAll<HTMLElement>("[data-item]") ?? []);
    if (elementos.length === 0) return;
    const actual = elementos.indexOf(document.activeElement as HTMLElement);
    let siguiente = actual;
    if (e.key === "ArrowDown") siguiente = (actual + 1) % elementos.length;
    if (e.key === "ArrowUp") siguiente = (actual - 1 + elementos.length) % elementos.length;
    if (e.key === "Home") siguiente = 0;
    if (e.key === "End") siguiente = elementos.length - 1;
    e.preventDefault();
    elementos[siguiente].focus();
  }

  return { abierto, contenedor, boton, panel, abrir, cerrar, alternar, alTeclearBoton, alTeclearPanel };
}
