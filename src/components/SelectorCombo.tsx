// src/components/SelectorCombo.tsx
//
// Parte interactiva de la página de una familia de combos. La página
// (combos/[familia]/page.tsx) es un server component: consulta el stock y arma
// las combinaciones; este componente solo elige entre ellas (lavamanos × mueble)
// y muestra foto, precio, disponibilidad y botón de la combinación elegida.
//
// Importa de "@/lib/combos" (lógica pura, segura para el navegador) y NUNCA
// de "@/lib/stock" ni de Supabase en tiempo de ejecución: solo tipos.

"use client";

import { useId, useState } from "react";
import Image from "next/image";
import type { FamiliaCombo, PiezaCombo } from "@/data/combos"; // solo los TIPOS
import { idCombinacion, nombreCombinacion, type CombinacionVista } from "@/lib/combos";
import type { StockInfo } from "@/lib/stock"; // solo el TIPO: no arrastra el cliente de servidor al navegador
import StockBadge from "@/components/StockBadge";
import AddToCartButton from "@/components/AddToCartButton";
import { formatPrice } from "@/lib/formatPrice";

type SelectorComboProps = {
  familia: FamiliaCombo; // solo las piezas de ESTA familia (nunca se mezclan familias)
  combinaciones: CombinacionVista[]; // todas las parejas lavamanos × mueble, ya calculadas en el servidor
};

// Estilo compartido del <select> y del texto fijo cuando solo hay una opción:
// borde 1px #D8D4CC, esquinas rectas, sin sombra. w-full + min-w-0 para que a
// 320 px no desborde aunque el nombre de la pieza sea largo.
const CAJA_CAMPO =
  "mt-1 block w-full min-w-0 border border-[#D8D4CC] px-3 py-2 text-sm text-[#232320]";

// Un campo de elección de pieza (lavamanos o mueble).
// - Varias piezas: <label> + <select> nativo asociados por id.
// - Una sola pieza: texto fijo (un select con una opción no sirve de nada).
function CampoPieza({
  etiqueta,
  piezas,
  valor,
  onCambio,
}: {
  etiqueta: string; // "Lavamanos" o "Mueble"
  piezas: PiezaCombo[]; // solo las piezas de la familia
  valor: string; // sku elegido
  onCambio: (sku: string) => void;
}) {
  const id = useId(); // une el label con su select

  if (piezas.length <= 1) {
    return (
      <div>
        <p className="text-sm font-medium text-[#232320]">{etiqueta}</p>
        {/* break-words: "Lavamanos CONNON SX800 · 80x52,5 cm · negro" se parte en vez de desbordar */}
        <p className={`${CAJA_CAMPO} break-words bg-[#EFEDE7]`}>{piezas[0]?.nombre}</p>
      </div>
    );
  }

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-[#232320]">
        {etiqueta}
      </label>
      <select
        id={id}
        value={valor}
        onChange={(e) => onCambio(e.target.value)}
        className={`${CAJA_CAMPO} bg-white motion-safe:transition-colors hover:border-[#A8562E] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#A8562E]`}
      >
        {piezas.map((pieza) => (
          <option key={pieza.sku} value={pieza.sku}>
            {pieza.etiqueta}
          </option>
        ))}
      </select>
    </div>
  );
}

export default function SelectorCombo({ familia, combinaciones }: SelectorComboProps) {
  // Selección inicial: la primera combinación que se pueda vender (con precio);
  // si ninguna se vende, la primera de la lista
  const inicial = combinaciones.find((c) => c.precio !== null) ?? combinaciones[0];
  const [skuLavamanos, setSkuLavamanos] = useState(
    inicial?.lavamanosSku ?? familia.lavamanos[0].sku
  );
  const [skuMueble, setSkuMueble] = useState(inicial?.muebleSku ?? familia.muebles[0].sku);

  // Piezas elegidas (siempre existen: los skus salen de la propia familia)
  const lavamanos = familia.lavamanos.find((p) => p.sku === skuLavamanos) ?? familia.lavamanos[0];
  const mueble = familia.muebles.find((p) => p.sku === skuMueble) ?? familia.muebles[0];

  // La combinación elegida se busca por su id dentro de las ya calculadas
  const idElegido = idCombinacion(familia, lavamanos, mueble);
  const combo = combinaciones.find((c) => c.id === idElegido) ?? inicial;

  // Sin combinaciones no hay nada que mostrar (no debería pasar: cada familia tiene piezas)
  if (!combo) return null;

  const precio = combo.precio;
  const status = combo.status;
  const vendible = precio !== null && status !== "no_vendible";

  return (
    // min-w-0 en cada columna del grid: sin eso un texto largo ensancha la columna y genera scroll horizontal
    <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
      {/* Foto grande de la combinación elegida */}
      <div className="min-w-0">
        <div className="relative aspect-[4/3] w-full overflow-hidden border border-[#D8D4CC] bg-[#EFEDE7]">
          <Image
            src={combo.imagen}
            alt={`${nombreCombinacion(familia)}: ${lavamanos.nombre} y ${mueble.nombre}`}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
        </div>
        {/* Sin foto propia se muestra la de la familia: se avisa que el color puede variar */}
        {combo.imagenReferencial && (
          <p className="mt-2 text-xs text-[#6B6862]">Imagen referencial: el color puede variar</p>
        )}
      </div>

      <div className="min-w-0">
        {/* Selectores: una lista por pieza, solo con las piezas de la familia */}
        <div className="space-y-4">
          <CampoPieza
            etiqueta="Lavamanos"
            piezas={familia.lavamanos}
            valor={skuLavamanos}
            onCambio={setSkuLavamanos}
          />
          <CampoPieza
            etiqueta="Mueble"
            piezas={familia.muebles}
            valor={skuMueble}
            onCambio={setSkuMueble}
          />
        </div>

        {/* Precio, disponibilidad y botón de la combinación elegida */}
        <div className="mt-8 border-t border-[#D8D4CC] pt-6">
          {precio !== null && status !== "no_vendible" ? (
            <>
              <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
                <span className="text-[#6B6862]">Precio (IVA incluido)</span>
                <span className="text-xl font-semibold text-[#232320]">{formatPrice(precio)}</span>
              </div>

              <div className="mt-3">
                {/* El badge pide un StockInfo: lo armamos con el estado y la existencia del combo */}
                <StockBadge stock={{ status, quantity: combo.stock, precio } satisfies StockInfo} />
              </div>

              {/* key = id de la combinación: el botón se queda montado entre selecciones
                  y, sin key, arrastraría el estado de la anterior. Agotado con precio
                  igual se puede agregar (el botón muestra el aviso de consultar). */}
              <AddToCartButton
                key={combo.id}
                id={combo.id}
                name={nombreCombinacion(familia)}
                image={combo.imagen}
                price={precio}
                agotado={status === "out_of_stock"}
              />
            </>
          ) : (
            // Combinación sin precio: no se puede vender. Botón visible pero deshabilitado
            // (mismo contenedor mt-8 que AddToCartButton para que no salte el layout).
            <div className="mt-8">
              <button
                type="button"
                disabled
                aria-disabled="true"
                className="w-full cursor-not-allowed border border-[#D8D4CC] bg-[#EFEDE7] px-6 py-3 text-sm font-medium text-[#6B6862]"
              >
                Agregar al pedido
              </button>
            </div>
          )}

          {/* Región siempre presente: un lector de pantalla solo anuncia los cambios
              dentro de una región que ya existía, no una que aparece de golpe */}
          <div role="status" aria-live="polite">
            {!vendible && (
              <p className="mt-3 border border-[#D8D4CC] bg-[#EFEDE7] px-3 py-2 text-sm text-[#6B6862]">
                Esta combinación no está disponible para la venta
              </p>
            )}
          </div>

          <p className="mt-4 text-xs text-[#6B6862]">
            Consulta nuestros descuentos por llevarte el combo
          </p>
        </div>
      </div>
    </div>
  );
}
