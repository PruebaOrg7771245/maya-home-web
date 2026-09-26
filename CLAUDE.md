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

Variables de entorno en `.env.local` (no versionado):
`NEXT_PUBLIC_ADVISOR_PHONE` (número de WhatsApp con código de país, destino
de los pedidos) y `NEXT_PUBLIC_ADVISOR_EMAIL` (sin uso actual).

## Estructura

```
src/
  app/
    layout.tsx            # fuentes, metadata, CartProvider + Header global
    page.tsx              # "/" catálogo con filtro por categoría
    productos/[id]/       # "/productos/:id" detalle de producto
    carrito/              # "/carrito" resumen y envío por WhatsApp
  components/             # Header, ProductCard, CategoryFilter, ProductGallery,
                          # AddToCartButton, StockBadge
  context/CartContext.tsx # estado del carrito (useCart)
  data/products.ts        # catálogo estático
  lib/stock.ts            # adaptador de stock (getStock)
public/images/            # logos (brand/) e imágenes de productos
docs/                     # CHANGELOG, DECISIONS (ADRs), REQUIREMENTS-STOCK
.claude/agents/           # agentes de proyecto (versionados)
```

## Arquitectura

App Router de Next.js 15 + React 19 + Tailwind v4, alias `@/*` → `src/*`.

- **Catálogo estático:** `src/data/products.ts` es la única fuente de
  productos (tipo `Product`, `categories` derivado de ahí). Precios y
  nombres comerciales siguen pendientes del cliente: `prices.minorista` /
  `prices.mayorista` pueden ser `null` y la UI debe mostrar "Consultar
  precio" / "precio a confirmar" en ese caso.
- **`/` (`src/app/page.tsx`)** — client component; filtra por categoría en
  el navegador.
- **`/productos/[id]`** — server component, prerenderizado con
  `generateStaticParams` + `revalidate = 60` (ISR, pensado para cuando el
  stock sea real). Es el único lugar que llama a `getStock()`.
- **Carrito:** `src/context/CartContext.tsx` (`CartProvider` envuelve toda la
  app en `layout.tsx`, se consume con `useCart()`). Estado solo en memoria:
  se pierde al recargar.
- **Checkout (`/carrito`):** arma un mensaje de texto con el pedido y abre
  `https://wa.me/<teléfono>?text=...` (ver ADR-2).
- `formatPrice` (locale `es-EC`, moneda USD) está duplicado en
  `ProductCard.tsx`, `productos/[id]/page.tsx` y `carrito/page.tsx`; si se
  cambia el formato, cambiarlo en los tres.

## Trazabilidad

- [`docs/CHANGELOG.md`](./docs/CHANGELOG.md) — qué cambió y cuándo.
- [`docs/DECISIONS.md`](./docs/DECISIONS.md) — por qué se eligió cada
  enfoque (ADRs).
- [`docs/REQUIREMENTS-STOCK.md`](./docs/REQUIREMENTS-STOCK.md) — estado de
  la integración pendiente de stock real (SQL Server) con el encargado
  externo.

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

### Regla general

Para lógica de negocio, arquitectura o datos que no sea ni visual ni de
stock (ej. el carrito, el checkout por WhatsApp, validaciones como
`src/lib/telefono.ts` / `src/lib/identificacion.ts`), no hay agente
dedicado: se trabaja directo en el código siguiendo las convenciones de
este archivo. Si un pedido cruza categorías (ej. una página nueva que
además necesita lógica de stock), dividir el trabajo: la parte visual al
agente `front-end`, la parte de stock al agente `stock-integration` (o
directo si es trivial), y `trazabilidad` al final para dejar constancia.

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
