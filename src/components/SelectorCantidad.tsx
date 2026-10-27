// src/components/SelectorCantidad.tsx
//
// Selector de cantidad ÚNICO del sitio: botón −, campo para escribir la cantidad y
// botón +. Lo usan la ficha (AddToCartButton, también en combos) y cada línea de
// /carrito, en dos densidades ("normal" y "compacto").
//
// El campo es de texto (no type="number": ese acepta "1e3", "-5" y cambia con la
// rueda del mouse) y guarda su propio texto mientras se escribe:
// - solo se aceptan dígitos (esTextoCantidad): pegar "abc" o "1e3" no cambia nada;
// - un número >= 1 se avisa al instante (onCambiar) para que el total se vea en vivo;
// - vacío o "0" se dejan mientras se escribe; al salir del campo o con Enter se
//   normaliza con cantidadDesdeTexto (vacío/0 -> 1, más de 9999 -> 9999).
// El − en 1 llama onCambiar(0): quien lo usa decide qué hacer (el carrito quita la línea).

"use client";

import { useState } from "react";
import {
  CANTIDAD_MAXIMA,
  acotarCantidad,
  cantidadDesdeTexto,
  esTextoCantidad,
} from "@/lib/cantidad";

type SelectorCantidadProps = {
  cantidad: number; // cantidad actual (la del carrito), de 1 a CANTIDAD_MAXIMA
  onCambiar: (cantidad: number) => void; // nueva cantidad; 0 = el − se pulsó estando en 1
  unidad?: string; // venta por medida (ej. "m²"): se muestra pegada al campo
  tamano?: "normal" | "compacto"; // normal = ficha; compacto = líneas del carrito
};

// Medidas de cada densidad. El campo alcanza para 4 dígitos (9999) en ambas.
const MEDIDAS = {
  normal: { boton: "h-8 w-8", campo: "h-8", entrada: "w-14", texto: "text-sm" },
  compacto: { boton: "h-7 w-7", campo: "h-7", entrada: "w-12", texto: "text-sm" },
} as const;

const CLASE_BOTON =
  "flex shrink-0 items-center justify-center border border-[#D8D4CC] bg-white text-[#232320] transition-colors hover:bg-[#EFEDE7] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white";

export default function SelectorCantidad({
  cantidad,
  onCambiar,
  unidad,
  tamano = "normal",
}: SelectorCantidadProps) {
  const medidas = MEDIDAS[tamano];

  // Texto del campo mientras se escribe (puede ser "" o "0" un momento)
  const [texto, setTexto] = useState(String(cantidad));

  // Si la cantidad cambia desde fuera (−, +, "Agregar" otra vez), el campo la
  // muestra. Se ajusta durante el render (sin efecto) y solo si el texto no dice ya
  // ese número: así no se pisa lo que se está escribiendo ("007" sigue siendo 7).
  const [cantidadPrevia, setCantidadPrevia] = useState(cantidad);
  if (cantidad !== cantidadPrevia) {
    setCantidadPrevia(cantidad);
    if (texto === "" || Number.parseInt(texto, 10) !== cantidad) {
      setTexto(String(cantidad));
    }
  }

  function alEscribir(nuevo: string) {
    if (!esTextoCantidad(nuevo)) return; // "abc", "-5", "1e3": se conserva lo anterior
    if (nuevo === "") {
      setTexto(nuevo); // vacío mientras se escribe; al salir pasa a 1
      return;
    }
    const numero = Number.parseInt(nuevo, 10);
    // Por encima del máximo el campo muestra directamente el máximo
    setTexto(numero > CANTIDAD_MAXIMA ? String(CANTIDAD_MAXIMA) : nuevo);
    if (numero >= 1) {
      const acotada = acotarCantidad(numero);
      if (acotada !== cantidad) onCambiar(acotada);
    }
  }

  // Al salir del campo o con Enter: cantidad final y texto normalizado ("007" -> "7")
  function confirmar() {
    const final = cantidadDesdeTexto(texto);
    setTexto(String(final));
    if (final !== cantidad) onCambiar(final);
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => onCambiar(cantidad - 1)}
        aria-label="Disminuir cantidad"
        className={`${CLASE_BOTON} ${medidas.boton}`}
      >
        −
      </button>

      {/* Campo + unidad dentro del mismo borde: "13 m²" se lee como un solo valor.
          El foco se marca en el borde exterior (el del campo se apaga para no duplicarlo). */}
      <div
        className={`flex items-center border border-[#D8D4CC] bg-white focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[#A8562E] ${medidas.campo}`}
      >
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete="off"
          aria-label={unidad ? `Cantidad en ${unidad}` : "Cantidad"}
          value={texto}
          onChange={(e) => alEscribir(e.target.value)}
          onBlur={confirmar}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              confirmar();
            }
          }}
          // Con unidad el número va a la derecha, junto a "m²"; sin ella, centrado
          className={`h-full bg-transparent tabular-nums text-[#232320] focus-visible:outline-none ${
            unidad ? "pl-2 text-right" : "text-center"
          } ${medidas.entrada} ${medidas.texto}`}
        />
        {unidad && (
          <span aria-hidden="true" className={`pl-1 pr-2 text-[#6B6862] ${medidas.texto}`}>
            {unidad}
          </span>
        )}
      </div>

      <button
        type="button"
        onClick={() => onCambiar(acotarCantidad(cantidad + 1))}
        disabled={cantidad >= CANTIDAD_MAXIMA}
        aria-label="Aumentar cantidad"
        className={`${CLASE_BOTON} ${medidas.boton}`}
      >
        +
      </button>
    </div>
  );
}
