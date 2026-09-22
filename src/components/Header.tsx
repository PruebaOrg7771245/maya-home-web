// src/components/Header.tsx
//
// Encabezado global del sitio: logo + nombre de la empresa a la izquierda,
// ícono de carrito a la derecha. Por ahora todo es VISUAL/referencial -
// el carrito no tiene funcionalidad real todavía, es para que el cliente
// vea cómo se vería la navegación completa del sitio.
"use client";  // ahora necesita "use client" porque usa el hook useCart (estado interactivo)

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext"; // hook para leer el estado del carrito

export default function Header() {
  const { totalItems } = useCart();

  return (
    <header className="border-b border-[#D8D4CC] bg-white px-6 py-4">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          {/* Reemplazamos el SVG placeholder por el ícono real del logo de Maya Home.
              Usamos solo el ícono (casa + M) recortado del logo completo, para que
              quede compacto al lado del texto - el logo completo (con "MAYA HOME"
              debajo) se guarda aparte por si se necesita en otra parte del sitio
              (ej: pie de página, favicon, etc.) */}
          <Image
            src="/images/brand/logo-icon.png"
            alt="Maya Home"
            width={36}
            height={34}
            className="shrink-0"
          />

          <div>
            {/* Cambiado de "Comercial Maya" a "Maya Home" */}
            <p className="font-[var(--font-heading)] text-lg font-bold leading-none text-[#232320]">
              Maya Home
            </p>
            <p className="mt-1 text-xs text-[#6B6862]">
              Sanitarios y acabados para el hogar
              {/* Tagline provisional - el anterior ("Porcelanatos y pisos...")
                  ya no aplica porque el catálogo real es de línea sanitaria.
                  Ajustar cuando el cliente confirme cómo quiere describirse. */}
            </p>
          </div>
        </Link>

        <Link
          href="/carrito"
          aria-label="Ver carrito de pedido"
          className="relative rounded-full p-2 transition-colors hover:bg-[#EFEDE7]"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#A8562E] text-[10px] font-medium text-white">
              {totalItems}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
