# Requerimientos: integración de stock real (SQL Server)

Este documento existe porque `src/lib/stock.ts` menciona "el documento de
requerimientos que le mandaste al encargado externo" para la integración
con la base de datos SQL Server. Ese documento vive fuera del repo (se le
envió directamente al encargado externo); este archivo es el lugar donde
se deja constancia en el proyecto de qué se pidió y en qué quedó, para no
depender de memoria o de un chat externo.

**Pendiente de completar** — llenar con los datos reales cuando estén
disponibles.

## Estado actual
- Implementada una vía intermedia (no la Opción A): `src/lib/stock.ts` lee
  stock y precio de la tabla `stock_espejo` de Supabase
  (`codigo_producto`, `producto`, `existencia`, `precio_publico`,
  `actualizado_en`) con `supabaseServidor`. El ERP (SQL Server) sigue sin
  conexión directa desde la web.
- La tabla se llena A MANO ejecutando `sync-stock.js` desde la red de la
  oficina. No hay sincronización automática: los datos pueden estar
  desactualizados entre corridas.
- `precio_publico` ya incluye el 15% de IVA y es el único precio que se
  muestra en la web; los mayoristas no se usan.
- API de `stock.ts`: `getStock(sku)`, `getStockPorSkus(skus)` (una sola
  consulta `.in(...)`, usada por `/`) y `getPrecioProducto(sku)` (fuente de
  precio que usará `/api/pedido`; todavía lee `product.prices.minorista`
  hasta migrarlo).
- Estados: sin sku -> `coming_soon` (no consulta); sin fila o error de
  Supabase -> `unknown` con precio `null`; `existencia <= 0` ->
  `out_of_stock`; `1..5` -> `low_stock`; `> 5` -> `in_stock`.
- Verificado: `KW-7226WHITE` muestra 24 disponibles y $26,75.
- Pendiente: sincronización automática, combos, migrar `/api/pedido`.

## Opciones evaluadas (según comentario en el código)
- **Opción A - vía API:** un endpoint intermedio (`STOCK_API_URL`) que
  consulta SQL Server y devuelve el stock por SKU. `stock.ts` ya trae un
  ejemplo comentado de cómo se vería el `fetch`.
- **Opción B:** _(completar si hay otra alternativa evaluada con el
  encargado externo, ej. conexión directa, réplica, webhook, etc.)_

## Datos pendientes de confirmar con el encargado externo
- [x] ¿Qué opción se va a implementar (A, B, otra)? Resuelto: tabla espejo
  `stock_espejo` en Supabase, cargada con `sync-stock.js` (ni API ni conexión
  directa).
- [x] Estructura del endpoint / tabla (campos, formato de SKU, unidades).
  Resuelto: ver "Estado actual"; el SKU es `codigo_producto` (`sku` en
  `products.ts`, se aplica `trim()`).
- [ ] Autenticación (API key, VPN, IP whitelist, etc.).
- [ ] Frecuencia de actualización del stock (tiempo real, polling, caché).
  Hoy: manual (cada vez que se corre `sync-stock.js`); la web revalida cada
  60 s lo que haya en la tabla. Falta definir si se automatiza.
- [ ] Quién es el encargado externo y cómo contactarlo.
- [ ] Fecha estimada de entrega de la integración.

## Cuándo esto se resuelve
Cuando la integración esté lista, actualizar:
1. El contenido de `getStock()` en `src/lib/stock.ts` (el resto del
   proyecto no debería necesitar cambios — ver
   [ADR-1 en DECISIONS.md](./DECISIONS.md#adr-1-stock-detrás-de-un-adaptador-srclibstockts)).
2. Esta sección con el resultado final.
3. Agregar la entrada correspondiente en [`CHANGELOG.md`](./CHANGELOG.md).
