// src/lib/unidadVenta.ts
//
// Textos de cantidad y precio con unidad para productos que se venden por medida
// (Product.ventaPorMedida, hoy el piso de bambú por m²). Lógica pura, sin React ni
// red: la usan el carrito, el mensaje de WhatsApp y el correo al asesor. Sin unidad,
// los textos son los de siempre.

// Cantidad dentro de una línea de pedido: "2 m²" con unidad, "x2" sin ella
export function textoCantidad(cantidad: number, unidad?: string | null): string {
  return unidad ? `${cantidad} ${unidad}` : `x${cantidad}`;
}

// Cantidad suelta (columna del correo, contador del carrito): "2 m²" con unidad, "2" sin ella
export function cantidadConUnidad(cantidad: number, unidad?: string | null): string {
  return unidad ? `${cantidad} ${unidad}` : String(cantidad);
}

// Lo que va detrás del precio: " por m²" con unidad, "" sin ella
export function sufijoPrecio(unidad?: string | null): string {
  return unidad ? ` por ${unidad}` : "";
}
