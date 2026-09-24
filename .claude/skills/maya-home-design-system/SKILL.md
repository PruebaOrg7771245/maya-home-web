---
name: maya-home-design-system
description: Sistema de diseño visual de Maya Home (paleta de colores exacta, reglas de bordes/sombras, tipografía Archivo/Inter). Usar SIEMPRE al crear o modificar cualquier componente visual, página o elemento de UI en este proyecto — tarjetas, botones, badges, headers, formularios, estados vacíos, etc. — incluso si el pedido no menciona colores o estilos explícitamente (ej. "agregá un botón de favoritos", "hacé una página de contacto", "el badge de agotado se ve raro"). No usar para lógica de negocio, arquitectura, stock o datos — eso lo cubren CLAUDE.md y los agentes stock-integration/trazabilidad.
---

# Sistema de diseño visual — Maya Home

Esta skill documenta el lenguaje visual que ya está en uso en el proyecto,
derivado directamente de `globals.css`, `layout.tsx`, `Header.tsx`,
`ProductCard.tsx` y `StockBadge.tsx`. El objetivo es que cualquier
componente o página nueva se vea como si la hubiera hecho la misma persona
que hizo el resto — no es un sistema aspiracional, es el que ya existe.

Si vas a tocar HTML/JSX con clases de Tailwind o estilos inline en este
proyecto, aplicá lo de acá antes de inventar un color, un radio de borde o
una sombra nuevos.

## Paleta de colores

| Hex | Uso | Dónde se ve hoy |
|---|---|---|
| `#EFEDE7` | Fondo general del sitio ("piedra clara") | `body`, placeholder de imagen en `ProductCard`, hover sutil en botones (`hover:bg-[#EFEDE7]`), bg del badge de stock "unknown" |
| `#232320` | Texto principal (casi negro cálido) | Nombres de producto, títulos, íconos SVG |
| `#D8D4CC` | Bordes neutros | `border-b` del header, `border` de tarjetas, líneas divisorias |
| `#6B6862` | Texto secundario/discreto | Tagline, categoría/subcategoría, labels ("Minorista"/"Mayorista"), texto del badge "unknown" |
| `#A8562E` | **Acento** (terracota/cobre) — el único color de marca del proyecto | Hover de borde en tarjetas, badge de cantidad del carrito |
| `#FFFFFF` | Fondo de superficies elevadas | Header, tarjetas de producto (contrastan contra el fondo piedra) |

**Colores de estado de stock** (`StockBadge.tsx` — sistema aparte, semántico, no de marca):

| Estado | Fondo | Texto |
|---|---|---|
| En stock | `#E8F0E3` | `#3F6B2C` |
| Pocas unidades | `#F5EAD9` | `#8A5A1F` |
| Agotado | `#F5E3E0` | `#A8362E` |
| Consultar disponibilidad | `#EFEDE7` | `#6B6862` |

⚠️ `#A8362E` (rojo de "agotado") y `#A8562E` (acento de marca) difieren en
un solo dígito — no los confundas al copiar/pegar.

### Cuándo usar el acento vs. los neutros

El acento (`#A8562E`) se usa **con moderación**, solo para:
- Estados de hover que indican que algo es interactivo/clickeable (ej.
  borde de una tarjeta).
- Elementos que necesitan llamar la atención activamente (ej. contador
  con ítems en el carrito).

Nunca como fondo de botones grandes ni como color de texto de párrafos —
ahí van los neutros. Los neutros (`#D8D4CC`, `#6B6862`, `#EFEDE7`,
`#232320`) dominan la interfaz; el acento aparece puntualmente, no de
fondo. Si un componente nuevo te tienta a usar el acento en más de un
lugar, probablemente conviene resolverlo con un neutro y guardar el
acento para el punto que realmente importa destacar.

Los colores de stock son semánticos (disponibilidad), no decorativos: no
los uses para otra cosa que no sea comunicar estado de inventario.

## Reglas de estilo visual

- **Bordes rectos de 1px**, siempre en `#D8D4CC` (`border`, `border-b`).
  Nada de bordes gruesos.
- **Sin `border-radius` grande.** El único redondeo permitido es
  `rounded-full`, y solo en elementos circulares puntuales (botón de
  ícono, badge numérico). Tarjetas, botones, badges de stock: esquinas
  rectas, sin `rounded-md`/`rounded-lg`/etc.
- **Sin sombras difusas** (nada de `shadow-*` de Tailwind). La jerarquía
  visual se construye con borde + color de fondo, no con `box-shadow`.
- El feedback de interacción es cambio de color: borde
  (`hover:border-[#A8562E]`) o fondo (`hover:bg-[#EFEDE7]`), con
  `transition-colors`. Para imágenes, un zoom leve con
  `transition-transform duration-300 group-hover:scale-105` es aceptable
  (ver `ProductCard`).

Si estás por escribir `shadow-`, `rounded-lg`, `rounded-xl` o un color
que no esté en la tabla de arriba, es una señal de que te estás saliendo
del sistema — pará y usá lo que ya existe, salvo que el usuario pida
explícitamente romper el patrón.

## Tipografía

- **Títulos/headings:** Archivo, vía `font-[var(--font-heading)]`, pesos
  600/700 (semi-bold/bold). Se usa en nombres de marca, `h1`-`h3` de
  producto.
- **Cuerpo:** Inter, vía `var(--font-body)` (ya aplicada globalmente en
  `<body>` desde `layout.tsx` — no hace falta repetirla en cada
  componente).
- **Texto secundario/labels:** `text-xs` o `text-sm`, color `#6B6862`.

No importes otras fuentes ni definas pesos fuera de 400/500 (cuerpo) y
600/700 (headings) sin que el usuario lo pida explícitamente.

## Al construir un componente nuevo

1. Fondo de superficie elevada (tarjeta, header, modal): blanco, sobre el
   fondo piedra (`#EFEDE7`) del body.
2. Borde: `#D8D4CC`, 1px, esquinas rectas.
3. Texto principal en `#232320` con Archivo si es un heading, Inter si es
   cuerpo; texto secundario en `#6B6862`.
4. ¿Necesita destacar como interactivo o llamar la atención? Usá
   `#A8562E`, solo ahí.
5. ¿Comunica disponibilidad de stock? Usá la tabla de estados de stock,
   nunca el acento de marca.
6. Nada de sombras ni radios grandes salvo que sea un elemento circular.
