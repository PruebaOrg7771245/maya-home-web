// src/components/AddToCartButton.tsx
//
// La página de detalle de producto (page.tsx) es un "server component"
// (no tiene "use client"), pero agregar al carrito requiere interactividad
// del navegador. Por eso separamos SOLO el botón en su propio componente
// cliente, y dejamos el resto de la página como estaba.

"use client";

import { useCart } from "@/context/CartContext";

type AddToCartButtonProps = {
  id: string;
  name: string;
  image: string;
  price: number | null;
};

export default function AddToCartButton({ id, name, image, price }: AddToCartButtonProps) {
  const { items, addItem, updateQuantity } = useCart();

  // Si el producto ya está en el carrito, esto no es null - es la fuente de
  // verdad de si mostramos el botón o el selector de cantidad. A diferencia
  // de un "✓" temporal, esto no desaparece solo: mientras el producto siga
  // en el carrito, el control sigue ahí, sin depender de que el cliente mire
  // el header (que puede quedar fuera de vista al hacer scroll).
  const cartItem = items.find((item) => item.id === id);

  if (!cartItem) {
    return (
      <button
        onClick={() => addItem({ id, name, image, price })}
        className="mt-8 w-full bg-[#232320] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#A8562E]"
      >
        Agregar al pedido
      </button>
    );
  }

  return (
    <div className="mt-8 flex w-full items-center justify-between border border-[#D8D4CC] bg-white px-6 py-3">
      <button
        onClick={() => updateQuantity(id, cartItem.quantity - 1)}
        aria-label="Disminuir cantidad"
        className="h-8 w-8 border border-[#D8D4CC] text-[#232320] transition-colors hover:bg-[#EFEDE7]"
      >
        −
      </button>
      <span aria-live="polite" className="text-sm font-medium text-[#232320]">
        {cartItem.quantity} en el pedido
      </span>
      <button
        onClick={() => updateQuantity(id, cartItem.quantity + 1)}
        aria-label="Aumentar cantidad"
        className="h-8 w-8 border border-[#D8D4CC] text-[#232320] transition-colors hover:bg-[#EFEDE7]"
      >
        +
      </button>
    </div>
  );
}
