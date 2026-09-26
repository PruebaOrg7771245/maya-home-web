// src/app/carrito/page.tsx
//
// Página del carrito. Muestra los productos agregados, permite ajustar
// cantidades, y al final tiene un formulario simple que - al enviarse -
// arma un mensaje pre-llenado de WhatsApp (usando wa.me) dirigido al
// asesor, con el resumen completo del pedido. Esto simula el flujo real
// sin necesitar backend ni pasarela de pago: no se maneja pago en línea,
// el asesor se contacta directamente con el cliente para coordinar.

"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { ciudadesEcuador } from "@/data/ciudadesEcuador";
import {
  limpiarIdentificacion,
  validarIdentificacion,
  NOMBRE_TIPO,
} from "@/lib/identificacion";
import { limpiarTelefono, validarTelefono } from "@/lib/telefono";

// Igual que antes con el correo: lo leemos de una variable de entorno
// (ver .env.local.example) en vez de quemarlo en el código. El "?? " define
// un valor de respaldo por si la variable no está configurada todavía.
const ASESOR_PHONE = process.env.NEXT_PUBLIC_ADVISOR_PHONE ?? "";

// Validación de formato del email. RUC/cédula y teléfono se validan aparte
// (ver src/lib/identificacion.ts y src/lib/telefono.ts). Nombre solo se valida
// como "no vacío"; dirección y ciudad son opcionales.
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email.trim());
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat("es-EC", {
    style: "currency",
    currency: "USD",
  }).format(price);
}

export default function CarritoPage() {
  const { items, removeItem, updateQuantity, totalPrice } = useCart();

  // Estado del formulario de datos del cliente para el pedido
  const [customerRuc, setCustomerRuc] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerAddress, setCustomerAddress] = useState(""); // opcional
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerCity, setCustomerCity] = useState(""); // opcional
  const [customerEmail, setCustomerEmail] = useState("");
  // Campos "tocados" (perdieron el foco al menos una vez), para no mostrar
  // errores de validación antes de que el cliente haya intentado llenarlos
  const [touched, setTouched] = useState({ ruc: false, phone: false, email: false });
  // Estado que controla si ya se "envió" el pedido, para mostrar la pantalla de confirmación
  const [orderSent, setOrderSent] = useState(false);

  const identificacion = validarIdentificacion(customerRuc);
  const telefono = validarTelefono(customerPhone);
  const emailValid = isValidEmail(customerEmail);

  // Campos obligatorios (RUC/cédula, nombre, teléfono, email) llenos y con
  // formato válido. Dirección y ciudad son opcionales: no bloquean el envío.
  const isFormValid =
    identificacion.valido &&
    customerName.trim() !== "" &&
    telefono.valido &&
    emailValid;

  // Arma el mensaje con el detalle del pedido, y abre WhatsApp con todo pre-llenado
  function handleSendOrder() {
    // Construimos el listado de productos como texto plano, línea por línea
    const itemsList = items
      .map(
        (item) =>
          `- ${item.name} x${item.quantity} (${
            item.price !== null ? formatPrice(item.price) : "precio a confirmar"
          })`
      )
      .join("\n");

    // El asesor carga estos campos en mayúsculas en su sistema, así que los
    // convertimos acá - solo en el texto del mensaje, no en los inputs del
    // formulario. Ciudad se sube a mayúsculas sin importar si el cliente la
    // escribió a mano o la eligió del combobox (el datalist no cambia cómo
    // se guarda el valor, es el mismo string en ambos casos). El resto de
    // los campos (RUC/cédula, teléfono, email) se manda tal cual.
    const nombreMayusculas = customerName.trim().toUpperCase() || "cliente web";
    const direccionMayusculas = customerAddress.trim().toUpperCase() || "no especificada";
    const ciudadMayusculas = customerCity.trim().toUpperCase() || "no especificada";

    // Armamos el mensaje completo del pedido
    const message =
      `Nuevo pedido de ${nombreMayusculas}\n` +
      `${identificacion.tipo ? NOMBRE_TIPO[identificacion.tipo] : "RUC/Cédula"}: ${customerRuc}\n` +
      `Dirección: ${direccionMayusculas}\n` +
      `Ciudad: ${ciudadMayusculas}\n` +
      // Normalizado a formato internacional (+593...) para que el asesor pueda escribirle directo
      `Teléfono: ${telefono.normalizado ?? customerPhone}\n` +
      `Email: ${customerEmail}\n\n` +
      `Productos:\n${itemsList}\n\n` +
      `Total estimado: ${formatPrice(totalPrice)}`;

    // wa.me solo acepta el número en dígitos (con código de país, sin "+" ni espacios)
    const phoneDigits = ASESOR_PHONE.replace(/\D/g, "");

    // Armamos la URL de WhatsApp y la abrimos en una pestaña nueva - esto dispara
    // WhatsApp Web o la app del usuario (según el dispositivo) con el mensaje pre-llenado
    window.open(`https://wa.me/${phoneDigits}?text=${encodeURIComponent(message)}`, "_blank");

    setOrderSent(true); // mostramos la pantalla de confirmación independientemente de si el envío se completa
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
            ¡Pedido preparado!
          </h1>
          <p className="mt-3 text-[#6B6862]">
            Se abrió WhatsApp con el resumen de tu pedido listo para enviar a nuestro asesor.
            Si no se abrió automáticamente, contáctanos directamente al{" "}
            <span className="font-medium text-[#232320]">{ASESOR_PHONE || "número del asesor"}</span>.
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
    <main className="min-h-screen bg-[#EFEDE7]">
      {/* Link para volver al catálogo - no se puede asumir que el cliente
          sepa que el logo del header cumple esa función */}
      <div className="border-b border-[#D8D4CC] bg-white px-6 py-3">
        <Link href="/" className="text-sm text-[#6B6862] hover:text-[#232320]">
          ← Volver al catálogo
        </Link>
      </div>

      <div className="mx-auto max-w-3xl px-6 py-10">
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
            <div>
              <input
                type="text"
                inputMode="numeric"
                maxLength={13}
                placeholder="RUC / Cédula"
                value={customerRuc}
                // Solo dígitos y máximo 13: lo demás se descarta al escribir o pegar
                onChange={(e) => setCustomerRuc(limpiarIdentificacion(e.target.value))}
                onBlur={() => setTouched((t) => ({ ...t, ruc: true }))}
                className="w-full border border-[#D8D4CC] bg-white px-4 py-2 text-sm outline-none focus:border-[#A8562E]"
              />
              {/* Si es válido se muestra el tipo detectado apenas se completa;
                  el error recién después de salir del campo */}
              {identificacion.valido ? (
                <p className="mt-1 text-xs text-[#6B6862]">{identificacion.mensaje}</p>
              ) : (
                touched.ruc &&
                customerRuc !== "" && (
                  <p className="mt-1 text-xs text-red-600">{identificacion.mensaje}</p>
                )
              )}
            </div>
            <input
              type="text"
              placeholder="Nombre / Razón social"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)} // actualiza el estado en cada tecla
              className="w-full border border-[#D8D4CC] bg-white px-4 py-2 text-sm outline-none focus:border-[#A8562E]"
            />
            <input
              type="text"
              placeholder="Dirección (opcional)"
              value={customerAddress}
              onChange={(e) => setCustomerAddress(e.target.value)}
              className="w-full border border-[#D8D4CC] bg-white px-4 py-2 text-sm outline-none focus:border-[#A8562E]"
            />
            <div>
              <input
                type="text"
                list="ciudades-ecuador"
                placeholder="Ciudad (opcional)"
                value={customerCity}
                onChange={(e) => setCustomerCity(e.target.value)}
                autoComplete="off"
                className="w-full border border-[#D8D4CC] bg-white px-4 py-2 text-sm outline-none focus:border-[#A8562E]"
              />
              {/* datalist: filtra mientras se escribe (coincidencia parcial) y
                  también se puede abrir para ver la lista completa sin escribir nada */}
              <datalist id="ciudades-ecuador">
                {ciudadesEcuador.map((ciudad) => (
                  <option key={ciudad} value={ciudad} />
                ))}
              </datalist>
            </div>
            <div>
              <input
                type="tel"
                placeholder="Celular / WhatsApp (ej. 0987654321)"
                value={customerPhone}
                // Descarta letras y cualquier "+" que no esté al inicio
                onChange={(e) => setCustomerPhone(limpiarTelefono(e.target.value))}
                onBlur={() => setTouched((t) => ({ ...t, phone: true }))}
                aria-describedby="ayuda-telefono"
                className="w-full border border-[#D8D4CC] bg-white px-4 py-2 text-sm outline-none focus:border-[#A8562E]"
              />
              {/* Texto de ayuda siempre visible: el cliente debe saber que el
                  asesor lo va a contactar a este número */}
              <p id="ayuda-telefono" className="mt-1 text-xs text-[#6B6862]">
                Este es el número al que te contactará nuestro asesor. Si no es correcto, igual te
                escribiremos al número desde el que envíes este WhatsApp.
              </p>
              {touched.phone && customerPhone.trim() !== "" && !telefono.valido && (
                <p className="mt-1 text-xs text-red-600">{telefono.mensaje}</p>
              )}
            </div>
            <div>
              <input
                type="email"
                placeholder="Email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                className="w-full border border-[#D8D4CC] bg-white px-4 py-2 text-sm outline-none focus:border-[#A8562E]"
              />
              {touched.email && customerEmail.trim() !== "" && !emailValid && (
                <p className="mt-1 text-xs text-red-600">Ingresa un email válido.</p>
              )}
            </div>
          </div>

          <button
            onClick={handleSendOrder}
            // Deshabilitamos el botón si falta algún campo obligatorio o si teléfono/email no tienen formato válido
            disabled={!isFormValid}
            className="mt-4 w-full bg-[#232320] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#A8562E] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Enviar pedido al asesor
          </button>
        </div>
      </div>
    </main>
  );
}
