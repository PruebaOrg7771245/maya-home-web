// src/components/ComboCard.tsx
//
// Tarjeta de UNA familia de combos (lavamanos + mueble) dentro del grid del
// catálogo. Mismo lenguaje visual que ProductCard: borde, fondo blanco, foto
// 4:3 y hover de borde en color acento. No elige piezas ni agrega al carrito:
// solo lleva a /combos/<familia>, donde se escoge la combinación.

import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/formatPrice";
import AvisoSinPrecio from "@/components/AvisoSinPrecio"; // mismo aviso que ProductCard cuando no hay precio
import type { StockInfo } from "@/lib/stock"; // solo el TIPO: no arrastra el cliente de servidor al navegador

// Lo que necesita la tarjeta; page.tsx arma un objeto así por cada familia
export type ComboCardData = {
  id: string; // id de la familia (va en la URL)
  nombre: string;
  descripcion: string;
  imagen: string;
  desde: number | null; // menor precio entre sus combinaciones vendibles; null = ninguna se vende
};

// Estado "sin precio" para reutilizar AvisoSinPrecio. Con status distinto de
// "coming_soon" el aviso dice "No disponible por ahora".
const SIN_PRECIO: StockInfo = { status: "unknown", quantity: null, precio: null };

export default function ComboCard({ combo }: { combo: ComboCardData }) {
  return (
    <Link
      href={`/combos/${combo.id}`}
      className="group block border border-[#D8D4CC] bg-white motion-safe:transition-colors hover:border-[#A8562E] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#A8562E]"
    >
      {/* Foto de la familia, misma proporción que ProductCard para que el grid quede alineado */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#EFEDE7]">
        <Image
          src={combo.imagen}
          alt={`Combo ${combo.nombre}`}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover motion-safe:transition-transform motion-safe:duration-300 motion-safe:group-hover:scale-105"
        />
      </div>

      <div className="p-4">
        <p className="text-xs text-[#6B6862]">Lavamanos + mueble</p>

        {/* break-words: nombres como "CONNON SX800" o "LUMINA-1600" no deben desbordar en 2 columnas */}
        <h3 className="mt-1 break-words font-[var(--font-heading)] text-lg font-semibold text-[#232320]">
          Combo {combo.nombre}
        </h3>

        {/* Descripción corta, limitada a 2 líneas para que todas las tarjetas midan parecido */}
        <p className="mt-1 line-clamp-2 text-sm text-[#6B6862]">{combo.descripcion}</p>

        <div className="mt-3 border-t border-[#D8D4CC] pt-3">
          {combo.desde !== null ? (
            // Apilado (etiqueta arriba, precio abajo) igual que ProductCard
            <div>
              <p className="text-xs text-[#6B6862]">Desde (IVA incluido)</p>
              <p className="mt-0.5 text-base font-semibold text-[#232320]">
                {formatPrice(combo.desde)}
              </p>
            </div>
          ) : (
            // Ninguna combinación de la familia tiene precio: no se muestra precio
            <AvisoSinPrecio stock={SIN_PRECIO} />
          )}

          <p className="mt-2 text-xs text-[#6B6862]">
            Consulta nuestros descuentos por llevarte el combo
          </p>
        </div>
      </div>
    </Link>
  );
}
