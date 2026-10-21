// src/components/BotonWhatsApp.tsx
//
// Botón flotante de WhatsApp (abajo a la derecha). Server component: arma el enlace
// con sitio.redes.whatsapp, que sale de NEXT_PUBLIC_ADVISOR_PHONE (la misma variable
// que usa el carrito), y se lo pasa a BotonWhatsAppFlotante (cliente: ocultar al hacer
// scroll y globo de texto). Si no hay número, no se dibuja. Sin scripts de terceros ni
// seguimiento: es un enlace normal a wa.me.
//
// Se agrega en inicio, catálogo, ficha de producto y de combo; NO en el carrito
// (taparía sus botones).

import { sitio } from "@/data/sitio";
import BotonWhatsAppFlotante from "@/components/BotonWhatsAppFlotante";

export default function BotonWhatsApp({ producto }: { producto?: string }) {
  const base = sitio.redes.whatsapp;
  if (!base) return null;

  const mensaje = producto
    ? `Hola, quiero información sobre sus productos. Me interesa: ${producto}.`
    : "Hola, quiero información sobre sus productos.";

  return <BotonWhatsAppFlotante href={`${base}?text=${encodeURIComponent(mensaje)}`} />;
}
