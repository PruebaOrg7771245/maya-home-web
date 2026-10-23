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
- No hay framework de tests configurado. La lógica pura tiene scripts sueltos
  que corren con Node 22.18+ (ejecuta TypeScript directo):
  `node scripts/test-combos.ts`, `node scripts/test-busqueda.ts`,
  `node scripts/test-ficha.ts` y `node scripts/test-resumen.ts`.
- Al terminar una prueba con servidor (`npm run start` o `npm run dev`),
  cerrar el proceso que se levantó con
  `taskkill /PID <pid> /T /F`, usando el PID exacto del proceso que
  escucha en el puerto. Nunca cerrar por nombre (`pkill`,
  `taskkill /IM node.exe`): eso mata también los servidores del usuario y
  puede corromper `.next`. Al final, confirmar con `Get-NetTCPConnection`
  que el puerto quedó libre.

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
    layout.tsx            # fuentes, metadata, CartProvider + Header + Footer globales
    page.tsx              # "/" portada (hero) + catálogo resumido por categoría
    catalogo/             # "/catalogo" catálogo (server): lee stock y precio
    productos/[id]/       # "/productos/:id" detalle de producto
    combos/[familia]/     # "/combos/:familia" detalle de una familia de combos
    carrito/              # "/carrito" wizard de 3 pasos (WhatsApp o correo)
    api/pedido/           # POST: valida, calcula el total y guarda el pedido
  components/             # Header, Footer, CintaCategorias, BuscadorCabecera,
                          # Portada, CarruselPortada,
                          # CatalogoConFiltro, ProductCard, ComboCard,
                          # SelectorCombo, ProductGallery, AddToCartButton,
                          # StockBadge, AvisoSinPrecio, IconosSitio;
                          # useDesplegable.ts (hook) y estilosNav.ts (clases)
  context/CartContext.tsx # estado del carrito (useCart)
  data/products.ts        # catálogo estático (28 productos, sin precios; campos
                          # opcionales caracteristicas, detalles y altFoto)
  data/combos.ts          # familias de combos lavamanos + mueble (sin precios)
  data/sitio.ts           # datos del sitio: marca, contacto, redes (ver abajo)
  data/portada.ts         # imágenes de la portada (versión escritorio y móvil)
  lib/stock.ts            # stock y precio (getStock, getStockPorSkus)
  lib/catalogoUrl.ts      # urlCatalogo() y nombres de categoría "Todos"/"Combos"
  lib/categorias.ts       # orden de las opciones de la cinta de /catalogo
  lib/busqueda.ts         # lógica pura del buscador (sin React ni red)
  lib/fichaProducto.ts    # lógica pura de la ficha (especificaciones, fotos, bloques)
  lib/resumenCatalogo.ts  # lógica pura del catálogo resumido de "/" (ADR-31)
  lib/combos.ts           # lógica de combos (combinaciones, precio, stock)
  lib/supabase.ts         # cliente de servidor (import "server-only")
  lib/email.ts            # correo al asesor (Resend)
public/images/            # logos (brand/) e imágenes de productos
scripts/                  # pruebas de lógica pura (test-combos, test-busqueda,
                          # test-ficha, test-resumen)
docs/                     # CHANGELOG, DECISIONS (ADRs), REQUIREMENTS-STOCK
.claude/agents/           # agentes de proyecto (versionados)
```

## Arquitectura

App Router de Next.js 15 + React 19 + Tailwind v4, alias `@/*` → `src/*`.

- **Catálogo estático:** `src/data/products.ts` es la única fuente de
  productos (28, tipo `Product`, `categories` derivado de ahí). Cada
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
- **`/` (`src/app/page.tsx`)** — server component con `revalidate = 60`
  (ISR), de arriba abajo: (1) portada (`Portada`, imágenes en
  `data/portada.ts`, versión escritorio/móvil con `<picture>`; con 2 o más
  imágenes pasa a `CarruselPortada`, cliente); (2) catálogo resumido: una
  sección por categoría con hasta 4 productos vendibles, disponibles primero
  (`seccionesResumen` en `lib/resumenCatalogo.ts`, ADR-31), en
  `ProductCard compacta` y con enlace "Ver todos"; justo después de
  Lavamanos, una fila "Combos lavamanos" con hasta 4 familias vendibles,
  disponibles primero (`combosResumen`, misma `tarjetaFamilia` de
  `lib/combos.ts` que `/catalogo`, ADR-32) en `ComboCard compacta` (foto,
  nombre, "Desde $X" con IVA; sin código: la ficha del combo no muestra
  ninguno); sin ningún combo vendible la fila no sale; (3) un enlace
  de texto discreto "Ver catálogo completo" (`urlCatalogo()`). Ya no hay
  bloque inferior de marca; el único `h1` ("Maya Home") es `sr-only`. Stock y
  precio de productos y piezas de combos con UNA sola `getStockPorSkus`.
- **`/catalogo` (`src/app/catalogo/page.tsx`)** — server component con
  `revalidate = 60` (ISR): pide stock y precio de todo el catálogo y de las
  piezas de los combos con UNA sola `getStockPorSkus` y se los pasa a
  `CatalogoConFiltro` (client component), que filtra en el navegador.
  La categoría (`?categoria=`) y la búsqueda (`?q=`) viajan en la URL:
  elegir categoría es un enlace normal; escribir actualiza la URL con
  `history.replaceState` tras 250 ms. `useSearchParams` va dentro de
  `Suspense` para que la página siga estática: el HTML estático trae el
  catálogo completo y el filtro se aplica al hidratar. Orden: `h1`
  (`sr-only`) → cinta de categorías → buscador → resultados. "Todos" muestra
  los productos y, a continuación, los combos bajo su título (ADR-32); el
  contador de resultados los incluye. Una
  categoría concreta muestra solo esa; "Combos lavamanos", solo combos. La
  búsqueda filtra ambos igual que antes. La
  URL del catálogo se arma siempre con `urlCatalogo()` (`lib/catalogoUrl.ts`).
- **Buscador (`lib/busqueda.ts`):** filtra en el navegador sobre lo ya
  cargado, sin consultas nuevas; lo que escribe la persona no se guarda ni se
  envía a ningún sitio. Sin distinguir mayúsculas ni tildes, varias palabras
  = todas deben coincidir, el plural prueba el singular y hay un sinónimo
  (`lavabo` → `lavamanos`, ver `SINONIMOS`). Productos: nombre, categoría,
  descripción y sku; combos: nombre de la familia, nombre y etiqueta de cada
  pieza y la palabra "combo".
- **Cinta de categorías (`CintaCategorias`, ADR-33):** solo en `/catalogo`.
  Componente cliente GENÉRICO: recibe `elementos: { etiqueta, href, activo }[]`
  y no trae categorías fijas (está pensado para recibir más adelante grupos de
  categorías sin cambiarlo). `CatalogoConFiltro` arma los chips con
  `categoriasCatalogo()` ("Todos", categorías, "Combos lavamanos"; sin
  cantidades) y `urlCatalogo(nombre, q)`. Si los chips caben, es estática; si
  no, se desplaza sola a ~30 px/s en bucle (una copia `aria-hidden` con
  `tabindex=-1`), moviendo `scrollLeft` con `requestAnimationFrame` sobre
  scroll nativo. Se mueve a mano con dedo, rueda/trackpad, arrastre con mouse
  y flechas ‹ › (solo con desbordamiento y `pointer-fine`). Se pausa con
  hover, foco de teclado, toque/arrastre y pestaña oculta, y vuelve tras 3 s.
  Tiene botón de pausa (WCAG 2.2.2); con `prefers-reduced-motion` no se mueve
  sola. Al cargar centra el chip activo. `useDesplegable` (aria-expanded,
  Escape, clic fuera, flechas) queda solo para el buscador de la cabecera.
- **Datos del sitio (`src/data/sitio.ts`):** marca, empresa, contacto, redes y
  WhatsApp (se construye con `NEXT_PUBLIC_ADVISOR_PHONE`, sin número copiado).
  Regla: un campo `null` NO se muestra (sin enlaces muertos ni relleno);
  hoy `urlPrivacidad` es `null` porque la página no existe. Cabecera, pie y
  portada leen de ahí; no repetir esos datos en otros componentes.
- **Cabecera y pie:** `Header` (navegación con enlaces simples Inicio /
  Catálogo (`/catalogo` sin parámetros) / Combos lavamanos (su filtro); en
  `/catalogo` se marca solo uno de los dos; sin desplegable de categorías,
  ADR-33; lupa
  de búsqueda, carrito con contador; menú plegable accesible en móvil; la
  fila nunca se parte en dos líneas y el texto junto al logo sale solo desde
  `md`, recortándose antes que los iconos) y
  `Footer` (marca, categorías, contacto, redes solo con iconos SVG inline).
  Reglas globales en `globals.css`: foco visible con el acento (en
  `@layer base`) y `prefers-reduced-motion` respetado.
- **Combos:** `data/combos.ts` define las familias (lavamanos + mueble, solo
  se combinan dentro de la misma familia); `lib/combos.ts` calcula
  combinaciones, precio y stock; `/combos/[familia]` es ISR (`revalidate =
  60`) y su selector (`SelectorCombo`) es cliente.
- **`/productos/[id]`** — server component, prerenderizado con
  `generateStaticParams` + `revalidate = 60` (ISR). Llama a `getStock()`
  para un producto; sin precio no muestra precio ni botón de compra.
  Orden de la ficha: columna derecha = categoría, nombre, stock, descripción,
  precio y botón; debajo, a ancho completo y solo si hay contenido:
  Características, Especificaciones y Detalles del producto (imágenes
  `detalles` con enlace a la imagen completa). `ProductGallery` usa
  `object-contain`: nunca recorta una foto (ADR-20).
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

Este repo tiene cuatro agentes versionados en `.claude/agents/`
(`front-end`, `stock-integration`, `database`, `trazabilidad`) y una skill
propia, `maya-home-design-system`, en `.claude/skills/`. Además usa tres
skills externas (`frontend-design`, `vercel-react-best-practices`,
`supabase-postgres-best-practices`) instaladas en `.agents/skills/` y
enlazadas a `.claude/skills/` (ver "Skills externas" más abajo). No son
específicas del proyecto.

### Cuándo delegar a cada agente

- **`front-end`** — cualquier pedido que toque un componente visual, página
  o elemento de UI (tarjetas, botones, badges, headers, formularios,
  estados vacíos/error, copy de interfaz). Incluye pedidos que no mencionan
  estilo explícitamente ("agregá un botón de favoritos", "hacé una página
  de contacto"): igual hay que pasar por acá porque el sistema de diseño ya
  tiene reglas para eso. NO usar para lógica de negocio, arquitectura,
  stock o datos — solo la parte visual de esos cambios, si la hay.
  - Este agente carga `maya-home-design-system`, `frontend-design` y
    `vercel-react-best-practices` juntos. Jerarquía fija:
    `maya-home-design-system` manda siempre que el proyecto ya tenga una
    decisión tomada (colores, tipografía, bordes, sombras);
    `frontend-design` solo llena los huecos de diseño que el sistema no
    cubre; `vercel-react-best-practices` no decide el aspecto, solo cómo se
    construye (rendimiento). Nunca al revés.
  - **Excepción:** si el contenido de `maya-home-design-system` ya está
    cargado en el contexto de la sesión actual (por ejemplo, porque se leyó
    recién para otra tarea), no hace falta delegar al agente `front-end` —
    aplicar las reglas directamente evita el costo redundante de que un
    subagente aislado vuelva a leer la misma skill desde cero. Esta excepción NO aplica a `frontend-design` ni a `vercel-react-best-practices`: si se trabaja directo, sin delegar,
    cargar la de Vercel antes de escribir código React/Next.js;
    `frontend-design` solo se usa a través del agente, y solo para los
    huecos de diseño que `maya-home-design-system` no cubre.
      
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
- **`vercel-react-best-practices`** — se carga SIEMPRE que se escriba,
  revise o refactorice código React/Next.js: componentes, páginas, imágenes
  (`next/image`), carga de datos, componentes cliente vs. servidor, bundle.
  Ya viene incluida en el agente `front-end`; si el trabajo se hace directo,
  sin delegar, cargarla igual antes de escribir código. No hace falta en
  cambios solo de texto, estilos o docs.
- **`supabase-postgres-best-practices`** — se carga ANTES de escribir o
  cambiar cualquier cosa que viva en Postgres: tablas, columnas,
  migraciones, RLS, índices, funciones o consultas SQL, y al diagnosticar
  consultas lentas. Ya viene incluida en el agente `database`; si el cambio
  se hace directo por ser pequeño, cargarla igual: una sola columna o una
  sola consulta también cuenta.

### Skills externas (enlaces locales)

`frontend-design`, `vercel-react-best-practices` y
`supabase-postgres-best-practices` viven en `.agents/skills/` y se enlazan
a `.claude/skills/` con junction (no se versionan: están en `.gitignore`).
Los junction guardan la ruta completa, así que se rompen si el proyecto se
mueve o se clona en otro PC: recrearlos con
`New-Item -ItemType Junction -Path .claude\skills\<nombre> -Target "$PWD\.agents\skills\<nombre>"`.
Tras cualquier cambio, abrir una sesión nueva y comprobar con `/skills`
que las cuatro skills salen activas (✓).
Si `npm run build` falla con `TypeError ... reading 'length'` dentro de webpack, borrar `.next` (caché desactualizada tras crear o cambiar los enlaces) y repetir el build.

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
