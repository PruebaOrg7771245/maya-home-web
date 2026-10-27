// src/lib/cantidad.ts
//
// Cantidad escrita a mano en el selector de cantidad (ficha y carrito). Lógica
// pura, sin React ni red: la usan SelectorCantidad, el carrito y /api/pedido
// (mismo máximo en el navegador y en el servidor).

// Rango permitido de una línea de pedido: enteros de 1 a CANTIDAD_MAXIMA
export const CANTIDAD_MINIMA = 1;
export const CANTIDAD_MAXIMA = 9999;

// Lo que se acepta MIENTRAS se escribe: solo dígitos (puede quedar vacío). Así un
// "abc", "-5" o "1e3" pegado no entra al campo y se conserva el valor anterior.
export function esTextoCantidad(texto: string): boolean {
  return /^\d*$/.test(texto);
}

// Lleva un número al rango 1..CANTIDAD_MAXIMA (los decimales se descartan)
export function acotarCantidad(cantidad: number): number {
  if (!Number.isFinite(cantidad)) return CANTIDAD_MINIMA;
  return Math.min(CANTIDAD_MAXIMA, Math.max(CANTIDAD_MINIMA, Math.trunc(cantidad)));
}

// Texto -> cantidad final, al salir del campo o con Enter. Solo dígitos (se toleran
// espacios alrededor): "007" -> 7, "10000" -> 9999. Vacío, 0 o cualquier otra cosa
// ("abc", "12abc", "-5", "1e3") -> 1.
export function cantidadDesdeTexto(texto: string): number {
  const limpio = texto.trim();
  if (!/^\d+$/.test(limpio)) return CANTIDAD_MINIMA;
  return acotarCantidad(Number.parseInt(limpio, 10));
}

// Validación del servidor: entero entre 1 y CANTIDAD_MAXIMA (sin acotar: lo que
// no cumpla se rechaza). No se compara con la existencia: la confirma el asesor.
export function esCantidadValida(cantidad: unknown): cantidad is number {
  return (
    typeof cantidad === "number" &&
    Number.isInteger(cantidad) &&
    cantidad >= CANTIDAD_MINIMA &&
    cantidad <= CANTIDAD_MAXIMA
  );
}
