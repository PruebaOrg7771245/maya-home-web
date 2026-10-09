// src/lib/formatPrice.ts
//
// ÚNICA función de formato de precio del sitio (catálogo, detalle, combos y
// carrito). Locale es-EC y moneda USD (Ecuador usa el dólar): ej. $479,10.
// Sin dependencias, así que sirve tanto en server como en client components.
// (El correo al asesor, src/lib/email.ts, tiene su propio formato porque es HTML de servidor.)

export function formatPrice(price: number): string {
  // Intl.NumberFormat da formato de moneda correcto sin tener que armarlo a mano
  return new Intl.NumberFormat("es-EC", {
    style: "currency",
    currency: "USD",
  }).format(price);
}
