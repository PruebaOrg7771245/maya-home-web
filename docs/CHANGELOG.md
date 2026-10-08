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

## 07/10/2026 - Etapa 1 de stock y precio reales (catálogo de 25 productos, espejo en Supabase)
- **Catálogo:** `src/data/products.ts` pasó de 9 a 25 productos, todos con
  `sku` = código del ERP (mapeo en
  [`MAPEO-PRODUCTOS-ERP.md`](./MAPEO-PRODUCTOS-ERP.md)). Hay **7 categorías**
  en el código (Lavamanos, Sanitarios, Dispensadores de jabón, Dispensadores
  de papel, Secadores de manos, Accesorios, Saunas), o sea 8 pestañas con
  "Todos". Se mantiene "Sanitarios" (no "Inodoros"). Ojo: el mapeo dice que los
  dispensadores van en una sola categoría "Dispensadores", pero el código
  todavía los separa en jabón y papel; pendiente de unificar o de ajustar
  el mapeo. Los precios ya no viven en `products.ts` (`prices` quedó en
  `null` en los 25 productos, campo vestigial).
- **Stock y precio:** salen de `stock_espejo` (Supabase), cargada a mano con
  `sync-stock.js` desde la red de la oficina. Solo se muestra el precio
  PÚBLICO con IVA incluido. `src/lib/stock.ts` expone `getStock`,
  `getStockPorSkus` (una consulta `.in(...)`) y `getPrecioProducto`; `/` pasó
  de client component a server component con `revalidate = 60` que pasa el
  stock por props a `CatalogoConFiltro`. Ver ADR-11.
- **`POST /api/pedido`:** ya no lee precios de `products.ts`; calcula el
  total en el servidor con el precio del ERP y guarda un snapshot
  `{ id, nombre, cantidad, precio, stock }`. Rechaza con `400` productos sin
  precio y acepta agotados. Ver ADR-12.
- **Interfaz:** sin precio = no se vende; agotado = se puede agregar con el
  aviso "Consulta la disponibilidad con tu asesor". Nuevo
  `AvisoSinPrecio.tsx`, badge neutro "No disponible por ahora", borde de 1px
  en los badges, etiqueta de precio apilada en la tarjeta y auto-scroll de
  la pestaña activa en `CategoryFilter`. Ver ADR-13.
- **Detalles:** el flag `sinStock` del carrito solo afecta el texto de
  WhatsApp (agrega "(sin stock: confirmar disponibilidad)"); el snapshot y el
  correo toman el estado de stock del servidor. `StockBadge` ya no muestra
  "(0 disponibles)" en Agotado. El correo rotula "(IVA incluido)" y marca
  "(sin stock)"; `/carrito` y el mensaje de WhatsApp también rotulan IVA
  incluido.
- **Infraestructura:** el proyecto se movió fuera de OneDrive a
  `C:\dev\e-commercetest` por errores de build. `src/lib/supabase.ts` ahora
  importa `"server-only"` (dependencia nueva) para que el build falle si
  alguien lo importa desde un componente cliente.
- **Pendientes:** etapa 2 (combos, ver `MAPEO-PRODUCTOS-ERP.md`); fotos
  finales (los 2 saunas no tienen foto y usan `placeholder.jpg`; el resto
  son del PDF, baja resolución); borrar los pedidos de prueba de la tabla
  `pedidos`; probar en producción el límite por IP de `/api/pedido` (ADR-9,
  nunca se probó en Vercel); probar el correo real (Resend) con los
  rótulos nuevos "(IVA incluido)" / "(sin stock)", que no se probó; y
  automatizar `sync-stock.js` (ver
  [`REQUIREMENTS-STOCK.md`](./REQUIREMENTS-STOCK.md)).

## 01/10/2026 - Reparto de correos entre varios asesores (round-robin)
- Nuevas piezas en Supabase (aplicadas a mano en el SQL Editor, no vía
  migraciones): tabla `asesores` (`id`, `nombre`, `email`, `activo`, RLS sin
  políticas públicas), columna `pedidos.asesor_id` (uuid, FK nullable) y la
  función `obtener_asesor_disponible()` (`language sql stable`), que elige
  el asesor activo con menos pedidos de canal "correo" en lo que va del mes.
  Ya se cargaron los 3 asesores reales.
- `src/lib/email.ts`: `enviarCorreoAsesor()` ahora recibe el destinatario
  (`{ email, nombre }`) como parámetro, en vez de leerlo fijo de
  `ADVISOR_EMAIL` a nivel de módulo.
- `POST /api/pedido`: para canal "correo", antes del insert llama por RPC a
  `obtener_asesor_disponible()`; si devuelve un asesor, ese recibe el correo
  y su `id` queda en `asesor_id` del pedido. Si no devuelve ninguno (no
  debería pasar en operación normal), cae a `ADVISOR_EMAIL` como respaldo de
  emergencia con un `console.warn`; si tampoco hay `ADVISOR_EMAIL`, no se
  intenta el envío y el pedido queda `estado_correo: "fallido"` directo. El
  canal "whatsapp" no cambia: `asesor_id` siempre `null`.
- Por qué: con varios asesores reales operando, hacía falta repartir la
  carga sin tocar código cada vez que se agrega, quita o pausa uno (por eso
  `activo` en la tabla en vez de una lista hardcodeada). El conteo mensual
  por asesor también sirve de base para calcular comisiones más adelante.
  Ver ADR-10.

## 01/10/2026 - Correo al asesor (Resend) y canal "correo" activado en el checkout
- Nuevo `src/lib/email.ts`: `enviarCorreoAsesor(pedido)` envía al asesor un
  correo HTML con los datos del cliente y el detalle del pedido, vía Resend
  (`RESEND_API_KEY` se lee solo del env). Nueva variable server-only
  `ADVISOR_EMAIL` (sin `NEXT_PUBLIC_`, a diferencia de
  `NEXT_PUBLIC_ADVISOR_PHONE`, porque este correo no se expone al cliente).
  `replyTo` apunta al email del cliente, así que si el asesor responde el
  correo le llega directo al cliente.
- `POST /api/pedido`: después del insert a Supabase, si `canal === "correo"`
  se llama a `enviarCorreoAsesor()` y se actualiza `estado_correo` de esa
  misma fila a `"enviado"` o `"fallido"` (el motivo del fallo solo se
  loguea con `console.error`, nunca se expone al cliente). La respuesta
  sigue siendo `201` si el insert funcionó, sin importar si el correo se
  pudo enviar: el pedido guardado es lo que importa, el correo es
  best-effort. Resuelve lo pendiente anotado el 29/09/2026 (ver ADR-8).
- `/carrito`: la opción "Que un asesor me contacte" del Paso 3 (antes
  deshabilitada con "Próximamente", ver ADR-7) ya es funcional: llama a
  `POST /api/pedido` con `canal: "correo"`. `handleSendOrder` ahora toma el
  canal como parámetro (WhatsApp y correo reutilizan el mismo payload). El
  estado `orderSent: boolean` se reemplazó por
  `sentChannel: "whatsapp" | "correo" | null`, para mostrar un mensaje de
  confirmación distinto por canal (correo: "Recibimos tu pedido, un asesor
  te contactará pronto", sin prometer plazo).
- A diferencia de WhatsApp (avanza a confirmación aunque el guardado en
  Supabase falle, porque WhatsApp se abre igual del lado del cliente), el
  canal correo depende enteramente de que el `POST /api/pedido` tenga
  éxito: si falla, muestra un error inline en el Paso 3 (mismo estilo que
  los errores de validación del Paso 2) y el cliente se queda ahí para
  reintentar, sin avanzar a la confirmación.
- Con esto el checkout pasa a tener dos canales reales (antes solo
  WhatsApp estaba conectado de verdad); ver notas agregadas a ADR-7 y
  ADR-8 en `DECISIONS.md`. `tsc --noEmit` sin errores.

## 30/09/2026 - Protecciones anti-bot/anti-abuso en `POST /api/pedido`
- Tres protecciones nuevas en `src/app/api/pedido/route.ts`, antes del
  insert a `pedidos`: 1) **honeypot** — campo oculto `sitioWeb` en el body;
  si llega con contenido se rechaza con `400` y mensaje genérico (sin
  delatar la trampa); 2) **límite por IP** — máx. 5 pedidos por IP
  (`x-forwarded-for`) en 10 minutos, `429` si se supera; 3)
  **deduplicación** — rechaza con `409` si el mismo RUC/cédula + teléfono
  ya mandó un pedido en los últimos 60 segundos (cubre doble clic). La IP
  ahora se guarda en la fila del pedido.
- `/carrito`: nuevo input oculto `name="sitioWeb"` (fuera del viewport con
  `position: absolute; left: -9999px`, no `display:none`, con
  `aria-hidden` y `tabIndex={-1}`) que se suma al body del fetch existente
  en `handleSendOrder`.
- Esquema de Supabase (ya aplicado por el usuario): columna `ip inet`
  (nullable) en `pedidos` y dos índices nuevos
  (`pedidos_ip_creado_en_idx` parcial `where ip is not null`,
  `pedidos_dedup_idx` sobre `ruc_cedula, telefono, creado_en`), ambos con
  `concurrently`. Ver ADR-9.
- Hecho en paralelo: agente `database` (servidor + esquema), agente
  `front-end` (input oculto). Lint y `tsc --noEmit` sin errores nuevos.

## 29/09/2026 - Conexión de Supabase y `POST /api/pedido`
- Nuevo agente versionado `.claude/agents/database.md`: dueño de todo lo
  que Maya Home guarda o lee de Supabase (cliente de servidor, rutas de
  servidor que persisten datos, esquema, RLS). `CLAUDE.md` ya quedó
  actualizado con esto (agente `database` y skill
  `supabase-postgres-best-practices`) en el commit `a45cf45`.
- Se conectó Supabase de verdad: `src/lib/supabase.ts` (cliente
  `supabaseServidor` con `service_role`, exclusivo de rutas de servidor) y
  la nueva ruta `POST /api/pedido`, que recalcula precio/total siempre
  desde `src/data/products.ts` por id (nunca confía en lo que manda el
  navegador) e inserta el pedido en la tabla `pedidos`.
- El agente `database` corrigió imports rotos que tenía `route.ts`
  (apuntaban a `@/lib/validarIdentificacion` y `@/lib/validarTelefono`,
  archivos inexistentes) para usar los reales `validarIdentificacion` de
  `src/lib/identificacion.ts` y `validarTelefono` de `src/lib/telefono.ts`,
  que devuelven objetos `{valido, ...}` en vez de booleanos. También
  endureció la validación de tipos del body JSON y ahora guarda el
  teléfono ya normalizado (`+593...`) en vez del string crudo.
- La tabla `pedidos` ya existía en Supabase antes de esta sesión, con RLS
  activo y sin políticas públicas (verificado en vivo: `select`/`insert`
  con la llave pública fallan; solo `supabaseServidor` puede escribir). No
  hizo falta SQL nuevo.
- Probado end-to-end con un pedido real: `201`, fila insertada y confirmada,
  luego borrada. Para la prueba se le puso precio temporal en `products.ts`
  al lavamanos `9636 M-001` (`minorista: 50, mayorista: 40`); quedó
  confirmado como precio real y no se revirtió. Lint y `tsc --noEmit` sin
  errores.
- `/carrito`: `handleSendOrder` ahora es `async` y, antes de abrir WhatsApp,
  hace `fetch("/api/pedido", { method: "POST", ... })` con canal
  `"whatsapp"` para guardar el pedido. Si el guardado falla, no bloquea el
  envío por WhatsApp — solo queda registrado con `console.error`. También
  se simplificaron dos textos de esa página (ayuda del campo teléfono y el
  paso "Cómo enviarlo").
- `src/lib/telefono.ts`: se simplificó el mensaje de error de validación de
  teléfono ecuatoriano.
- Pendiente: el envío real de correo (Resend) para el canal "correo" sigue
  sin implementar; el pedido queda con `estado_correo: "pendiente"`. Ver
  ADR-8.

## 28/09/2026 - Wizard de 3 pasos en `/carrito`
- `/carrito` pasó de un formulario único (lista + datos + botón "Enviar
  pedido al asesor") a un wizard de 3 pasos con estado local `step`: 1) "Tu
  pedido" (lista, cantidades, total), 2) "Tus datos" (resumen compacto del
  pedido + formulario completo de cliente) y 3) "Cómo enviarlo" (elegir
  WhatsApp o que un asesor contacte por correo).
- La opción "Que un asesor me contacte" queda deshabilitada ("Próximamente"):
  el envío por correo se conecta en la Fase 3 del proyecto, cuando el
  dominio esté listo.
- No cambió la lógica de validación (`isFormValid`, `validarIdentificacion`,
  `validarTelefono`, `isValidEmail`) ni `handleSendOrder`: solo se
  reorganizó el JSX en pasos y se agregó un indicador "Paso X de 3". Ver
  ADR-7.

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
