# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Proyecto: e-commerce de cerámica (Next.js 15)

Sitio de catálogo ("Maya Home") con carrito y checkout vía WhatsApp (sin
pasarela de pago ni backend propio). Ver `docs/` para el contexto completo
antes de asumir nada sobre el estado del proyecto.

## Comandos

- `npm run dev` — servidor de desarrollo (Turbopack) en `http://localhost:3000`.
- `npm run build` — build de producción (Turbopack); úsalo para verificar
  tipos y que `generateStaticParams` genere todas las páginas de producto.
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

## Agentes de proyecto (`.claude/agents/`)

- `trazabilidad` — mantiene `docs/CHANGELOG.md` y `docs/DECISIONS.md` al
  día después de un cambio.
- `stock-integration` — avanza la conexión de stock real descrita en
  `docs/REQUIREMENTS-STOCK.md`, respetando el patrón adaptador de
  `src/lib/stock.ts`.

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
  - En archivos internos (`docs/CHANGELOG.md`, commits, nombres de
    archivo) donde importa que ordene bien alfabéticamente, usar
    `YYYY-MM-DD` (ISO) en vez de `DD/MM/YYYY` — pero eso es la excepción
    para orden, no para lo que ve el usuario final.
