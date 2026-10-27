// src/lib/unidadVenta.ts
//
// Textos de cantidad y precio con unidad para productos que se venden por medida
// (Product.ventaPorMedida, hoy el piso de bambú por m²) y la regla de cajas
// completas (ventaPorMedida.medidaPorCaja). Lógica pura, sin React ni red: la usan
// la ficha, el carrito, el mensaje de WhatsApp, el correo al asesor y /api/pedido.
// Sin unidad, los textos son los de siempre.

import { formatPrice } from "./formatPrice.ts"; // ruta relativa con .ts: la importan los scripts de prueba con Node

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

// ---------- Regla de cajas (ADR-36) ----------
//
// Igual que el ERP: cajas = m² pedidos / medida por caja, redondeado al entero más
// cercano (mitad hacia arriba) y mínimo 1; m² facturados = cajas × medida por caja;
// total = m² facturados × precio, redondeado a centavos AL FINAL (mitad hacia arriba).
// Todo en ENTEROS: medidas en centésimas (1,37 m² = 137) y precios en centavos
// ($54,30 = 5430), para que no aparezcan residuos de punto flotante.

export type CalculoVenta = {
  cantidadPedida: number; // lo que escribió el cliente (m² o unidades), entero
  cajas: number | null; // null = el producto no se vende por cajas
  medidaFacturadaCentesimas: number; // m² (o unidades) facturados × 100
  totalCentavos: number; // total de la línea, IVA incluido, en centavos
};

// Precio del ERP (dólares, puede venir como 54.3) -> centavos enteros
export function aCentavos(precio: number): number {
  return Math.round(precio * 100);
}

// División entera redondeando a la mitad hacia arriba (solo enteros no negativos)
function dividirRedondeando(dividendo: number, divisor: number): number {
  return Math.floor((2 * dividendo + divisor) / (2 * divisor));
}

// UNA sola función para el importe de una línea (productos, por medida o no, y combos).
// Sin medidaPorCaja: cantidad × precio, como siempre.
export function calcularVentaPorMedida(
  cantidad: number,
  precio: number,
  medidaPorCaja?: number | null
): CalculoVenta {
  const precioCentavos = aCentavos(precio);
  if (!medidaPorCaja) {
    return {
      cantidadPedida: cantidad,
      cajas: null,
      medidaFacturadaCentesimas: cantidad * 100,
      totalCentavos: cantidad * precioCentavos,
    };
  }
  const cajaCentesimas = Math.round(medidaPorCaja * 100); // 1.37 -> 137
  const cajas = Math.max(1, dividirRedondeando(cantidad * 100, cajaCentesimas));
  const medidaFacturadaCentesimas = cajas * cajaCentesimas;
  // centésimas × centavos = centavos × 100 -> se divide entre 100 redondeando al final
  const totalCentavos = dividirRedondeando(medidaFacturadaCentesimas * precioCentavos, 100);
  return { cantidadPedida: cantidad, cajas, medidaFacturadaCentesimas, totalCentavos };
}

// Centavos -> "$669,52" (formatPrice es el único formato de precio del sitio)
export function formatCentavos(centavos: number): string {
  return formatPrice(centavos / 100);
}

// Centésimas -> "12,33" / "1.234,56" (es-EC), armado con enteros
export function textoMedida(centesimas: number): string {
  const entero = Math.floor(centesimas / 100).toLocaleString("es-EC");
  const decimales = String(centesimas % 100).padStart(2, "0");
  return `${entero},${decimales}`;
}

// "1 caja" / "9 cajas"
export function textoCajas(cajas: number): string {
  return cajas === 1 ? "1 caja" : `${cajas} cajas`;
}

// Aviso fijo de la ficha: "Se vende por cajas de 1,37 m². La cantidad se ajusta a cajas completas."
export function avisoCajas(medidaPorCaja: number, unidad: string): string {
  return `Se vende por cajas de ${textoMedida(Math.round(medidaPorCaja * 100))} ${unidad}. La cantidad se ajusta a cajas completas.`;
}

// Línea del carrito, bajo el nombre: "9 cajas · 12,33 m²" (los m² pedidos van en el
// campo de cantidad y el importe a su derecha)
export function detalleCajasCarrito(calculo: CalculoVenta, unidad: string): string {
  return `${textoCajas(calculo.cajas ?? 0)} · ${textoMedida(calculo.medidaFacturadaCentesimas)} ${unidad}`;
}

// WhatsApp y correo: "13 m² pedidos → 9 cajas (12,33 m²) · $669,52 ($54,30 por m² IVA incluido)"
export function textoCajasPedido(calculo: CalculoVenta, unidad: string, precio: number): string {
  return `${calculo.cantidadPedida} ${unidad} pedidos → ${textoCajas(calculo.cajas ?? 0)} (${textoMedida(
    calculo.medidaFacturadaCentesimas
  )} ${unidad}) · ${formatCentavos(calculo.totalCentavos)} (${formatPrice(precio)}${sufijoPrecio(
    unidad
  )} IVA incluido)`;
}
