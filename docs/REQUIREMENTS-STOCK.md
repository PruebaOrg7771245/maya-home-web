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
- API de `stock.ts`: `getStock(sku)` (detalle de producto),
  `getStockPorSkus(skus)` (una sola consulta `.in(...)`, usada por `/` y por
  `/api/pedido`) y `getPrecioProducto(sku)` (sin uso actual en rutas).
  `/api/pedido` ya calcula el total con este precio (ADR-12).
- Catálogo: 25 productos con `sku` = código del ERP (ver
  [`MAPEO-PRODUCTOS-ERP.md`](./MAPEO-PRODUCTOS-ERP.md)); los precios ya no
  están en `products.ts`. Decisión y alternativas descartadas en ADR-11
  (SQL Server desde Vercel: IP privada, IP fija $120/mes).
- Estados: sin sku -> `coming_soon` (no consulta); sin fila o error de
  Supabase -> `unknown` con precio `null`; `existencia <= 0` ->
  `out_of_stock`; `1..5` -> `low_stock`; `> 5` -> `in_stock`.
- Verificado: `KW-7226WHITE` muestra 24 disponibles y $26,75.
- Combos (etapa 2, hecha el 08/10/2026): stock = menor existencia de las 2
  piezas, precio = suma de los públicos con IVA (ver ADR-14/15). Usan
  `getStockPorSkus` con una sola consulta por página; `stock.ts` no cambió de
  forma. El umbral de stock ahora vive en `src/lib/umbralStock.ts`. Limitación
  conocida: combos que comparten pieza no descuentan stock entre sí. Si los
  datos del espejo faltan para alguna pieza, el combo no se vende; por eso es
  más importante que `sync-stock.js` cargue las 13 piezas de combos.
- Pendiente: sincronización automática. Ya no está pendiente migrar
  `/api/pedido` (hecho el 07/10/2026).
- Pendiente al corregir `sync-stock.js`: el código del mueble
  `MUEBLLUX-600SMOKE` tiene espacios al final en el ERP (el `trim()` de
  `stock.ts` lo cubre al leer, pero conviene limpiarlo al cargar el espejo).

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
- [x] Autenticación: no aplica con la tabla espejo (la web solo habla con
  Supabase vía `service_role` en servidor; el ERP se consulta únicamente
  desde la oficina al correr `sync-stock.js`).
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
