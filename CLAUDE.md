# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Proyecto: e-commerce de cerámica (Next.js 15)

Sitio de catálogo ("Maya Home") con carrito y checkout vía WhatsApp (sin
pasarela de pago ni backend propio). Ver `docs/` para el contexto completo
antes de asumir nada sobre el estado del proyecto.

## Comandos

- `npm run dev` — servidor de desarrollo (Turbopack) en `http://localhost:3000`.
- `npm run build` — build de producción (Webpack; se quitó Turbopack de
  este comando por un bug conocido con `next/font/google` en Vercel — ver
  ADR correspondiente en DECISIONS.md). El `dev` sigue usando Turbopack sin
  problema.
- `npm run lint` — ESLint 9 (flat config en `eslint.config.mjs`).
- No hay framework de tests configurado.

**Ruta del proyecto:** `C:\dev\e-commercetest`. El proyecto vive fuera de
OneDrive a propósito (dentro de OneDrive daba errores de build); no moverlo
de vuelta.

Variables de entorno en `.env.local` (no versionado):
`NEXT_PUBLIC_ADVISOR_PHONE` (número de WhatsApp con código de país, destino
de los pedidos), `NEXT_PUBLIC_ADVISOR_EMAIL` (sin uso actual),
`NEXT_PUBLIC_SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` (solo servidor),
`RESEND_API_KEY` y `ADVISOR_EMAIL` (correo al asesor, solo servidor).

## Estructura

```
src/
  app/
    layout.tsx            # fuentes, metadata, CartProvider + Header global
    page.tsx              # "/" catálogo (server): lee stock y precio
    productos/[id]/       # "/productos/:id" detalle de producto
    carrito/              # "/carrito" wizard de 3 pasos (WhatsApp o correo)
    api/pedido/           # POST: valida, calcula el total y guarda el pedido
  components/             # Header, ProductCard, CatalogoConFiltro, CategoryFilter,
                          # ProductGallery, AddToCartButton, StockBadge,
                          # AvisoSinPrecio
  context/CartContext.tsx # estado del carrito (useCart)
  data/products.ts        # catálogo estático (25 productos, sin precios)
  lib/stock.ts            # stock y precio (getStock, getStockPorSkus)
  lib/supabase.ts         # cliente de servidor (import "server-only")
  lib/email.ts            # correo al asesor (Resend)
public/images/            # logos (brand/) e imágenes de productos
docs/                     # CHANGELOG, DECISIONS (ADRs), REQUIREMENTS-STOCK
.claude/agents/           # agentes de proyecto (versionados)
```

## Arquitectura

App Router de Next.js 15 + React 19 + Tailwind v4, alias `@/*` → `src/*`.

- **Catálogo estático:** `src/data/products.ts` es la única fuente de
  productos (25, tipo `Product`, `categories` derivado de ahí). Cada
  producto tiene `sku` = código del ERP (mapeo en
  `docs/MAPEO-PRODUCTOS-ERP.md`). **Los precios ya no viven acá:**
  `prices` quedó en `null` (campo vestigial) y el precio sale del ERP.
- **Stock y precio:** vienen de la tabla `stock_espejo` de Supabase, llenada
  a mano con `sync-stock.js` desde la red de la oficina (ver ADR-11). Solo se
  muestra el precio público con IVA incluido. Los datos pueden estar
  desactualizados entre corridas. Solo se accede vía `src/lib/stock.ts`
  (`getStock`, `getStockPorSkus` con una consulta para varios skus,
  `getPrecioProducto`), que usa `supabaseServidor` y por eso solo se importa
  desde server components o rutas de servidor; los componentes cliente
  reciben `StockInfo` por props (importando solo el tipo).
- **Reglas de interfaz (ADR-13):** sin precio = no se vende (sin sku:
  "Próximamente"; con sku sin precio: "No disponible por ahora", ambos vía
  `AvisoSinPrecio`). Agotado con precio = se puede agregar, con el aviso
  "Consulta la disponibilidad con tu asesor".
- **`/` (`src/app/page.tsx`)** — server component con `revalidate = 60`: pide
  stock y precio de todo el catálogo con `getStockPorSkus` y se los pasa a
  `CatalogoConFiltro` (client component), que filtra por categoría en el
  navegador.
- **`/productos/[id]`** — server component, prerenderizado con
  `generateStaticParams` + `revalidate = 60` (ISR). Llama a `getStock()`
  para un producto; sin precio no muestra precio ni botón de compra.
- **`POST /api/pedido`** — valida, calcula el total en el servidor con el
  precio del ERP (una consulta `getStockPorSkus`) y guarda en `pedidos` un
  snapshot `{ id, nombre, cantidad, precio, stock }`. Rechaza productos sin
  precio (400) y acepta agotados (ADR-12). Para canal "correo" reparte entre
  asesores (ADR-10) y envía con Resend.
- **Carrito:** `src/context/CartContext.tsx` (`CartProvider` envuelve toda la
  app en `layout.tsx`, se consume con `useCart()`). Estado solo en memoria:
  se pierde al recargar.
- **Checkout (`/carrito`):** wizard de 3 pasos (ADR-7). Guarda el pedido en
  `/api/pedido` y luego abre `https://wa.me/<teléfono>?text=...` (ver ADR-2) o
  deja que el asesor contacte por correo. El flag `sinStock` del carrito solo
  afecta el texto de WhatsApp; el snapshot y el correo usan el stock del
  servidor.
- `formatPrice` (locale `es-EC`, moneda USD) vive en un único archivo,
  `src/lib/formatPrice.ts`; se importa desde ahí. Si se cambia el formato,
  cambiarlo solo allí (también lo usa el correo al asesor, `src/lib/email.ts`).

## Trazabilidad

- [`docs/CHANGELOG.md`](./docs/CHANGELOG.md) — qué cambió y cuándo.
- [`docs/DECISIONS.md`](./docs/DECISIONS.md) — por qué se eligió cada
  enfoque (ADRs).
- [`docs/REQUIREMENTS-STOCK.md`](./docs/REQUIREMENTS-STOCK.md) — estado de
  la integración de stock real (hoy tabla espejo `stock_espejo`; pendiente
  automatizar el sync) con el encargado externo.

Después de un cambio no trivial (funcionalidad nueva, decisión de
arquitectura), usar el agente `trazabilidad` para dejar registro en esos
archivos. No hace falta para cambios triviales (typos, estilo).

## Agentes y skills del proyecto

Este repo tiene tres agentes versionados en `.claude/agents/` y un skill de
diseño versionado en `.claude/skills/`. Además hay dos skills globales
(`frontend-design`, `vercel-react-best-practices`) vendorizados de solo
lectura en `.agents/skills/` como referencia — no son específicos de este
proyecto, se usan igual que cualquier skill del sistema.

### Cuándo delegar a cada agente

- **`front-end`** — cualquier pedido que toque un componente visual, página
  o elemento de UI (tarjetas, botones, badges, headers, formularios,
  estados vacíos/error, copy de interfaz). Incluye pedidos que no mencionan
  estilo explícitamente ("agregá un botón de favoritos", "hacé una página
  de contacto"): igual hay que pasar por acá porque el sistema de diseño ya
  tiene reglas para eso. NO usar para lógica de negocio, arquitectura,
  stock o datos — solo la parte visual de esos cambios, si la hay.
  - Este agente carga `maya-home-design-system` y `frontend-design` juntos,
    con jerarquía fija: `maya-home-design-system` manda siempre que el
    proyecto ya tenga una decisión tomada (colores, tipografía, bordes,
    sombras); `frontend-design` solo llena los huecos que el sistema de
    diseño no cubre (composición, jerarquía visual, movimiento,
    copywriting, accesibilidad). Nunca al revés.
  - **Excepción:** si el contenido de `maya-home-design-system` ya está
    cargado en el contexto de la sesión actual (por ejemplo, porque se leyó
    recién para otra tarea), no hace falta delegar al agente `front-end` —
    aplicar las reglas directamente evita el costo redundante de que un
    subagente aislado vuelva a leer la misma skill desde cero. Esta
    excepción NO aplica a `frontend-design`: esa sí sigue cargándose solo a
    través del agente, ya que rara vez ya está en contexto sin haberla
    pedido explícitamente.
      
- **`stock-integration`** — cualquier trabajo relacionado con
  `src/lib/stock.ts` o con avanzar la integración de stock real (SQL
  Server / API externa) descrita en `docs/REQUIREMENTS-STOCK.md`. NO usar
  para otros cambios del catálogo o del carrito que no toquen el stock.
  Recordar ADR-1: el stock SIEMPRE se consulta vía `getStock()`, nunca
  directo desde componentes/páginas — si un pedido de UI necesita mostrar
  stock, la lectura sigue pasando por ahí y no amerita este agente salvo
  que se esté tocando la lógica de `getStock()` en sí.
- **`database`** — cualquier trabajo que toque Supabase (esquema, RLS,
  rutas de servidor que persisten datos, ej. `/api/pedido`). Carga la
  skill `supabase-postgres-best-practices` para buenas prácticas
  generales de Postgres, más sus propias reglas del proyecto (nunca
  confiar en precios del cliente, patrón guardar-antes-de-enviar, etc.)
  NO usar para construir el mensaje de WhatsApp ni para nada visual.
- **`trazabilidad`** — después de completar un cambio no trivial (funcionalidad
  nueva, decisión de arquitectura, cambio de rumbo), para dejar registro en
  `docs/CHANGELOG.md` y, si corresponde, `docs/DECISIONS.md` (y
  `docs/REQUIREMENTS-STOCK.md` si el cambio deja algo pendiente de esa
  integración). NO usar para cambios triviales (typos, formateo, ajustes de
  estilo menores). No se dispara solo — hay que invocarlo explícitamente
  al terminar el cambio real (los otros agentes no lo llaman por su cuenta).

### Cuándo usar cada skill directamente (sin pasar por un agente)

- **`maya-home-design-system`** — autoridad final de estilo visual en este
  proyecto. Se carga siempre que se toque JSX/Tailwind visual, ya sea a
  través del agente `front-end` o directamente si el cambio es chico y no
  amerita delegar.
- **`vercel-react-best-practices`** — aplica a cualquier trabajo de
  performance en componentes/páginas React o Next.js (data fetching,
  memoización, bundle, hidratación, etc.), independientemente de si el
  cambio es visual o no. No está atado a ningún agente de este proyecto;
  cargarlo cuando el pedido sea de optimización o al escribir/revisar
  código React/Next.js en general.
- **`frontend-design`** — solo para las partes de diseño visual que
  `maya-home-design-system` no cubre (ver arriba). Fuera del contexto de
  este proyecto no aplica.
- **`supabase-postgres-best-practices`** — está atada al agente
  `database`, no se usa suelta en este proyecto.

### Regla general

Para lógica de negocio o arquitectura que no sea visual, de stock ni de
persistencia en Supabase (ej. la construcción del mensaje de WhatsApp en
sí, validaciones como `src/lib/telefono.ts` / `src/lib/identificacion.ts`
que no escriben en la base), no hay agente dedicado: se trabaja directo
en el código siguiendo las convenciones de este archivo. Si algo toca
Supabase (guardar o leer un pedido, cambios de esquema, RLS), eso es del
agente `database` — ya no queda como catch-all sin agente. Si un pedido
cruza categorías (ej. una página nueva que además necesita lógica de
stock o persistencia), dividir el trabajo: la parte visual al agente
`front-end`, la parte de stock al agente `stock-integration`, la parte de
Supabase al agente `database` (o directo si es trivial), y `trazabilidad`
al final para dejar constancia.

## Convenciones ya establecidas

- El stock SIEMPRE se consulta a través de `getStock()` en
  `src/lib/stock.ts` — nunca directo desde componentes/páginas (ver ADR-1).
- Configuración sensible (teléfonos, URLs de API) va en variables de
  entorno, no hardcodeada — ver `NEXT_PUBLIC_ADVISOR_PHONE` como ejemplo.
- Comentarios y nombres del proyecto están en español; mantener ese idioma
  al escribir código nuevo en este repo.
- **Fechas y horas: formato latinoamericano, no estadounidense.** El
  proyecto es para Latinoamérica (ver `es-EC` en `formatPrice`), así que
  cualquier fecha u hora — en docs, UI, logs — usa:
  - Fecha: `DD/MM/YYYY` (ej. `22/09/2026`), nunca `MM/DD/YYYY`.
  - Hora: formato 24 horas, nunca AM/PM.
  - Si se formatea con `Intl`/`toLocaleDateString` en código, pasar
    explícitamente un locale latinoamericano (ej. `"es-EC"`) — nunca dejar
    el locale por defecto del entorno, porque puede resolver a `en-US` y
    mostrar `MM/DD/YYYY` según dónde corra el servidor/navegador.
  - Esto incluye los docs internos: `docs/CHANGELOG.md` y
    `docs/DECISIONS.md` usan `DD/MM/YYYY` (entradas más nuevas arriba).
  - La única excepción son los nombres de archivo, donde importa que
    ordenen bien alfabéticamente: ahí usar `YYYY-MM-DD` (ISO).
