// src/components/AvisoSinPrecio.tsx
//
// Qué mostramos cuando un producto NO tiene precio (y por lo tanto no se puede
// vender ni agregar al pedido). Se usa en la tarjeta del catálogo y en la
// página de detalle, para que los dos lugares digan exactamente lo mismo:
// - sin sku (aún no está en el ERP)       -> badge "Próximamente" (el de siempre)
// - con sku pero sin precio (error de datos, o sin fila en el ERP)
//                                          -> "No disponible por ahora"
//
// Componente puramente visual, sin estado: sirve tanto en server como en
// client components. Solo importa el TIPO de stock.ts (no arrastra el cliente
// de servidor al navegador).

import StockBadge from "@/components/StockBadge";
import type { StockInfo } from "@/lib/stock";

export default function AvisoSinPrecio({ stock }: { stock: StockInfo }) {
  // Producto sin sku: el badge "Próximamente" que ya existía
  if (stock.status === "coming_soon") {
    return <StockBadge stock={stock} />;
  }

  // Tiene sku pero no precio: mismos neutros que el badge "Próximamente"
  // (no es un estado de stock, así que no usamos los colores semánticos de stock)
  return (
    <span className="inline-block border border-[#D8D4CC] bg-[#EFEDE7] px-3 py-1 text-xs font-medium text-[#6B6862]">
      No disponible por ahora
    </span>
  );
}
