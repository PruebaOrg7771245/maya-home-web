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

## 25/09/2026 - Mejoras de UX en producto y carrito
- `AddToCartButton`: el "✓ Agregado" temporal (desaparecía a los 2s) se
  reemplazó por un selector de cantidad persistente (−, cantidad, +) en el
  mismo lugar del botón, leyendo/escribiendo directo de `useCart`. Al llegar
  a 0 vuelve a mostrarse "Agregar al pedido". Antes la única confirmación
  duradera de que el producto estaba en el carrito era mirar el header, que
  se pierde de vista al hacer scroll.
- `/carrito`: se agregó el link "← Volver al catálogo" también en la vista
  normal con productos (ya existía en el carrito vacío y en la confirmación
  de envío, pero no acá).
- `/carrito`: el mensaje de WhatsApp arma Nombre/Razón social, Dirección y
  Ciudad en MAYÚSCULAS (solo en el texto del mensaje, no en los inputs)
  porque el asesor los carga así en su sistema interno. Ciudad se sube a
  mayúsculas sin importar si el cliente la escribió a mano o la eligió del
  combobox (es el mismo string guardado en ambos casos). RUC/Cédula,
  Teléfono y Email se mandan tal cual los escribió el cliente.
- `/carrito`: el input de Ciudad pasa a ser un combobox (`<input list>` +
  `<datalist>`) con las ~138 localidades de `src/data/ciudadesEcuador.ts`,
  en vez de texto libre. Sigue siendo opcional. Ver ADR-6.

## 24/09/2026 - Validación de RUC/Cédula y teléfono en `/carrito`
- Nuevo `src/lib/identificacion.ts`: valida cédula y RUC ecuatorianos por
  dígito verificador, sin API. `validarIdentificacion()` detecta el tipo
  (cédula, RUC persona natural, sociedad privada o entidad pública) y
  devuelve `{ valido, tipo, mensaje }`. Ver ADR-5.
- Reglas: se rechaza `9999999999999` (Consumidor Final), no se valida el
  código de provincia y el establecimiento no puede ser `000`/`0000`.
- En `/carrito` el campo solo acepta dígitos (máx. 13), muestra el tipo
  detectado o el error al perder el foco, bloquea el envío si no es válido
  y el mensaje de WhatsApp etiqueta el número con el tipo detectado.
  Resuelve lo que había quedado pendiente para RUC/cédula el 23/09/2026.
- Nuevo `src/lib/telefono.ts` (reemplaza el `isValidPhone` genérico):
  `validarTelefono()` devuelve `{ valido, normalizado, mensaje }`. Acepta
  celular local de Ecuador (`09` + 8 dígitos), `593...` sin "+" y formato
  internacional con "+" o "00" (con 593 exige celular ecuatoriano; otros
  países solo largo E.164 de 8 a 15 dígitos). Rechaza números sin prefijo
  que no empiecen con 0 ni 593: no se sabe de qué país son. No se limita a
  Ecuador porque el sitio podría escalar a otros países.
- El teléfono va normalizado (`+593987654321`) en el mensaje de WhatsApp,
  y el campo tiene un texto de ayuda fijo aclarando que el asesor contactará
  a ese número (o, si no es correcto, al número desde el que se envíe el
  WhatsApp).
- Dirección y Ciudad pasan a ser opcionales (antes Dirección era
  obligatoria): no bloquean el envío y van como "no especificada" si están
  vacías.

## 24/09/2026 - Skills de Claude Code instaladas
- `vercel-react-best-practices` (guías de performance React/Next.js de
  Vercel, origen `vercel-labs/agent-skills`, fijada en `skills-lock.json`):
  instalada en `.agents/skills/` y enlazada por symlink desde
  `.claude/skills/` y `.windsurf/skills/`.
- `maya-home-design-system` (skill propia en `.claude/skills/`): paleta
  exacta, bordes/sombras y tipografía Archivo/Inter; se usa al crear o
  modificar cualquier UI.
- Ojo: `.claude/skills/` queda fuera de git por `.gitignore` (`.claude/*`
  solo exceptúa `agents/`); la skill propia no se versiona hasta que se
  agregue la excepción.

## 23/09/2026 - Build de producción con Webpack
- `npm run build` pasó de `next build --turbopack` a `next build`
  (Webpack) por un bug de Turbopack con `next/font/google` en el build de
  Vercel. `npm run dev` sigue con Turbopack. Ver ADR-4.
- Además se agregó `vercel.json` con `git.deploymentEnabled: false`: se
  desactivó el deploy automático de Vercel en cada push.

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
- Reemplaza al envío por correo (`mailto:` a `NEXT_PUBLIC_ADVISOR_EMAIL`),
  que queda sin uso. Ver ADR-2.
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
