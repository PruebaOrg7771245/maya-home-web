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

import { useCart } from "@/context/CartContext";

type AddToCartButtonProps = {
  id: string;
  name: string;
  image: string;
  price: number; // precio público (IVA incluido); siempre existe, si no hay precio no se muestra este componente
  agotado?: boolean; // tiene precio pero no hay existencias: igual se puede agregar, con aviso
};

export default function AddToCartButton({
  id,
  name,
  image,
  price,
  agotado = false,
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
          onClick={() => addItem({ id, name, image, price, sinStock: agotado })}
          className="w-full bg-[#232320] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#A8562E] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#A8562E]"
        >
          Agregar al pedido
        </button>
      ) : (
        <div className="flex w-full items-center justify-between border border-[#D8D4CC] bg-white px-6 py-3">
          <button
            onClick={() => updateQuantity(id, cartItem.quantity - 1)}
            aria-label="Disminuir cantidad"
            className="h-8 w-8 border border-[#D8D4CC] text-[#232320] transition-colors hover:bg-[#EFEDE7] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#A8562E]"
          >
            −
          </button>
          <span aria-live="polite" className="text-sm font-medium text-[#232320]">
            {cartItem.quantity} en el pedido
          </span>
          <button
            onClick={() => updateQuantity(id, cartItem.quantity + 1)}
            aria-label="Aumentar cantidad"
            className="h-8 w-8 border border-[#D8D4CC] text-[#232320] transition-colors hover:bg-[#EFEDE7] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#A8562E]"
          >
            +
          </button>
        </div>
      )}

      {/* Aviso de agotado: se mantiene tanto con el botón como con el selector
          de cantidad, para que no desaparezca después de agregar */}
      {agotado && (
        <p className="mt-2 text-xs text-[#6B6862]">
          Sin stock por ahora. Consulta la disponibilidad con tu asesor.
        </p>
      )}
    </div>
  );
}
