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

## 23/10/2026 - Globo de WhatsApp visible: ya no se cierra con el scroll
- `BotonWhatsAppFlotante`: el globo "¿Necesitas asesoría?" sale a los 3 s de la primera página de la visita y se queda 8 s (antes 5 s reales); lo cierran tocarlo o pulsar el botón, ya no el scroll ni abrir un menú (cualquier scroll lo borraba al instante y ya quedaba marcado como visto). `sessionStorage["maya-globo-whatsapp"]` guarda la hora de inicio de la visita y luego `"cerrado"`, así el plazo sigue al cambiar de página o recargar. Se anuncia con `aria-live="polite"` (antes `aria-hidden`). El botón sigue en cada página (no se movió al layout, ADR-29).

## 23/10/2026 - Portada v2 sin pérdida de calidad en el logo
- Imágenes nuevas `portada-1-desktop-v2.webp` (1920×720) y `portada-1-movil-v2.webp` (800×1000), WebP near-lossless (249 y 131 KB); se borraron las anteriores. `Portada` pide `quality` 90 a next/image (antes 75 por defecto, que dejaba halos en el logo) y `next.config.ts` declara `images.qualities: [75, 90]`.

## 22/10/2026 - Cabecera en una sola fila en todo ancho
- `Header`: el texto "Accesorios y acabados para el hogar" sale solo desde `md`
  (antes desde 400 px, y en 412-430 px empujaba el carrito a una segunda
  línea); logo e iconos con `shrink-0` y, si falta espacio, se recorta el texto.
  Medido de 320 a 1440 px: siempre una fila de 81 px.

## 22/10/2026 - Inicio sin la portada temporal
- Se quitó el bloque que quedaba al final de `/` (título "Maya Home" visible,
  descripción de `sitio.ts` y botón "Ver catálogo"); la portada nueva ya cumple
  esa función (nota en ADR-31). En su lugar, un enlace de texto discreto "Ver
  catálogo completo" tras la última categoría. Se mantiene el `h1` oculto y el
  botón flotante de WhatsApp; `sitio.ts` no cambia.

## 22/10/2026 - Portada y catálogo resumido en el inicio; fotos de pérgolas y barredora
- Inicio: portada a ancho completo (una imagen, versiones escritorio/móvil,
  WebP de 49 y 32 KB) y debajo un resumen de hasta 4 productos vendibles por
  categoría con "Ver todos" (ADR-31); el bloque anterior (nombre, descripción
  y "Ver catálogo") queda al final. Fotos principales de `pergola-3x4`,
  `pergola-3x3` (359 px de origen, sin agrandar: se ve suave en la ficha) y
  `barredora-manual` (rellenada a 4:3 con blanco), con el campo nuevo
  opcional `altFoto`. Las demás fotos de la barredora quedan fuera del repo,
  en `C:\Dev\fotos-extras-pendientes\barredora\`.

## 21/10/2026 - 3 productos nuevos, sinónimos de barredora, logo completo y botón flotante de WhatsApp
- **Productos (25 -> 28):** `pergola-3x4` (sku `SHELTERTENT`), `pergola-3x3`
  (`YS1003`), categoría "Pérgolas"; y `barredora-manual` (`YZ-S1`), categoría
  "Limpieza" (ERP: RECOLECTOR DE BASURA MANUAL). Sin foto (`images: []`, sale el
  placeholder), sin `variants`; textos tal cual del JSON de fichas y precio y
  stock por sku desde `stock_espejo`. Las categorías nuevas se derivan del orden
  de `products.ts`: menú "Todos, ..., Saunas, Pérgolas, Limpieza, Combos". No se
  cargaron color ni marca (Yangzi) ni marcas de "nuevo"/"tendencia" (fase 4).
  Verificado: los 3 códigos (`SHELTERTENT`, `YS1003`, `YZ-S1`) los comprobó
  Mateo en el ERP el 21/10/2026; los tres existen con precio y existencia. El
  nombre del ERP de la pérgola 3x4 dice YS1006, pero el código correcto es
  `SHELTERTENT`. Por confirmar: en la barredora, si los 98 cm son ancho de la
  máquina o de barrido (peso, materiales y capacidad no constan).
- **Buscador:** grupo nuevo `["barredora", "recolector de basura", "recolector"]`
  (ADR-28). "recolector" suelto porque los términos de varias palabras solo
  coinciden completos. `test-ficha.ts` (28 productos, los 3 nuevos contra el
  JSON, placeholder) y `test-busqueda.ts` (pergola/pérgola/pergolas,
  barredora/recolector) ampliados.
- **Logo:** cabecera y pie usan el logo completo `logo-maya-home.webp` (256 px,
  12 KB, recortado de `logo-full.png`; originales intactos; alt "Maya Home") en
  vez de ícono + texto. Se conserva el eslogan de la cabecera (oculto bajo 400
  px). Correos y favicon sin cambios; `logo-icon.png` quedó sin uso.
- **Botón flotante de WhatsApp (ADR-29):** `BotonWhatsApp.tsx` (servidor) y
  `BotonWhatsAppFlotante.tsx` (cliente). En inicio, catálogo, ficha y combo; no
  en el carrito. Usa `sitio.redes.whatsapp` (sin variable nueva); en ficha y
  combo el mensaje añade " Me interesa: <nombre>.". Se oculta al bajar y
  reaparece al subir o a los 600 ms quieto; globo "¿Necesitas asesoría?" una vez
  por visita.
- **Corrección de apilamiento (ADR-30):** el menú plegable de la cabecera en
  móvil quedaba debajo del botón; la cabecera pasa a `relative z-20`.
- **Limitación conocida:** en una ficha con precio, si "Agregar al pedido" queda
  justo en el borde inferior de la pantalla en móvil, el botón flotante cubre su
  extremo derecho.
- Verificación: lint, `tsc --noEmit`, build y los 3 scripts pasan; revisión
  visual con Chrome headless.

## 20/10/2026 - Fichas completas de los 25 productos, nombres, fotos principales y fotos de los saunas
- **Fichas (ADR-21 y 22):** los 25 productos tienen descripción, características
  y especificaciones, tomadas de una hoja de Excel (vía JSON, fuera del repo) y
  emparejadas por `sku`. La tabla de especificaciones se arma en
  `filasEspecificaciones()` (`lib/fichaProducto.ts`): "Medidas" primero (de
  `variants`), luego las especificaciones y al final el resto de `variants`,
  sin filas repetidas. La ficha ya no tiene el bloque "Formatos disponibles".
- **Nombres (ADR-23):** cambiaron solo 5: los dos sanitarios SD-1001 (blanco y
  negro mate), la barra de seguridad KW-7501GUNGREY y los dos saunas. El resto
  conserva su nombre.
- **Galería (ADR-24):** primera versión sin galería de varias fotos, salvo los
  dos saunas. Las fotos extra de los demás productos quedan fuera del repo, en
  `C:\Dev\fotos-extras-pendientes`, para añadirlas después.
- **Fotos principales (ADR-25):** mejoradas y unificadas: 4:3, máximo 1600 px
  de ancho y menos de 1 MB; las PNG con transparencia se aplanan sobre blanco.
- **Saunas:** fotos nuevas para los dos (4 por sauna en `public/images/products/`:
  `sauna-120x100x200` y `sauna-135x110x210`, con sufijos `-2` a `-4`).
- **Pendientes antes de publicar (no son cambios hechos):** datos por confirmar
  del Excel (ADR-26) y política de privacidad, consentimiento y aviso legal
  (ADR-27).

## 20/10/2026 - Foto de combo, "Volver al catálogo" con filtro y más sinónimos en el buscador
- **Foto del combo CONNON SX800 blanco:** `public/images/combos/connon-sx800-blanco.jpg`
  (original 1536x1024 extendida a 4:3 con fondo blanco, 1536x1152, ~94 KB).
  Entrada nueva en `FOTOS_COMBINACION` (`src/data/combos.ts`) para
  `connon-sx800__LAVCONNONSX800BL__MUEBLCONNOSX-800SMOK`; deja de ser imagen
  referencial. `scripts/test-combos.ts`: fotos propias 6 -> 7, referenciales 3 -> 2.
- **Fix "Volver al catálogo":** el enlace de las fichas iba fijo a `/catalogo`
  (producto) o `?categoria=Combos` (combo) y perdía filtro y búsqueda. Nuevos
  `VolverAlCatalogo.tsx` y `lib/origenCatalogo.ts` (origen en memoria del
  módulo, sin `sessionStorage`): si se llegó desde el catálogo hace
  `router.back()` (mismo filtro, búsqueda y scroll, sin ensuciar el historial);
  si no, va al catálogo filtrado por la categoría del producto (o Combos).
  `CatalogoConFiltro` anota el origen con `onClickCapture`. Sin cambios
  visuales; el catálogo sigue estático con ISR. Prueba nueva en `test-busqueda.ts`.
- **Sinónimos del buscador (`lib/busqueda.ts`):** `GRUPOS_SINONIMOS` simétricos
  en un solo sitio: inodoro=taza=wc=sanitario; lavamanos=lavabo=lavatorio;
  secador de manos=secamanos; dispensador de jabón=jabonera (el menos exacto).
  Admite términos de varias palabras (seguidas). Reemplaza el sinónimo único
  `lavabo` -> `lavamanos`. Orden de resultados, aspecto y `?q=` sin cambios.
  inodoro/taza/wc -> 5 sanitarios (antes 0); lavatorio -> 4 productos + 5
  combos; secamanos/jabonera -> 5. `test-busqueda.ts` ampliado (20 pruebas).
  Ver ADR-28.

## 13/10/2026 - Fase 3b: rediseño de la ficha de producto (modelo: sanitario 168W)
- **Galería:** `ProductGallery` pasa de `object-cover` a `object-contain` (foto
  principal y miniaturas): ya no se recorta ninguna foto. Fondo piedra, marco
  4:3 y teclado/táctil sin cambios.
- **Datos:** `Product` gana `caracteristicas?: string[]` y `detalles?:
  ProductDetalle[]` (`{ src, alt, width, height }`). Solo el 168W los usa: la
  galería queda con la foto principal y el collage (`-2`) y la infografía
  (`-3`) pasan a `detalles`. Archivos renombrados a `sanitario-168w-2.jpeg` y
  `-3.jpeg`. Ver ADR-20.
- **Ficha (`/productos/[id]`), orden nuevo para todos:** categoría, nombre,
  stock, descripción (sin título visible), precio y botón. Debajo, a ancho
  completo y solo si hay contenido: Características (2 columnas desde `md`),
  Especificaciones y Detalles del producto (imágenes en su proporción real,
  cada una enlaza a la imagen completa en pestaña nueva).
- **Lógica:** `src/lib/fichaProducto.ts` (`caracteristicasProducto`,
  `detallesProducto`, descartan lo vacío o inválido); `scripts/test-ficha.ts`
  con 4 pruebas nuevas (11 en total).
- Verificado: lint, `tsc --noEmit`, build y los 3 scripts. **No** se revisó en
  navegador a 320/375/1280 px.
- **Pendiente:** confirmar la unidad de la "conexión de 1/2" del 168W (hay un
  TODO en el código; no se publicó); revisión visual a 320/375/1280 px.

## 12/10/2026 - Fase 2: menú de categorías y buscador del catálogo
- **Menú en vez de pestañas:** `CategoryFilter.tsx` se eliminó. Ahora hay un
  menú desplegable de categorías con la cantidad por categoría: botón
  "Catálogo" en la cabecera (en móvil, dentro del menú plegable) y control
  "Categoría" en `/catalogo`. Piezas nuevas: `MenuCategorias.tsx`,
  `useDesplegable.ts` (Escape, clic fuera, `focusin` en vez de `blur` por
  Safari, flechas/Inicio/Fin), `estilosNav.ts` y `src/lib/categorias.ts`
  (se calcula en `layout.tsx` y llega a `Header` por props, para no meter los
  productos en el bundle de todas las páginas). Ver ADR-19.
- **Búsqueda:** `src/lib/busqueda.ts` (lógica pura): sin distinguir
  mayúsculas ni tildes, varias palabras = todas deben coincidir, el plural
  prueba el singular, sinónimo `lavabo` -> `lavamanos`. En productos busca por
  nombre, categoría, descripción y sku; en combos por familia, nombre y
  etiqueta de cada pieza y la palabra "combo". En "Todos" con búsqueda activa,
  los combos que coinciden salen bajo el título "Combos"; sin búsqueda, "Todos"
  sigue mostrando solo productos. Hay contador de resultados, "Limpiar
  filtros" y estado vacío con "Ver todo el catálogo". Lupa en la cabecera
  (panel con campo en escritorio, campo en el menú plegable en móvil) que lleva
  a `/catalogo?q=`.
- **URL y privacidad:** categoría (`?categoria=`) y búsqueda (`?q=`) viajan en
  la URL; el filtrado es solo en el navegador, sin consultas nuevas ni guardar
  lo escrito. La página sigue estática con ISR. Ver ADR-18.
- **Diseño (`maya-home-design-system`):** panel de menú blanco con borde de 1px
  y sin sombra; control de ancho fijo; botón de búsqueda negro con hover
  acento; "Limpiar filtros" subrayado en acento; el chevron gira solo con
  `motion-safe`.
- **Pruebas:** `node scripts/test-busqueda.ts` (15 pruebas, verificadas OK al
  registrar esto). Revisión manual en Chrome a 320/375/768/1280 px (sin scroll
  horizontal), teclado y reduced-motion (reportado por quien hizo el cambio).
- **Pendientes:** el sinónimo `lavabo` -> `lavamanos` es decisión por confirmar
  con el cliente (y si hacen falta más sinónimos); el cambio está sin commit.

## 12/10/2026 - Fase 1: estructura del sitio (catálogo en /catalogo, cabecera, pie, datos del sitio)
- **Rutas:** el catálogo se movió de `/` a `/catalogo` (mismo `revalidate = 60`
  y una sola consulta de stock). `/` es ahora una portada **temporal** (título,
  descripción y botón al catálogo), a reemplazar en la fase 4. Se actualizaron
  los enlaces internos (carrito, ficha de producto) y la ficha de combo vuelve
  a `/catalogo?categoria=Combos`. Ver ADR-17.
- **Datos del sitio:** `src/data/sitio.ts` concentra nombre, empresa,
  descripción, ubicación, envíos, teléfono, correo, redes y `urlPrivacidad`; el
  enlace de WhatsApp se arma con `NEXT_PUBLIC_ADVISOR_PHONE`. Regla: un campo
  `null` no se muestra (sin enlaces muertos). `urlPrivacidad` está en `null`
  porque la página no existe.
- **Cabecera y pie:** cabecera con navegación y menú plegable móvil accesible
  (`aria-expanded`, `aria-controls`); nuevo `Footer.tsx` en columnas con redes
  solo como iconos SVG inline (`IconosSitio.tsx`) y franja legal "© año
  Comercial Maya".
- **Global:** en `globals.css`, foco visible con el acento (en `@layer base`,
  para que las utilidades de Tailwind lo puedan sobreescribir) y
  `prefers-reduced-motion`. `src/lib/catalogoUrl.ts` con las constantes y
  `urlCatalogo()`.
- **Pendientes:** página de privacidad (hasta entonces `urlPrivacidad` queda en
  `null` y el enlace no aparece); portada definitiva en la fase 4. Esta fase ya
  está en el commit `2968d7b`; el registro se hizo después.

## 08/10/2026 - Etapa 2: combos lavamanos + mueble (9 combinaciones en 5 familias)
- **Datos y lógica:** `src/data/combos.ts` (5 familias: LUX-600, FLUTE-800,
  CONNON SX800, LUX-800, LUMINA-1600 = 9 combinaciones; cada pieza con sku del
  ERP, `nombre` y `etiqueta` corta para el selector; textos solo del
  catálogo/ERP) y `src/lib/combos.ts` (lógica pura: generar combinaciones,
  id compuesto `<familia>__<skuLav>__<skuMueble>`, `calcularCombo`,
  `precioDesde`, `fotoCombinacion`). Ver ADR-14 y ADR-15.
- **Stock y precio del combo:** precio = suma de los públicos con IVA,
  redondeada una vez al final; stock = mínimo de las dos piezas; sin pieza o
  precio 0 = no vendible; agotado = se puede agregar (ADR-12/13). Una sola
  llamada a `getStockPorSkus` por página (esa función no cambió).
- **`POST /api/pedido`:** acepta items con id de producto o de combo; el
  precio del combo siempre se recalcula en el servidor (id inválido o pieza de
  otra familia = 400; sin precio = 400 con el nombre). El snapshot en
  `pedidos.productos` suma `piezas: [{ sku, nombre }, { sku, nombre }]` (jsonb,
  sin cambio de esquema SQL). El correo y el mensaje de WhatsApp muestran las
  dos piezas bajo el combo.
- **Interfaz (agente `front-end`):** pestaña "Combos" en el catálogo (5
  tarjetas por familia con "Desde $X" y "Consulta nuestros descuentos por
  llevarte el combo"), página `/combos/[familia]` con selectores de lavamanos y
  mueble que cambian precio, stock y foto; el carrito muestra el combo con sus
  dos piezas. "Todos" sigue mostrando solo productos. Decisiones visuales
  nuevas pendientes de revisión: `<select>` nativo con borde `#D8D4CC`, texto
  fijo sobre `#EFEDE7` cuando hay una sola pieza, botón deshabilitado en
  neutros sin `opacity`, aviso "Esta combinación no está disponible para la
  venta" en caja neutra, "Desde (IVA incluido)" apilado, pestaña Combos sin
  acento.
- **Fotos:** 6 fotos extraídas del PDF mayorista (págs. impresas 07 y 08),
  recortadas a 800x600 en `public/images/combos/`; mapa único
  `FOTOS_COMBINACION`. Tres combinaciones sin foto propia (CONNON blanco,
  LUX-800 BL+SUNTH, LUX-800 BLACK+HONEY) usan la de la familia con la leyenda
  "Imagen referencial: el color puede variar".
- **Refactors:** `src/lib/umbralStock.ts` (`UMBRAL_POCO_STOCK = 5` y
  `clasificarExistencia`, compartido por `stock.ts` y `combos.ts`) y
  `src/lib/formatPrice.ts` (única función de formato; reemplazó las copias en
  `ProductCard`, `productos/[id]`, `carrito`, `ComboCard`, `SelectorCombo` y
  `email.ts`). Ver ADR-16. `tsconfig.json`: `allowImportingTsExtensions` para
  que Node ejecute el test con imports `.ts`.
- **Test:** `node scripts/test-combos.ts` (Node 24 corre TypeScript directo):
  exige exactamente 9 combinaciones, ids ida y vuelta, casos de pieza
  ausente / precio 0 / agotado / id manipulado, umbral, formato `$479,10` y
  fotos. Test, lint, tsc y build OK. POST reales probados (combo válido 201,
  precio manipulado ignorado, cruzado 400, pieza sin precio 400, agotado 201);
  pedidos de prueba borrados y `stock_espejo` restaurado.
- **Pendientes:** fotos de baja resolución (origen ~360 px de ancho; pedir
  originales); canal "correo" con combos no probado de punta a punta (habría
  enviado un correo real); sin pruebas visuales reales a 320 px en
  dispositivo (solo simuladas en iframe); los precios en vivo pueden diferir
  hasta 1 centavo de la tabla de `MAPEO-PRODUCTOS-ERP.md` (ej. CONNON $544,45
  vs $544,44, por el redondeo único); el stock de combos que comparten pieza
  no se descuenta entre sí (simplificación aceptada).

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
