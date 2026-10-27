// src/components/AddToCartButton.tsx
//
// La página de detalle de producto (page.tsx) es un "server component"
// (no tiene "use client"), pero agregar al carrito requiere interactividad
// del navegador. Por eso separamos SOLO el botón en su propio componente
// cliente, y dejamos el resto de la página como estaba.
//
// Este componente solo se muestra para productos CON precio: un producto sin
// precio no se puede vender, y la página de detalle ni lo renderiza.

"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import SelectorCantidad from "@/components/SelectorCantidad";

type AddToCartButtonProps = {
  id: string;
  name: string;
  image: string;
  price: number; // precio público (IVA incluido); siempre existe, si no hay precio no se muestra este componente
  agotado?: boolean; // tiene precio pero no hay existencias: igual se puede agregar, con aviso
  unidad?: string; // producto vendido por medida (ej. "m²"): la cantidad se escribe en esa unidad
  medidaPorCaja?: number; // venta por cajas completas (ej. 1.37 m²): viaja al carrito, que muestra las cajas
};

export default function AddToCartButton({
  id,
  name,
  image,
  price,
  agotado = false,
  unidad,
  medidaPorCaja,
}: AddToCartButtonProps) {
  const { items, addItem, updateQuantity } = useCart();

  // Si el producto ya está en el carrito, esto no es null - es la fuente de
  // verdad de si mostramos el botón o el selector de cantidad. A diferencia
  // de un "✓" temporal, esto no desaparece solo: mientras el producto siga
  // en el carrito, el control sigue ahí, sin depender de que el cliente mire
  // el header (que puede quedar fuera de vista al hacer scroll).
  const cartItem = items.find((item) => item.id === id);

  return (
    <div className="mt-8">
      {!cartItem ? (
        <button
          onClick={() => addItem({ id, name, image, price, sinStock: agotado, unidad, medidaPorCaja })}
          // h-12 fija: misma altura que el cuadro "en el pedido", sin salto al cambiar de estado
          className="h-12 w-full bg-[#232320] px-6 text-sm font-medium text-white transition-colors hover:bg-[#A8562E] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#A8562E]"
        >
          Agregar al pedido
        </button>
      ) : (
        // Selector + "en el pedido", centrados en la caja (misma h-12 que el botón).
        // El − en 1 quita el producto del pedido y vuelve el botón.
        <div className="flex h-12 w-full items-center justify-center gap-3 border border-[#D8D4CC] bg-white px-4">
          <SelectorCantidad
            cantidad={cartItem.quantity}
            onCambiar={(cantidad) => updateQuantity(id, cantidad)}
            unidad={unidad}
          />
          {/* Por debajo de 360 px no cabe junto al selector con "m²": se oculta (el campo ya dice la cantidad) */}
          <span className="hidden whitespace-nowrap text-sm text-[#6B6862] min-[360px]:inline">en el pedido</span>
        </div>
      )}

      {/* Fila reservada (h-5) en ambos estados: "Ver carrito" aparece solo con el selector
          visible y el bloque no cambia de altura. Va debajo (no en la fila del selector)
          porque a 360 px ahí no cabe junto a "en el pedido". */}
      <div className="mt-2 h-5 text-center text-xs">
        {cartItem && (
          <Link
            href="/carrito"
            className="text-[#6B6862] underline-offset-2 hover:text-[#232320] hover:underline focus-visible:text-[#232320] focus-visible:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#A8562E]"
          >
            Ver carrito
          </Link>
        )}
      </div>

      {/* Aviso de agotado: se mantiene tanto con el botón como con el selector
          de cantidad, para que no desaparezca después de agregar */}
      {agotado && (
        <p className="mt-1 text-xs text-[#6B6862]">
          Sin stock por ahora. Consulta la disponibilidad con tu asesor.
        </p>
      )}
    </div>
  );
}
