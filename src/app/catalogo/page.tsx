// src/app/catalogo/page.tsx
//
// Página del catálogo (ruta /catalogo; la portada "/" es otra página). Es un "server component" (sin "use client"):
// aquí se consulta el stock y el precio reales de TODOS los productos con
// UNA sola llamada a getStockPorSkus(), y se pasan por props al componente
// cliente CatalogoConFiltro, que conserva el filtro interactivo por categoría.

import { products } from "@/data/products";
import CatalogoConFiltro from "@/components/CatalogoConFiltro";
import BotonWhatsApp from "@/components/BotonWhatsApp";
import { getStockPorSkus, stockParaInterfaz, type StockInfo } from "@/lib/stock";
import { FAMILIAS_COMBO } from "@/data/combos";
import { tarjetaFamilia } from "@/lib/combos";

// Igual que productos/[id]: la página se puede regenerar como máximo cada 60
// segundos, para no mostrar stock/precio de hace días. Recordar que la tabla
// stock_espejo solo se actualiza cuando alguien corre sync-stock.js a mano.
export const revalidate = 60;

export default async function CatalogoPage() {
  // Solo los productos con sku se consultan; el resto queda como "coming_soon"
  const skusProductos = products.flatMap((p) => (p.sku ? [p.sku] : []));
  // Piezas de todos los combos: van en la MISMA consulta (una sola para toda la página)
  const skusCombos = FAMILIAS_COMBO.flatMap((f) => [
    ...f.lavamanos.map((p) => p.sku),
    ...f.muebles.map((p) => p.sku),
  ]);
  const stockPorSku = await getStockPorSkus([...new Set([...skusProductos, ...skusCombos])]); // UNA sola consulta

  // Armamos el mapa por id de producto (lo que usa el componente cliente)
  const sinSku: StockInfo = { status: "coming_soon", quantity: null, precio: null };
  const stockPorId: Record<string, StockInfo> = {};
  for (const product of products) {
    // Productos por medida: estado con su umbral y sin existencia (no viaja al navegador)
    stockPorId[product.id] = stockParaInterfaz(
      product.sku ? stockPorSku[product.sku] ?? sinSku : sinSku,
      product.ventaPorMedida
    );
  }

  // Una tarjeta por familia: "Desde $X" = menor precio entre sus combinaciones vendibles
  // (desde = null: ninguna combinación se vende). Mismo cálculo que el resumen de "/".
  const combos = FAMILIAS_COMBO.map((familia) => tarjetaFamilia(familia, stockPorSku));

  return (
    <>
      <CatalogoConFiltro stockPorId={stockPorId} combos={combos} />
      <BotonWhatsApp />
    </>
  );
}
