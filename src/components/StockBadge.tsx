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
  { label: string; bg: string; text: string }
> = {
  in_stock: { label: "En stock", bg: "#E8F0E3", text: "#3F6B2C" },
  low_stock: { label: "Pocas unidades", bg: "#F5EAD9", text: "#8A5A1F" },
  out_of_stock: { label: "Agotado", bg: "#F5E3E0", text: "#A8362E" },
  unknown: { label: "Consultar disponibilidad", bg: "#EFEDE7", text: "#6B6862" },
};

export default function StockBadge({ stock }: { stock: StockInfo }) {
  const config = STATUS_CONFIG[stock.status]; // buscamos la configuración según el estado recibido

  return (
    <span
      className="inline-block px-3 py-1 text-xs font-medium"
      style={{ backgroundColor: config.bg, color: config.text }} // colores dinámicos, por eso van inline y no en Tailwind
    >
      {config.label}
      {/* Si conocemos la cantidad exacta, la mostramos entre paréntesis */}
      {stock.quantity !== null && ` (${stock.quantity} disponibles)`}
    </span>
  );
}
