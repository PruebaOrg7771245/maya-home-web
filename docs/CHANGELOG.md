# Changelog

Registro cronológico de cambios relevantes del proyecto. Cada entrada explica
**qué** cambió y, cuando no es obvio, **por qué**. El objetivo es poder
reconstruir la historia de decisiones sin tener que leer todo el código o el
historial de git.

Fechas en formato **DD/MM/YYYY** (estándar latinoamericano) — ver
convención en [`CLAUDE.md`](../CLAUDE.md).

Formato de entrada:

```
## DD/MM/YYYY - Título corto
- Qué cambió.
- Por qué (si no es obvio).
```

---

## 23/09/2026 - Más datos del cliente en el formulario de `/carrito`
- El formulario final de `/carrito` ahora pide RUC/Cédula, Nombre/Razón
  social (reemplaza a "Nombre completo"), Dirección, Ciudad (opcional),
  Teléfono/WhatsApp y Email, en vez de solo nombre y teléfono.
- Teléfono y email se validan con formato (regex simple de email; teléfono
  con 8 a 15 dígitos, "+" opcional) y muestran error solo después de que el
  campo pierde el foco (`touched`). El botón "Enviar pedido al asesor" se
  deshabilita si falta algún campo obligatorio o el formato no es válido.
- RUC/cédula, nombre y dirección solo se validan como "no vacíos" por
  ahora: su validación de formato específica queda pendiente para una
  iteración futura, por decisión explícita del cliente del proyecto.
- El mensaje de WhatsApp armado en `handleSendOrder` incluye ahora todos
  estos datos (Ciudad se envía como "no especificada" si quedó vacía).

## 22/09/2026 - Checkout vía WhatsApp
- Se conectó el carrito con WhatsApp (`wa.me`): al enviar el pedido se arma
  un mensaje pre-llenado con el detalle de productos, cantidades, total y
  datos de contacto, dirigido al número del asesor (`NEXT_PUBLIC_ADVISOR_PHONE`).
- No hay pasarela de pago ni backend de pedidos: el asesor coordina el pago
  y envío manualmente con cada cliente.

## 20/09/2026 - Preparación del stock real
- Se creó `src/lib/stock.ts` como único punto de acceso al stock, con
  patrón adaptador: el resto del proyecto llama a `getStock(sku)` sin saber
  si el dato viene de una base de datos, una API o un valor placeholder.
- Hoy devuelve siempre `status: "unknown"` (placeholder). La integración
  real con SQL Server queda pendiente — ver
  [`REQUIREMENTS-STOCK.md`](./REQUIREMENTS-STOCK.md).

## 14/09/2026 - Flujo de compra
- Se armó el flujo de compra: página de carrito, ajuste de cantidades,
  cálculo de total y formulario de datos de contacto.

## 10/09/2026 - Mejoras en el header
- Ajustes de navegación y presentación en el header del sitio.

## 08/09/2026 - Migración a Next.js 15 con catálogo real
- Migración del boceto a Next.js 15 (App Router) con catálogo de productos
  real (`src/data/products.ts`), galería de imágenes y filtro por categoría.

## 07/09/2026 - Setup inicial
- Proyecto creado con `create-next-app`.
