// src/app/carrito/page.tsx
//
// Página del carrito. Muestra los productos agregados, permite ajustar
// cantidades, y al final tiene un formulario simple que - al enviarse -
// arma un correo pre-llenado (usando el protocolo "mailto:") dirigido al
// asesor, con el resumen completo del pedido. Esto simula el flujo real
// sin necesitar backend ni pasarela de pago todavía.

"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";

// Antes: const ASESOR_EMAIL = "asesor@comercialmaya.com" (quemado directo en el código)
// Ahora: lo leemos de una variable de entorno (ver .env.local.example).
// El "?? " define un valor de respaldo por si la variable no está configurada,
// así el proyecto no se rompe mientras aún no tienes el dato real confirmado.
const ASESOR_EMAIL = process.env.NEXT_PUBLIC_ADVISOR_EMAIL ?? "pendiente-confirmar@comercialmaya.com";

function formatPrice(price: number): string {
  return new Intl.NumberFormat("es-EC", {
    style: "currency",
    currency: "USD",
  }).format(price);
}

export default function CarritoPage() {
  const { items, removeItem, updateQuantity, totalPrice } = useCart();

  // Estado del formulario de contacto final (nombre, teléfono) - datos simples para el boceto
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  // Estado que controla si ya se "envió" el pedido, para mostrar la pantalla de confirmación
  const [orderSent, setOrderSent] = useState(false);

  // Arma el cuerpo del correo con el detalle del pedido, y abre el cliente de correo del usuario
  function handleSendOrder() {
    // Construimos el listado de productos como texto plano, línea por línea
    const itemsList = items
      .map(
        (item) =>
          `- ${item.name} x${item.quantity} (${
            item.price !== null ? formatPrice(item.price) : "precio a confirmar"
          })`
      )
      .join("%0D%0A"); // %0D%0A es el salto de línea codificado para URLs (usado en mailto)

    // Armamos el asunto y cuerpo del correo, todo codificado para que funcione en la URL de mailto
    const subject = encodeURIComponent(`Nuevo pedido de ${customerName || "cliente web"}`);
    const body = encodeURIComponent(
      `Cliente: ${customerName}\nTeléfono: ${customerPhone}\n\nProductos:\n`
    ).replace(/%0A/g, "%0D%0A") + itemsList + `%0D%0A%0D%0ATotal estimado: ${formatPrice(totalPrice)}`;

    // Armamos la URL mailto: completa y la abrimos - esto dispara el cliente de correo
    // predeterminado del usuario (Outlook, Gmail en el navegador, etc.) con todo pre-llenado
    window.location.href = `mailto:${ASESOR_EMAIL}?subject=${subject}&body=${body}`;

    setOrderSent(true); // mostramos la pantalla de confirmación independientemente de si el correo se envía
  }

  // CASO: carrito vacío - mostramos un mensaje simple con link para volver a comprar
  if (items.length === 0 && !orderSent) {
    return (
      <main className="flex min-h-[60vh] flex-col items-center justify-center bg-[#EFEDE7] px-6 text-center">
        <p className="text-lg text-[#232320]">Tu carrito está vacío.</p>
        <Link href="/" className="mt-4 text-sm text-[#A8562E] underline">
          Ver catálogo
        </Link>
      </main>
    );
  }

  // CASO: el pedido ya se "envió" - pantalla de confirmación
  if (orderSent) {
    return (
      <main className="flex min-h-[60vh] flex-col items-center justify-center bg-[#EFEDE7] px-6 text-center">
        <div className="max-w-md">
          <h1 className="font-[var(--font-heading)] text-2xl font-bold text-[#232320]">
            ¡Pedido enviado!
          </h1>
          <p className="mt-3 text-[#6B6862]">
            Se abrió tu aplicación de correo con el resumen del pedido dirigido a nuestro asesor.
            Si no se abrió automáticamente, contáctanos directamente a{" "}
            <span className="font-medium text-[#232320]">{ASESOR_EMAIL}</span>.
          </p>
          <Link
            href="/"
            className="mt-6 inline-block bg-[#232320] px-6 py-3 text-sm font-medium text-white hover:bg-[#A8562E]"
          >
            Volver al catálogo
          </Link>
        </div>
      </main>
    );
  }

  // CASO NORMAL: mostramos el carrito con productos y el formulario
  return (
    <main className="min-h-screen bg-[#EFEDE7] px-6 py-10">
      <div className="mx-auto max-w-3xl">
        <h1 className="font-[var(--font-heading)] text-2xl font-bold text-[#232320]">
          Tu pedido
        </h1>

        {/* Lista de productos en el carrito */}
        <div className="mt-6 divide-y divide-[#D8D4CC] border border-[#D8D4CC] bg-white">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-4 p-4">
              {/* Miniatura de la foto del producto */}
              <div className="relative h-20 w-20 shrink-0 overflow-hidden bg-[#EFEDE7]">
                <Image src={item.image} alt={item.name} fill sizes="80px" className="object-cover" />
              </div>

              {/* Nombre y precio unitario */}
              <div className="flex-1">
                <p className="font-medium text-[#232320]">{item.name}</p>
                <p className="text-sm text-[#6B6862]">
                  {item.price !== null ? formatPrice(item.price) : "Precio a confirmar"}
                </p>
              </div>

              {/* Controles de cantidad: botones - y + */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  className="h-7 w-7 border border-[#D8D4CC] text-[#232320] hover:bg-[#EFEDE7]"
                  aria-label="Disminuir cantidad"
                >
                  −
                </button>
                <span className="w-6 text-center text-sm">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="h-7 w-7 border border-[#D8D4CC] text-[#232320] hover:bg-[#EFEDE7]"
                  aria-label="Aumentar cantidad"
                >
                  +
                </button>
              </div>

              {/* Botón para quitar el producto completamente */}
              <button
                onClick={() => removeItem(item.id)}
                className="ml-2 text-sm text-[#6B6862] underline hover:text-[#A8562E]"
              >
                Quitar
              </button>
            </div>
          ))}
        </div>

        {/* Total estimado */}
        <div className="mt-4 flex items-center justify-between border-t border-[#D8D4CC] pt-4">
          <span className="text-[#6B6862]">Total estimado</span>
          <span className="text-xl font-semibold text-[#232320]">{formatPrice(totalPrice)}</span>
        </div>

        {/* Formulario final de contacto - datos mínimos para que el asesor sepa a quién contactar */}
        <div className="mt-8 border-t border-[#D8D4CC] pt-6">
          <h2 className="font-[var(--font-heading)] text-lg font-semibold text-[#232320]">
            Tus datos de contacto
          </h2>
          <div className="mt-4 space-y-3">
            <input
              type="text"
              placeholder="Nombre completo"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)} // actualiza el estado en cada tecla
              className="w-full border border-[#D8D4CC] bg-white px-4 py-2 text-sm outline-none focus:border-[#A8562E]"
            />
            <input
              type="tel"
              placeholder="Teléfono / WhatsApp"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="w-full border border-[#D8D4CC] bg-white px-4 py-2 text-sm outline-none focus:border-[#A8562E]"
            />
          </div>

          <button
            onClick={handleSendOrder}
            // Deshabilitamos el botón si no ha llenado nombre o teléfono, para no mandar un pedido incompleto
            disabled={!customerName || !customerPhone}
            className="mt-4 w-full bg-[#232320] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#A8562E] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Enviar pedido al asesor
          </button>
        </div>
      </div>
    </main>
  );
}
