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
- `getStock(sku)` en `src/lib/stock.ts` es un placeholder: siempre devuelve
  `{ status: "unknown", quantity: null }`.
- No hay conexión real a SQL Server todavía.

## Opciones evaluadas (según comentario en el código)
- **Opción A - vía API:** un endpoint intermedio (`STOCK_API_URL`) que
  consulta SQL Server y devuelve el stock por SKU. `stock.ts` ya trae un
  ejemplo comentado de cómo se vería el `fetch`.
- **Opción B:** _(completar si hay otra alternativa evaluada con el
  encargado externo, ej. conexión directa, réplica, webhook, etc.)_

## Datos pendientes de confirmar con el encargado externo
- [ ] ¿Qué opción se va a implementar (A, B, otra)?
- [ ] Estructura del endpoint / tabla (campos, formato de SKU, unidades).
- [ ] Autenticación (API key, VPN, IP whitelist, etc.).
- [ ] Frecuencia de actualización del stock (tiempo real, polling, caché).
- [ ] Quién es el encargado externo y cómo contactarlo.
- [ ] Fecha estimada de entrega de la integración.

## Cuándo esto se resuelve
Cuando la integración esté lista, actualizar:
1. El contenido de `getStock()` en `src/lib/stock.ts` (el resto del
   proyecto no debería necesitar cambios — ver
   [ADR-1 en DECISIONS.md](./DECISIONS.md#adr-1-stock-detrás-de-un-adaptador-srclibstockts)).
2. Esta sección con el resultado final.
3. Agregar la entrada correspondiente en [`CHANGELOG.md`](./CHANGELOG.md).
