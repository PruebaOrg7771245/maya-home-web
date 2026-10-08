// src/components/StockBadge.tsx
//
// Componente puramente visual: recibe un StockInfo (ver src/lib/stock.ts)
// y muestra una etiqueta de color según el estado. No sabe de dónde viene
// el dato, solo lo muestra - así se mantiene desacoplado igual que el
// resto del sistema de stock.

import type { StockInfo } from "@/lib/stock";

// Mapa de configuración: para cada estado posible, qué texto y qué colores usar.
// Tenerlo como un objeto centralizado hace fácil agregar un nuevo estado después
// sin tener que escribir otro if/else.
const STATUS_CONFIG: Record<
  StockInfo["status"],
  { label: string; bg: string; text: string; border: string }
> = {
  // El borde de los estados de color es del mismo tono que el fondo (no se nota);
  // los neutros llevan el borde #D8D4CC para que el badge no se pierda cuando
  // está sobre el fondo piedra #EFEDE7 de la página de detalle.
  in_stock: { label: "En stock", bg: "#E8F0E3", text: "#3F6B2C", border: "#E8F0E3" },
  low_stock: { label: "Pocas unidades", bg: "#F5EAD9", text: "#8A5A1F", border: "#F5EAD9" },
  out_of_stock: { label: "Agotado", bg: "#F5E3E0", text: "#A8362E", border: "#F5E3E0" },
  unknown: { label: "Consultar disponibilidad", bg: "#EFEDE7", text: "#6B6862", border: "#D8D4CC" },
  // producto sin sku en el ERP: mismos colores neutros que "unknown"
  coming_soon: { label: "Próximamente", bg: "#EFEDE7", text: "#6B6862", border: "#D8D4CC" },
};

export default function StockBadge({ stock }: { stock: StockInfo }) {
  const config = STATUS_CONFIG[stock.status]; // buscamos la configuración según el estado recibido

  // La cantidad solo tiene sentido cuando hay unidades: en "Agotado" evitamos
  // el "(0 disponibles)", que repite lo que ya dice la etiqueta.
  const mostrarCantidad =
    (stock.status === "in_stock" || stock.status === "low_stock") &&
    stock.quantity !== null &&
    stock.quantity > 0;

  return (
    <span
      className="inline-block border px-3 py-1 text-xs font-medium"
      style={{ backgroundColor: config.bg, color: config.text, borderColor: config.border }} // colores dinámicos, por eso van inline y no en Tailwind
    >
      {config.label}
      {/* Si conocemos la cantidad exacta, la mostramos entre paréntesis (con singular para 1) */}
      {mostrarCantidad &&
        ` (${stock.quantity} ${stock.quantity === 1 ? "disponible" : "disponibles"})`}
    </span>
  );
}
