// src/components/ProductGallery.tsx
//
// Galería de la ficha de producto: foto principal grande y, si hay más de una
// foto, miniaturas debajo. Es "use client" porque guarda cuál foto está activa.
//
// - Teclado: las miniaturas son botones (Tab, Enter/Espacio); con el foco en una,
//   las flechas, Inicio y Fin cambian de foto.
// - Táctil: tocar una miniatura o deslizar la foto principal a izquierda/derecha.
// - La miniatura activa se distingue SIN depender solo del color: borde más grueso
//   (2px frente a 1px) y las demás atenuadas, además del borde de acento.
// - Las fotos NUNCA se recortan (object-contain): si su proporción no es 4:3 queda
//   fondo piedra a los lados o arriba/abajo.
// - Una sola foto = sin miniaturas. El espacio de la foto principal (4:3) y el de
//   las miniaturas están reservados: no hay saltos de diseño al cargar.
//
// MEJORA FUTURA (no implementada a propósito): zoom de la foto. Las fotos actuales
// salen del catálogo PDF en baja resolución (~250-500 px) y ampliarlas se vería
// borroso; añadirlo cuando haya fotos originales en alta resolución.

"use client";

import { useRef, useState, type KeyboardEvent, type TouchEvent } from "react";
import Image from "next/image";
import { esPlaceholder } from "@/lib/fichaProducto";

type ProductGalleryProps = {
  images: string[]; // rutas de las fotos (ya con el placeholder si el producto no tiene ninguna)
  productName: string; // base del texto alternativo de cada foto
  altFoto?: string; // texto alternativo de la foto principal (products.ts), si existe
  alts?: string[]; // OPCIONAL: alt de cada foto por posición (combos); si falta una, se usa el genérico
};

// Distancia mínima (px) de un deslizamiento horizontal para cambiar de foto
const UMBRAL_DESLIZAMIENTO = 40;

export default function ProductGallery({ images, productName, altFoto, alts }: ProductGalleryProps) {
  // Índice de la foto que se ve grande. Empieza en la primera (la principal).
  const [indice, setIndice] = useState(0);
  const botones = useRef<(HTMLButtonElement | null)[]>([]);
  const inicioToque = useRef<{ x: number; y: number } | null>(null);

  const total = images.length;
  const hayVarias = total > 1;
  const actual = images[indice] ?? images[0];

  // Cambia de foto con vuelta al principio/final (índices circulares)
  function ir(nuevo: number, enfocar = false) {
    const destino = (nuevo + total) % total;
    setIndice(destino);
    if (enfocar) botones.current[destino]?.focus();
  }

  function alTeclear(e: KeyboardEvent<HTMLButtonElement>) {
    const mover: Record<string, number | undefined> = {
      ArrowRight: indice + 1,
      ArrowDown: indice + 1,
      ArrowLeft: indice - 1,
      ArrowUp: indice - 1,
      Home: 0,
      End: total - 1,
    };
    const destino = mover[e.key];
    if (destino === undefined) return;
    e.preventDefault();
    ir(destino, true);
  }

  function alEmpezarToque(e: TouchEvent<HTMLDivElement>) {
    const toque = e.touches[0];
    inicioToque.current = { x: toque.clientX, y: toque.clientY };
  }

  function alTerminarToque(e: TouchEvent<HTMLDivElement>) {
    const inicio = inicioToque.current;
    inicioToque.current = null;
    if (!inicio || !hayVarias) return;
    const toque = e.changedTouches[0];
    const dx = toque.clientX - inicio.x;
    const dy = toque.clientY - inicio.y;
    // Solo cuenta un gesto claramente horizontal (el vertical es para hacer scroll)
    if (Math.abs(dx) >= UMBRAL_DESLIZAMIENTO && Math.abs(dx) > Math.abs(dy) * 1.5) {
      ir(dx < 0 ? indice + 1 : indice - 1);
    }
  }

  // El placeholder no es una foto del producto: el alt lo dice con honestidad.
  // La foto principal (posición 1) usa altFoto si el producto lo tiene.
  const altDe = (ruta: string, posicion: number) =>
    esPlaceholder(ruta)
      ? `${productName} - sin foto disponible`
      : alts?.[posicion - 1]
        ? alts[posicion - 1]
        : posicion === 1 && altFoto
          ? altFoto
          : `${productName} - vista ${posicion}`;

  return (
    <div role="group" aria-label={`Fotos de ${productName}`}>
      {/* Foto principal. aspect-[4/3] reserva el alto antes de que cargue la imagen.
          touch-pan-y: el scroll vertical sigue funcionando y el horizontal lo maneja el gesto. */}
      <div
        onTouchStart={hayVarias ? alEmpezarToque : undefined}
        onTouchEnd={hayVarias ? alTerminarToque : undefined}
        className="relative aspect-[4/3] w-full touch-pan-y overflow-hidden border border-[#D8D4CC] bg-[#EFEDE7]"
      >
        {/* Capa decorativa: misma foto activa, desenfocada y ampliada para que no asomen bordes claros */}
        {!esPlaceholder(actual) && (
          <Image
            src={actual}
            alt=""
            aria-hidden="true"
            fill
            sizes="64px"
            className="scale-110 object-cover opacity-40 blur-[24px]"
          />
        )}
        <Image
          src={actual}
          alt={altDe(actual, indice + 1)}
          fill
          // Ancho real de la columna: móvil = pantalla - 48 px de márgenes; en md hay dos
          // columnas (contenedor de 1024 px máx. con 48 de márgenes y 40 de separación)
          sizes="(max-width: 767px) calc(100vw - 48px), (max-width: 1023px) calc((100vw - 88px) / 2), 468px"
          className="object-contain"
          priority // es la imagen más importante de la página: carga de inmediato
        />
      </div>

      {/* Anuncia el cambio de foto a lectores de pantalla (no se ve) */}
      {hayVarias && (
        <p role="status" aria-live="polite" className="sr-only">
          Foto {indice + 1} de {total}
        </p>
      )}

      {/* Miniaturas: solo con más de una foto. h-16 fijo y flex-wrap: sin saltos ni scroll horizontal */}
      {hayVarias && (
        <ul className="mt-3 flex flex-wrap gap-2">
          {images.map((ruta, i) => {
            const activa = i === indice;
            return (
              <li key={ruta}>
                <button
                  ref={(el) => {
                    botones.current[i] = el;
                  }}
                  type="button"
                  onClick={() => ir(i)}
                  onKeyDown={alTeclear}
                  aria-label={`Ver foto ${i + 1} de ${total}`}
                  aria-current={activa ? "true" : undefined}
                  className={`relative block h-16 w-16 overflow-hidden bg-[#EFEDE7] motion-safe:transition-opacity ${
                    activa
                      ? "border-2 border-[#A8562E]"
                      : "border border-[#D8D4CC] opacity-60 hover:opacity-100"
                  }`}
                >
                  <Image src={ruta} alt="" fill sizes="64px" className="object-contain" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
