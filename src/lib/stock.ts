// src/lib/stock.ts
//
// Este archivo es el ÚNICO lugar del proyecto que "sabe" de dónde viene
// el stock. El resto del código (páginas, componentes) solo llama a la
// función getStock() de aquí abajo, sin saber ni importar si el dato viene
// de una base de datos real, una API, o un valor de referencia (como ahora).
//
// Esto es el mismo patrón de "adaptador" que usamos para el proveedor de
// pago: hoy es un placeholder, y cuando tengas la integración con SQL
// Server lista (ver el documento de requerimientos que le mandaste al
// encargado externo), solo reemplazas el CONTENIDO de esta función -
// ningún otro archivo del proyecto necesita cambiar.

// Los posibles estados de disponibilidad que puede mostrar la web
export type StockStatus = "in_stock" | "low_stock" | "out_of_stock" | "unknown";

// Lo que devuelve la función: el estado + la cantidad exacta (si se conoce)
export type StockInfo = {
  status: StockStatus;
  quantity: number | null; // null cuando aún no tenemos el dato real
};

// Función principal - recibe el SKU/id del producto y devuelve su disponibilidad.
// Es "async" (asíncrona) a propósito: aunque hoy no consulta nada externo,
// cuando conectemos la base de datos real SÍ va a necesitar esperar una
// respuesta de red - dejar la función async desde ya evita tener que
// cambiar cómo se LLAMA a esta función en el resto del proyecto.
export async function getStock(sku: string): Promise<StockInfo> {
  // ------------------------------------------------------------------
  // PLACEHOLDER ACTUAL - reemplazar este bloque cuando esté lista la
  // integración con la base de datos SQL Server externa.
  //
  // Ejemplo de cómo se vería reemplazado más adelante (Opción A del
  // documento de requerimientos, vía API):
  //
  //   const response = await fetch(`${process.env.STOCK_API_URL}/stock/${sku}`);
  //   const data = await response.json();
  //   return { status: data.quantity > 0 ? "in_stock" : "out_of_stock", quantity: data.quantity };
  //
  // ------------------------------------------------------------------
  return {
    status: "unknown", // "unknown" = todavía no tenemos el dato real, se lo pedimos al cliente
    quantity: null,
  };
}
