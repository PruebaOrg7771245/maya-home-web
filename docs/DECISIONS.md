# Decisiones de arquitectura

Registro de decisiones no obvias a partir del código: qué se decidió, qué
alternativas había y por qué se eligió este camino. No repite lo que ya se
lee en el código — solo el razonamiento detrás.

Formato:

```
## ADR-N: Título
- Contexto: qué problema había.
- Decisión: qué se eligió.
- Alternativas descartadas: qué otras opciones había y por qué no.
- Estado: vigente / superada (con fecha en formato DD/MM/YYYY si cambia).
```

Regla: en "Alternativas descartadas" solo se anotan opciones que el cliente o
el desarrollador evaluaron de verdad. No se inventan para llenar la sección;
si no hubo alternativas, se escribe que ninguna se evaluó y por qué.

---

## ADR-1: Stock detrás de un adaptador (`src/lib/stock.ts`)
- **Contexto:** el stock real vive en una base de datos SQL Server externa,
  cuya integración depende de un tercero (encargado externo) y todavía no
  está lista.
- **Decisión:** aislar todo el acceso al stock detrás de una única función
  `getStock(sku)`, ya declarada `async`, que hoy devuelve un placeholder
  (`status: "unknown"`). Ningún componente ni página consulta el stock
  directamente.
- **Por qué:** cuando la integración con SQL Server esté lista, solo se
  reemplaza el contenido de esa función — no hay que tocar páginas ni
  componentes que ya consumen `getStock()`.
- **Estado:** parcialmente reemplazado (07/10/2026). Sigue vigente la regla
  de fondo (todo el acceso a stock y precio pasa por `src/lib/stock.ts`,
  nunca directo desde componentes/páginas). Lo que dice sobre SQL Server
  como fuente y sobre el placeholder `unknown` quedó superado por el
  [ADR-11](#adr-11-stock-y-precio-desde-una-tabla-espejo-en-supabase-stock_espejo):
  la fuente es la tabla `stock_espejo` de Supabase. Se deja el texto original
  como historia.

## ADR-2: Checkout vía WhatsApp en vez de pasarela de pago
- **Contexto:** el negocio no procesa pagos en línea; el asesor coordina
  pago y envío manualmente con cada cliente.
- **Decisión:** el carrito arma un mensaje de texto con el resumen del
  pedido y abre `wa.me` con ese mensaje pre-llenado, en vez de integrar
  Stripe/MercadoPago u otra pasarela.
- **Alternativas descartadas:**
  - Pasarela de pago real — descartada por ahora porque no hay backend de
    pedidos ni necesidad inmediata de cobrar online.
  - Correo pre-llenado con `mailto:` a `NEXT_PUBLIC_ADVISOR_EMAIL` — fue la
    primera versión del checkout; se reemplazó por WhatsApp el 22/09/2026
    (commit cb6344c). El motivo puntual no quedó registrado; `mailto:`
    además depende de que el comprador tenga un cliente de correo
    configurado. `NEXT_PUBLIC_ADVISOR_EMAIL` quedó sin uso.
- **Estado:** vigente. Si en el futuro se agrega pago en línea, este ADR
  queda superado y hay que documentar el reemplazo acá.
- **Nota (01/10/2026):** WhatsApp dejó de ser el único canal de envío real
  del checkout — desde esta fecha `/carrito` también ofrece "que un asesor
  me contacte" por correo (ver ADR-7 y ADR-8). No cambia la decisión de
  fondo de este ADR (sin pasarela de pago, el asesor coordina pago y envío
  a mano): ambos canales terminan en que el asesor contacta manualmente al
  cliente, solo cambia el medio por el que se entera del pedido.

## ADR-3: Sin backend propio (todavía)
- **Contexto:** el catálogo vive en `src/data/products.ts` (datos
  estáticos en el repo), no en una base de datos propia del sitio.
- **Decisión:** por ahora el sitio es mayormente estático; los únicos
  puntos que van a requerir datos externos en vivo son el stock (ADR-1) y,
  eventualmente, pedidos/pagos.
- **Estado:** vigente.

## ADR-4: Build de producción con Webpack, dev con Turbopack
- **Contexto:** `next build --turbopack` falla en el build de Vercel por un
  bug conocido de Turbopack con `next/font/google` (fuentes del
  `layout.tsx`).
- **Decisión:** el script `build` usa `next build` (Webpack); `dev` sigue
  con `next dev --turbopack`, donde el bug no aparece.
- **Alternativas descartadas:** mantener Turbopack en el build y cambiar la
  carga de fuentes (p. ej. `next/font/local` con los archivos en el repo) —
  implica tocar tipografía y assets para esquivar un bug del bundler.
- **Consecuencia:** dev y producción usan bundlers distintos; ante un error
  que solo aparece en uno, probar `npm run build` localmente.
- **Estado:** vigente (23/09/2026). Revisar al actualizar Next.js: si el bug
  se corrige, se puede volver a `--turbopack` en `build`.

## ADR-5: Validación local de RUC/Cédula por dígito verificador
- **Contexto:** el formulario de `/carrito` pide RUC/Cédula y solo se
  validaba como "no vacío"; hacía falta rechazar números mal tipeados.
- **Decisión:** validar localmente en `src/lib/identificacion.ts` con los
  algoritmos de dígito verificador (módulo 10 para cédula y RUC persona
  natural, módulo 11 para sociedad privada y entidad pública), detectando
  el tipo por largo y tercer dígito. Parte de un ejemplo provisto por el
  usuario (`validarIdentificacion.ts`), extendido para devolver tipo y
  mensaje.
- **Alternativas descartadas:** consultar la API del SRI para confirmar que
  el número existe y está activo — agrega una dependencia externa (y
  necesitaría backend o proxy, ver ADR-3) para un formulario que el asesor
  igual revisa a mano por WhatsApp.
- **Consecuencia:** solo se garantiza que la estructura es matemáticamente
  válida; un número bien formado pero inexistente o inactivo pasa. También
  se decidió rechazar Consumidor Final (`9999999999999`) y no validar el
  código de provincia.
- **Extensión (teléfono):** el mismo criterio de validación local, sin API,
  se aplica al teléfono en `src/lib/telefono.ts`. Se aceptan números
  internacionales (no solo Ecuador) porque el sitio podría escalar a otros
  países; para códigos distintos de 593 solo se valida el largo E.164, sin
  reglas por país.
- **Estado:** vigente (24/09/2026).

## ADR-7: Checkout de `/carrito` como wizard de 3 pasos
- **Contexto:** el checkout era un formulario único (lista de productos +
  datos del cliente + botón de envío) en la misma pantalla, y se necesitaba
  espacio para agregar una segunda vía de contacto (asesor por correo) sin
  saturar más la pantalla.
- **Decisión:** dividir el flujo en 3 pasos con estado local (`step`) dentro
  del mismo componente de `/carrito`: pedido → datos del cliente → método
  de envío (WhatsApp o "que un asesor me contacte", esta última
  deshabilitada por ahora). No se creó una máquina de estados ni rutas
  separadas por paso.
- **Alternativas descartadas:**
  - Rutas separadas (`/carrito/datos`, `/carrito/enviar`) — se descartó
    porque el carrito vive en memoria (`CartContext`, sin persistencia) y
    cambiar de ruta no aporta nada que el estado local no resuelva.
  - Mantener el formulario único y solo agregar el botón de correo al
    final — se descartó porque mezclaba dos decisiones distintas (revisar
    pedido, completar datos, elegir canal) en una sola pantalla larga.
- **Consecuencia:** la opción de contacto por correo queda visible pero
  deshabilitada ("Próximamente") hasta la Fase 3 del proyecto, cuando el
  dominio propio esté listo para recibir esos pedidos.
- **Estado:** vigente (28/09/2026). **Nota (01/10/2026):** la opción de
  correo ya se activó (ver ADR-8 y CHANGELOG del 01/10/2026); la estructura
  de 3 pasos en sí no cambió.

## ADR-6: Ciudad con `<datalist>` nativo en vez de combobox custom
- **Contexto:** el input de Ciudad en `/carrito` era texto libre; se pidió
  poder filtrar entre las localidades de Ecuador mientras se escribe y
  también ver la lista completa sin escribir nada, sin perder que el campo
  siga siendo opcional y de texto libre (no forzar a elegir una opción de
  la lista).
- **Decisión:** usar `<input list="ciudades-ecuador">` + `<datalist>` del
  HTML nativo, con las opciones cargadas desde `src/data/ciudadesEcuador.ts`
  (~138 localidades). El filtro por coincidencia parcial y el desplegable
  completo son comportamiento nativo del navegador.
- **Alternativas descartadas:** combobox custom en React (con estado propio
  de apertura/filtrado/selección) — se descartó por simplicidad: `datalist`
  cumple los dos requisitos sin código adicional propenso a bugs de foco o
  manejo de teclado.
- **Consecuencia:** el estilo del desplegable lo controla el navegador, no
  el CSS del proyecto (menos consistente visualmente que un combobox
  custom, pero aceptable para un campo opcional).
- **Estado:** vigente (25/09/2026).

## ADR-8: Supabase con RLS para persistir pedidos
- **Contexto:** hasta ahora el checkout (ADR-2) solo armaba un mensaje de
  WhatsApp/correo sin guardar el pedido en ningún lado — no había forma de
  auditar pedidos ni de retomar un envío de correo fallido. Hacía falta
  persistencia real sin salir del modelo "sin backend propio" (ADR-3) de
  mantener el sitio simple.
- **Decisión:** usar Supabase (Postgres gestionado) para la tabla
  `pedidos`, con RLS activo y sin ninguna política pública — el único
  acceso es desde `POST /api/pedido` (ruta de servidor) usando
  `supabaseServidor`, un cliente con la llave `service_role` que nunca se
  importa desde el navegador. El precio/total se recalcula siempre en el
  servidor desde `src/data/products.ts`, nunca se confía en lo que manda
  el cliente. Para el canal "correo", el pedido se guarda primero con
  `estado_correo: "pendiente"` y recién después se intenta el envío real
  (Resend, fase futura) — nunca al revés.
- **Alternativas descartadas:**
  - Seguir sin persistencia (solo `wa.me`/`mailto:` como hasta ahora) —
    descartada porque no permite recuperar un pedido si el envío de correo
    falla, ni tener registro de qué se pidió.
  - RLS con políticas públicas de insert desde el navegador (cliente
    público de Supabase) — descartada porque expondría la tabla a
    inserts/lecturas arbitrarias sin pasar por la validación de servidor
    (precio recalculado, formato de RUC/teléfono); se verificó en vivo que
    la llave pública no puede ni leer ni escribir (`42501` al intentar
    insert).
  - Migraciones automatizadas / CLI de Supabase conectada al repo —
    descartada por ahora: los cambios de esquema se aplican a mano en el
    SQL Editor de Supabase (ver reglas del agente `database`); la tabla
    `pedidos` ya estaba provisionada así antes de esta integración.
- **Consecuencia:** cualquier trabajo futuro sobre esta tabla (o tablas
  nuevas que guarden datos de Maya Home) pasa por el agente `database`, que
  aplica RLS sin políticas públicas por defecto. El envío real de correo
  (Resend) para pedidos con canal "correo" queda pendiente — el estado
  `"pendiente"` es el punto donde se retoma.
- **Estado:** vigente (29/09/2026). **Nota (01/10/2026):** el envío real
  con Resend ya está implementado (`src/lib/email.ts`, llamado desde
  `POST /api/pedido`), que actualiza `estado_correo` a `"enviado"` o
  `"fallido"` según el resultado — ver CHANGELOG del 01/10/2026.
  **Nota (07/10/2026):** el precio/total ya no se recalcula desde
  `src/data/products.ts` sino desde el precio del ERP (`stock_espejo`); ver
  ADR-12.

## ADR-9: Anti-bot/anti-abuso en `POST /api/pedido` sin servicios externos
- **Contexto:** `POST /api/pedido` (ADR-8) no tenía ninguna protección
  contra envíos automatizados ni contra el caso más común de abuso
  involuntario, el doble clic en "Enviar pedido" que crea dos filas para el
  mismo pedido.
- **Decisión:** tres capas livianas, todas dentro de la misma ruta de
  servidor, antes del insert: honeypot (campo oculto `sitioWeb` que un bot
  que autocompleta formularios sí llena), límite de 5 pedidos por IP cada
  10 minutos, y deduplicación por RUC/cédula + teléfono en una ventana de
  60 segundos. Las verificaciones de IP y deduplicación son *fail-open*: si
  la consulta a Supabase falla, no bloquean el pedido, solo lo registran en
  el log — se prioriza no perder una venta real por un error de la
  verificación en sí misma.
- **Alternativas descartadas:**
  - CAPTCHA (reCAPTCHA/hCaptcha) — agrega una dependencia de terceros,
    fricción visible para el cliente y un script externo, para un
    formulario de checkout de un solo paso de envío; se descartó por
    desproporcionado frente al volumen y riesgo actuales del sitio.
  - Rate limiting a nivel de edge/middleware (ej. Vercel Edge Config o un
    KV externo) — se descartó porque agrega infraestructura nueva
    (almacenamiento de contadores fuera de Postgres) cuando Supabase ya
    tiene el dato necesario (`creado_en`, `ip`) para resolverlo con una
    consulta simple; se puede migrar a edge más adelante si el volumen de
    tráfico lo justifica.
- **Consecuencia:** columna nueva `ip inet` (nullable) en `pedidos`, con
  índice parcial `pedidos_ip_creado_en_idx` (`where ip is not null`) y
  `pedidos_dedup_idx` sobre `(ruc_cedula, telefono, creado_en)`, ambos
  creados con `concurrently` para no bloquear escrituras. El honeypot
  depende de que el campo oculto en `/carrito` nunca se le ponga
  `display:none` (algunos bots lo detectan y lo saltean) — se oculta
  sacándolo del viewport en su lugar.
- **Estado:** vigente (30/09/2026).

## ADR-10: Reparto de correos entre asesores por conteo mensual (no por timestamp)
- **Contexto:** desde ADR-8, todos los pedidos con canal "correo" iban a un
  único `ADVISOR_EMAIL` fijo. Con varios asesores reales operando, hacía
  falta repartir la carga entre ellos sin tocar código cada vez que se
  agrega, quita o pausa un asesor.
- **Decisión:** tabla `asesores` en Supabase (`id`, `nombre`, `email`,
  `activo`), columna `pedidos.asesor_id` (uuid, FK nullable) y una función
  SQL `obtener_asesor_disponible()` (`language sql stable`) que cuenta los
  pedidos de canal "correo" que recibió cada asesor activo en lo que va del
  mes y devuelve el que tenga menos. `POST /api/pedido` la llama por RPC
  antes del insert cuando el canal es "correo"; el asesor elegido recibe el
  correo (vía `enviarCorreoAsesor()`, que ahora toma el destinatario como
  parámetro en vez de leerlo fijo de `ADVISOR_EMAIL`) y su `id` queda
  guardado en `asesor_id`. El canal "whatsapp" no pasa por esta lógica:
  sigue yendo siempre al coordinador fijo, `asesor_id` queda `null`.
- **Alternativas descartadas:**
  - Round-robin clásico por timestamp (columna `ultimo_asignado_en`, elegir
    el asesor con el timestamp más antiguo, `for update skip locked` para
    concurrencia) — descartada en favor del conteo mensual: no necesita
    columna ni índice extra, ni lock explícito porque es una sola consulta
    de agregación, y además sirve de base para calcular comisiones
    mensuales por asesor más adelante (por eso se guarda `asesor_id` en
    cada pedido).
  - Lógica de asignación en el código de la app (round-robin en memoria o
    variable global) — descartada porque no sobrevive a reinicios/despliegues
    ni a múltiples instancias serverless corriendo en paralelo; la función en
    Postgres es la única fuente de verdad consistente entre requests
    concurrentes.
  - `security definer` en la función — no se usó porque quien llama
    (`supabaseServidor`, `service_role`) ya bypassea RLS por sí mismo, no
    hace falta elevar privilegios.
- **Consecuencia:** si todos los asesores de la tabla quedan `activo = false`
  (no debería pasar en operación normal), `obtener_asesor_disponible()` no
  devuelve filas y `POST /api/pedido` cae a `ADVISOR_EMAIL` como respaldo de
  emergencia (con `console.warn`); si tampoco hay `ADVISOR_EMAIL`
  configurado, el pedido queda `estado_correo: "fallido"` sin intentar el
  envío. Esta tabla y columna, igual que `pedidos`, se aplicaron a mano en
  el SQL Editor de Supabase (ver ADR-8), no vía migraciones.
- **Estado:** vigente (01/10/2026).

## ADR-11: Stock y precio desde una tabla espejo en Supabase (`stock_espejo`)
- **Contexto:** el stock y el precio reales viven en el ERP (SQL Server de la
  oficina). ADR-1 asumía que la web lo leería de ahí. Pero el SQL Server solo
  es accesible desde la red de la oficina (IP privada), no desde Vercel.
- **Decisión:** la web lee de la tabla `stock_espejo` de Supabase
  (`codigo_producto`, `producto`, `existencia`, `precio_publico`,
  `actualizado_en`), que se llena **a mano** corriendo `sync-stock.js` desde la
  red de la oficina. `src/lib/stock.ts` sigue siendo el único punto de acceso
  (`getStock`, `getStockPorSkus`, `getPrecioProducto`) y usa
  `supabaseServidor`. El `sku` de cada producto de `products.ts` es el
  `codigo_producto` del ERP. Solo se muestra el precio **público con IVA
  incluido** (`precio_publico`); los precios mayoristas no se usan. Estados:
  sin sku -> `coming_soon`; sin fila o error -> `unknown`; existencia <= 0 ->
  `out_of_stock`; 1 a 5 -> `low_stock`; > 5 -> `in_stock`.
- **Alternativas descartadas:**
  - Leer el SQL Server directo desde Vercel — descartada: el servidor tiene IP
    privada y darle una IP fija accesible desde Vercel cuesta $120/mes.
  - Endpoint/API intermedio en la oficina (Opción A de
    `REQUIREMENTS-STOCK.md`) — descartada por ahora por el mismo problema de
    exponer la red de la oficina y por depender del encargado externo.
- **Consecuencia:** el dato puede estar desactualizado entre corridas de
  `sync-stock.js` (no hay sincronización automática); la web revalida cada
  60 s lo que haya en la tabla, pero eso no acerca el dato al ERP.
  Automatizar el sync queda pendiente (`REQUIREMENTS-STOCK.md`).
- **Estado:** vigente (07/10/2026). Reemplaza parcialmente a ADR-1.

## ADR-12: `/api/pedido` calcula el total con el precio del ERP y guarda un snapshot
- **Contexto:** con ADR-8 el servidor recalculaba precios desde
  `products.ts`, pero esos precios ahora son `null` (ver ADR-11): el precio
  real vive en `stock_espejo`.
- **Decisión:** `POST /api/pedido` valida id y cantidad de cada item, consulta
  el precio y el stock de todos los productos con **una sola** llamada a
  `getStockPorSkus`, y arma el snapshot guardado en `pedidos.productos`:
  `{ id, nombre, cantidad, precio, stock }` (precio unitario con IVA y estado
  de stock al momento del pedido). El total se calcula en el servidor
  (redondeado a centavos). Si algún producto no tiene precio (sin sku, sin
  fila, precio 0 o error de lectura) se rechaza todo el pedido con `400`; un
  producto agotado con precio **se acepta** (queda marcado en el snapshot y en
  el correo como "(sin stock)").
- **Alternativas descartadas:**
  - Confiar en el precio que manda el navegador — descartada, igual que en
    ADR-8.
  - Rechazar pedidos con productos agotados — descartada: la regla de negocio
    es que el asesor confirma la disponibilidad con el cliente (ver ADR-13).
  - Una consulta por producto (`getPrecioProducto` en un bucle) — descartada
    por N viajes a Supabase; `getPrecioProducto` queda disponible pero no lo
    usa la ruta.
- **Consecuencia:** el navegador solo manda `id` y `cantidad`; el flag
  `sinStock` del carrito no viaja al servidor (solo afecta el mensaje de
  WhatsApp). El snapshot guarda el precio vigente en ese momento, así que
  cambios posteriores en el ERP no alteran pedidos viejos.
- **Estado:** vigente (07/10/2026).

## ADR-13: Reglas de interfaz para productos sin precio y agotados
- **Contexto:** con precio y stock reales, hay productos sin sku (aún no están
  en el ERP), con sku pero sin fila/precio (error de datos) y agotados. Hacía
  falta una regla única y coherente en tarjeta, detalle, carrito, WhatsApp y
  correo.
- **Decisión:**
  - **Sin precio = no se vende:** no se muestra precio ni botón de compra.
    Sin sku -> badge "Próximamente"; con sku pero sin precio -> badge neutro
    "No disponible por ahora" (componente `AvisoSinPrecio`, compartido por
    tarjeta y detalle).
  - **Agotado = se puede agregar** al pedido, con el aviso "Consulta la
    disponibilidad con tu asesor". WhatsApp y correo lo marcan con
    "(sin stock)".
  - Diseño: "No disponible por ahora" usa los neutros de "Próximamente" (no
    es un estado de stock, así que no lleva los colores semánticos); todos
    los badges llevan borde de 1px (los neutros con `#D8D4CC`, para que no se
    pierdan sobre el fondo piedra del detalle); en la tarjeta la etiqueta
    "Precio (IVA incluido)" va apilada sobre el precio porque no cabe en una
    línea en el grid de 2 columnas del móvil; `CategoryFilter` desplaza la
    pestaña activa a la vista (8 pestañas no caben en un celular).
- **Alternativas descartadas:** bloquear la compra de agotados (el negocio
  prefiere que el asesor consulte) y mostrar "Consultar precio" en productos
  sin precio (sugiere que se puede comprar con el asesor; el dato faltante es
  un error o producto aún no cargado).
- **Consecuencia:** el flag `sinStock` del `CartItem` solo afecta el texto del
  mensaje de WhatsApp (quien arma ese mensaje es el navegador); el snapshot y
  el correo toman el estado de stock del servidor (ADR-12). `StockBadge` ya no
  muestra "(0 disponibles)" en Agotado. Los correos y `/carrito` rotulan "IVA
  incluido".
- **Estado:** vigente (07/10/2026).

## ADR-14: Combos como combinaciones derivadas, con id compuesto validado en el servidor
- **Contexto:** el ERP no tiene combos ni precio de combo. El negocio quiere
  vender lavamanos + mueble por familia (9 combinaciones válidas en 5
  familias), sin mezclar familias (LUX-600 nunca con LUX-800), salvo LUX-800,
  que admite sus 4 cruces a propósito.
- **Decisión:** las familias y sus piezas (con sku del ERP) viven en
  `src/data/combos.ts`; las combinaciones se **generan** (`generarCombinaciones`)
  y no se listan a mano. Cada una se identifica con el id
  `<familia>__<skuLavamanos>__<skuMueble>`. `POST /api/pedido` acepta items con
  id de producto o de combo (`pareceIdCombo` -> `parsearIdCombinacion`, que
  devuelve `null` si el id es inválido o la pieza es de otra familia; eso es
  `400`). El navegador solo manda id y cantidad; el servidor recalcula todo. El
  snapshot de `pedidos.productos` agrega `piezas: [{ sku, nombre }, ...]` en el
  mismo jsonb (sin cambio de esquema SQL, sin tabla nueva de combos).
- **Alternativas descartadas:**
  - Cargar los combos como productos en `products.ts` o como filas en el ERP —
    descartada: el ERP no los tiene y duplicaría precio y stock de las piezas.
  - Una tabla `combos` en Supabase — descartada: más esquema para algo que se
    deriva de datos estáticos y del espejo.
  - Aceptar del cliente el precio o las piezas — descartada, igual que ADR-8 y
    ADR-12.
- **Consecuencia:** agregar una familia o pieza es editar `combos.ts` y el test
  (`scripts/test-combos.ts` exige exactamente 9 combinaciones). Pedidos viejos
  no cambian porque el snapshot guarda nombre y precio de ese momento.
- **Estado:** vigente (08/10/2026).

## ADR-15: Precio y stock del combo (suma redondeada una vez, mínimo, una consulta)
- **Contexto:** hay que definir cómo se calcula el precio y el stock de algo
  que el ERP no conoce, y qué pasa si falta una pieza.
- **Decisión:** precio = suma de los precios públicos **con IVA** de las dos
  piezas, redondeada **una sola vez** al final. Stock = **mínimo** de las
  existencias de las dos piezas, clasificado con el mismo umbral que los
  productos. Si falta una pieza (sin fila) o su precio es 0, el combo es
  `no_vendible` (botón deshabilitado, "Esta combinación no está disponible para
  la venta"); si está agotado con precio, **se puede agregar** con el aviso
  (ADR-12/13). `calcularCombo` recibe el mapa de stock ya consultado, así que
  cada página hace **una sola** llamada a `getStockPorSkus`, sin cambiar su
  forma.
- **Alternativas descartadas:**
  - Redondear cada pieza por separado o partir del precio sin IVA x 1,15 —
    descartada: se prefirió sumar lo que el cliente ve en cada pieza.
  - Descontar stock entre combos que comparten una pieza — descartada por
    ahora (simplificación aceptada): el stock de cada combo es independiente.
  - Precio de combo con descuento — descartada: los descuentos los maneja el
    asesor; la tarjeta solo dice "Consulta nuestros descuentos por llevarte el
    combo".
- **Consecuencia:** el precio en vivo puede diferir hasta 1 centavo de la tabla
  de `MAPEO-PRODUCTOS-ERP.md` (CONNON: $544,45 vs $544,44). Esa tabla es
  referencia; manda el cálculo del código.
- **Estado:** vigente (08/10/2026).

## ADR-16: Un solo `formatPrice` y un solo umbral de stock (`src/lib/`)
- **Contexto:** `formatPrice` estaba copiado en tres archivos (y una copia
  idéntica en el correo), y con los combos el umbral de "pocas unidades" se
  iba a necesitar en `stock.ts` y en `combos.ts`.
- **Decisión:** `src/lib/formatPrice.ts` es la única función de formato
  (`es-EC`, USD) y reemplazó todas las copias (`ProductCard`, `productos/[id]`,
  `carrito`, `ComboCard`, `SelectorCombo`, `email.ts`). `src/lib/umbralStock.ts`
  exporta `UMBRAL_POCO_STOCK = 5` y `clasificarExistencia`, sin dependencias
  (no importa Supabase), así que lo pueden usar tanto servidor como lógica
  pura testeable con Node.
- **Alternativas descartadas:** mantener las copias (ya eran 6 con los
  combos) y poner el umbral dentro de `stock.ts` (arrastra `server-only` y
  Supabase al test).
- **Consecuencia:** cambiar el formato de precio o el umbral es tocar un solo
  archivo. La nota de `CLAUDE.md` sobre `formatPrice` duplicado ya no aplica.
- **Estado:** vigente (08/10/2026).

## ADR-17: Catálogo en `/catalogo`, portada temporal en `/` y datos del sitio en `sitio.ts`
- **Contexto:** el sitio solo tenía el catálogo en `/`, y se necesita una
  portada propia, cabecera/pie con datos de contacto y redes, y un lugar único
  donde cambiar esos datos.
- **Decisión:** el catálogo pasó a `/catalogo` (server component, mismo
  `revalidate = 60`, una sola consulta `getStockPorSkus` para productos y
  combos). `/` es una portada temporal (título, descripción, botón al catálogo)
  que se reemplaza en la fase 4. Todos los datos del sitio (nombre, empresa,
  contacto, redes, `urlPrivacidad`) viven en `src/data/sitio.ts` y los leen
  Header, Footer y portada. **Regla: un campo `null` no se muestra** (ni enlace
  muerto, ni `#`, ni relleno); activarlo es poner el valor real. El WhatsApp de
  `sitio.ts` se construye con `NEXT_PUBLIC_ADVISOR_PHONE`, la misma variable que
  usa el carrito, así que el número se cambia en un solo lugar. Las URLs del
  catálogo salen de `urlCatalogo()` (`src/lib/catalogoUrl.ts`), no se escriben
  a mano.
- **Alternativas descartadas:** repetir los datos en cada componente (se
  desincronizan) y poner enlaces `#` donde falte un dato (enlaces muertos).
- **Consecuencia:** `urlPrivacidad` está en `null` porque la página no existe;
  el enlace del pie aparece solo cuando se cree. Cualquier enlace viejo a `/`
  como catálogo ahora lleva a la portada.
- **Estado:** vigente (12/10/2026). Portada provisoria hasta la fase 4.

## ADR-18: Categoría y búsqueda en la URL, filtrado solo en el navegador
- **Contexto:** al agregar un buscador al catálogo había que decidir dónde vive
  el estado, si se consulta al servidor y qué pasa con lo que escribe la
  persona, sin perder el catálogo estático con ISR.
- **Decisión:** la categoría (`?categoria=`) y el texto (`?q=`) viajan en la
  URL, así se pueden compartir y el botón "atrás" las recupera. El filtrado
  (`src/lib/busqueda.ts`, lógica pura) corre en el navegador sobre los
  productos y combos que ya llegaron: sin consultas nuevas y **sin guardar ni
  enviar lo que busca el usuario**. Elegir categoría es un enlace normal (queda
  en el historial); al escribir, la URL se actualiza con
  `history.replaceState` tras 250 ms de espera, para no llenar el historial con
  cada tecla. `useSearchParams` va dentro de `Suspense`: el HTML estático trae
  el catálogo completo y el filtro se aplica al hidratar. Una categoría
  desconocida cae en "Todos". La consulta se limita a 80 caracteres.
- **Consecuencia:** hasta hidratar se ve "Todos" completo y luego se aplica el
  filtro. Si el catálogo crece mucho, filtrar en el cliente deja de convenir.
- **Pendientes:**
  - Confirmar con el cliente el sinónimo `lavabo` -> `lavamanos`.
  - Confirmar el comportamiento de los combos dentro de "Todos" cuando hay
    búsqueda activa (hoy aparecen bajo un título "Combos"; sin búsqueda,
    "Todos" muestra solo productos).
- **Nota (23/10/2026):** reemplazado por ADR-32 en lo que toca a los combos en
  "Todos": ahora salen siempre, tras los productos, con o sin búsqueda.
- **Estado:** vigente (12/10/2026).

## ADR-19: Menú desplegable de categorías accesible y compartido (`useDesplegable`) en vez de pestañas
- **Contexto:** las pestañas (`CategoryFilter`) se reemplazaron porque el
  cliente pidió las categorías en un menú desplegable con buscador (ADR-13 ya
  había tenido que desplazar la pestaña activa en móvil), y la cabecera
  también necesitaba entrar al catálogo por categoría.
- **Decisión:** un menú desplegable con la cantidad por categoría
  (`MenuCategorias.tsx`), usado como botón "Catálogo" en la cabecera (en móvil
  dentro del menú plegable) y como control "Categoría" en `/catalogo`. El
  comportamiento (botón con `aria-expanded`, Escape, clic fuera, `focusin`
  en vez de `blur` porque Safari no da foco a los enlaces al hacer clic, flechas
  arriba/abajo/Inicio/Fin) está en el hook `useDesplegable`, que también usa la
  lupa de la cabecera. Las categorías con cantidades se calculan en
  `layout.tsx` (servidor, `src/lib/categorias.ts`) y llegan a `Header` por
  props, para no meter el catálogo de productos en el bundle de todas las
  páginas. Estilo según `maya-home-design-system`: panel blanco con borde de
  1px y sin sombra, control de ancho fijo, chevron que gira solo con
  `motion-safe`.
- **Alternativas:** ninguna evaluada; el menú desplegable fue petición
  explícita del cliente (reemplaza las pestañas).
- **Consecuencia:** una sola implementación de teclado y cierre para los tres
  paneles; un cambio de comportamiento se hace en `useDesplegable`. Se eliminó
  `CategoryFilter.tsx`; el comentario de ADR-13 sobre el auto-scroll de la
  pestaña activa ya no aplica.
- **Estado:** vigente (12/10/2026).

## ADR-20: Ficha de producto con bloques opcionales y fotos completas (`object-contain`)
- **Contexto:** las fotos del 168W (collage de vistas 1536x1024 e infografía
  1227x1282) eran ilegibles como miniaturas de la galería, y `object-cover`
  las recortaba (~11% de ancho el collage, ~28% de alto la infografía, con
  texto cortado).
- **Decisión:** la galería usa `object-contain` (nunca se recorta una foto).
  Las imágenes informativas van en un campo opcional `detalles` (`{ src, alt,
  width, height }`) y se muestran bajo la ficha, una tras otra, en su
  proporción real, cada una como enlace a la imagen completa en pestaña nueva.
  Junto a `caracteristicas?` son opcionales: si faltan o son inválidos
  (`lib/fichaProducto.ts`), el bloque no se muestra. Orden de la ficha: la
  descripción va antes del precio. `width` y `height` son una desviación
  deliberada del pedido original `{ src, alt }`: reservan el espacio y evitan
  saltos de diseño al cargar.
- **Alternativas descartadas:**
  - Mantener `object-cover`: recortaba y cortaba texto.
  - Detalles como miniaturas dentro de la galería: ilegibles.
  - Lightbox/zoom: pospuesto, las fotos del catálogo son de baja resolución.
  - Solo `{ src, alt }`: la página saltaría al cargar.
- **Consecuencia:** otros productos adoptan los bloques con solo añadir los
  campos. Con `object-contain` puede quedar fondo piedra visible alrededor de
  fotos que no son 4:3. Sin zoom, el detalle depende de abrir la imagen
  completa.
- **Estado:** vigente (13/10/2026). Pendiente revisión visual a 320/375/1280 px.

## ADR-21: Las fichas salen de una hoja de Excel (vía JSON), emparejadas por sku
- **Contexto:** los 25 productos necesitaban descripción, características y
  especificaciones.
- **Decisión:** esos tres datos salen de una hoja de Excel que pasó por un
  JSON y se emparejan por `sku` (código del ERP). Los textos se copian tal
  cual, con su unidad (ej. "2,4 kW", "1350 x 1100 x 2100 mm"); si el JSON y la
  web difieren en la descripción, gana el JSON. El campo "verificado" del
  Excel NO se guarda en la web: la lista de datos pendientes de confirmar vive
  en el Excel (ver ADR-26). El JSON queda fuera del repo.
- **Alternativas descartadas:** ninguna se evaluó.
- **Estado:** vigente (20/10/2026).

## ADR-22: Tabla de especificaciones derivada de variants; sin "Formatos disponibles" en la ficha
- **Contexto:** la ficha tiene que mostrar las medidas, las especificaciones
  del Excel y los datos que ya estaban en `variants`, sin repetir filas.
- **Decisión:** `filasEspecificaciones()` (`lib/fichaProducto.ts`) arma la
  tabla en este orden: "Medidas" primero, tomada de `variants`; luego las
  `especificaciones`; al final el resto de `variants`. Si dos filas tienen la
  misma etiqueta (sin importar mayúsculas ni tildes), gana la primera. Por eso
  las `variants` de medidas mandan sobre la fila "Medidas" del JSON. En los dos
  saunas el valor de `variants` "medidas" se cambió por el texto del JSON con
  unidad ("1200 x 1000 x 2000 mm (ancho x fondo x alto)" y "1350 x 1100 x 2100
  mm"). En los otros productos las medidas de `variants` no se tocaron (el JSON
  las trae en cm en 4 lavamanos; mismos números). La ficha ya no tiene un
  bloque "Formatos disponibles": esa información va en la tabla.
- **Alternativas descartadas:** ninguna se evaluó.
- **Consecuencia:** la fila "Medidas" del JSON queda oculta cuando el producto
  tiene `variants` de medidas. El comentario de `ProductCard` aún habla de
  "formatos": la tarjeta del catálogo sigue mostrando los valores de `variants`
  (no se decidió nada sobre ella).
- **Estado:** vigente (20/10/2026).

## ADR-23: Solo cambian 5 nombres; los demás conservan el actual
- **Contexto:** el JSON trae un nombre para cada producto y difiere del de la
  web en varios.
- **Decisión:** solo cambiaron 5 nombres: SD-1001 ("Sanitario SD-1001 con bidet
  · blanco"), SD-1001MB ("Sanitario SD-1001 con bidet · negro mate"),
  KW-7501GUNGREY ("Barra de seguridad · acero antimanchas") y los dos saunas
  ("Sauna · 120 × 100 × 200 cm" y "Sauna infrarrojo de espectro completo · 135
  × 110 × 210 cm"). El resto conserva su nombre actual, que en sanitarios y
  lavamanos incluye el código del modelo. Los nombres del JSON que no se
  aplicaron quedan sin cambios (ej. "Inodoro inteligente · blanco" para el
  168W).
- **Alternativas descartadas:** ninguna se evaluó.
- **Estado:** vigente (20/10/2026).

## ADR-24: Primera versión pública sin galería de varias fotos (salvo los dos saunas)
- **Contexto:** hay fotos extra de varios productos.
- **Decisión:** la primera versión pública no lleva galería de varias fotos,
  salvo los dos saunas (que ya la tienen). Las fotos extra de los demás
  productos quedan fuera del repo, en `C:\Dev\fotos-extras-pendientes`, para
  añadirlas después.
- **Alternativas descartadas:** ninguna se evaluó.
- **Estado:** vigente (20/10/2026). Pendiente añadir esas fotos.

## ADR-25: Formato de las fotos principales
- **Decisión:** las fotos principales son 4:3, de máximo 1600 px de ancho y
  menos de 1 MB cada una. Las PNG con transparencia se aplanan sobre blanco.
- **Alternativas descartadas:** ninguna se evaluó.
- **Estado:** vigente (20/10/2026).

## ADR-26: Datos pendientes de confirmar antes de publicar
- **Contexto:** algunas especificaciones del Excel están marcadas como no
  verificadas. Se muestran igual (la web no distingue, ver ADR-21).
- **Pendientes:** voltaje del sauna de 135 (hoy se muestran las dos opciones);
  medidas del 168W; vidrio del sauna de 120; material "antivandálico" de 6
  productos (los dispensadores de acero, 4, y los secadores mediano y grande
  de acero).
- **Alternativas descartadas:** ninguna se evaluó.
- **Estado:** pendiente de confirmar, antes de publicar (20/10/2026).

## ADR-27: Pendientes legales antes de publicar
- **Contexto:** la web funciona como catálogo con pedido por asesor y recoge
  datos personales en el formulario del carrito.
- **Pendientes:** política de privacidad (hoy `urlPrivacidad` es `null` en
  `sitio.ts`), consentimiento en el formulario y un aviso legal corto.
- **Alternativas descartadas:** ninguna se evaluó.
- **Estado:** pendiente, antes de publicar (20/10/2026).

## ADR-28: Sinónimos del buscador como grupos simétricos en un solo sitio
- **Contexto:** el catálogo usa "sanitario" pero la gente busca "inodoro",
  "taza" o "wc" (0 resultados); lo mismo con lavatorio, secamanos y jabonera.
  Antes había un único sinónimo `lavabo` -> `lavamanos` (ADR-18).
- **Decisión:** `GRUPOS_SINONIMOS` en `lib/busqueda.ts`: cada grupo es una lista
  de términos equivalentes en ambos sentidos (inodoro=taza=wc=sanitario;
  lavamanos=lavabo=lavatorio; secador de manos=secamanos; dispensador de
  jabón=jabonera). Los términos pueden tener varias palabras (deben ir
  seguidas). "Jabonera" es el equivalente menos exacto; se aceptó igual.
- **Alternativas descartadas:** lista unidireccional con una sola clave
  (término buscado -> término del catálogo): obliga a repetir entradas para
  cubrir todos los sentidos y se desordena al crecer. No se evaluó otra.
- **Estado:** vigente (20/10/2026). Los grupos siguen por confirmar con el cliente.
  Actualización 21/10/2026: grupo nuevo barredora=recolector de basura=recolector
  (el "recolector" suelto se añadió porque los términos de varias palabras solo
  coinciden completos).

## ADR-29: Botón flotante de WhatsApp (servidor + cliente), sin carrito, con verde propio
- **Contexto:** se quiere un acceso rápido al asesor desde las páginas donde
  alguien puede tener dudas, sin terceros ni seguimiento.
- **Decisión:** `BotonWhatsApp.tsx` (servidor) arma el enlace con
  `sitio.redes.whatsapp` (o sea `NEXT_PUBLIC_ADVISOR_PHONE`, sin variable nueva)
  y el mensaje "Hola, quiero información sobre sus productos." (+ " Me interesa:
  <nombre>." en ficha y combo). `BotonWhatsAppFlotante.tsx` (cliente) solo
  maneja el comportamiento: se oculta al bajar con scroll y reaparece al subir o
  a los 600 ms quieto (listener pasivo, solo con `motion-safe`). Va en inicio,
  catálogo, ficha y combo; NO en el carrito, para no competir con el wizard de
  pedido. Tamaño 44 px en móvil y 56 px desde `md`, `z-10`, `print:hidden`.
  El globo "¿Necesitas asesoría?" es decorativo (`aria-hidden`): sale a los 3 s,
  se oculta a los 8 s o antes con scroll, abrir un menú (`[aria-expanded]`) o
  tocar el botón, y solo una vez por visita (`sessionStorage` en try/catch, con
  respaldo en variable de módulo).
- **Excepción al sistema de diseño:** el botón es verde `#128C7E` (verde de
  WhatsApp en tono oscuro para que el ícono blanco contraste) y no usa los
  colores de la marca; sin sombra. Es una excepción consciente: reconocer al
  instante que es WhatsApp pesa más que la coherencia de paleta en este único
  elemento.
- **Alternativas descartadas:** ninguna se evaluó.
- **Estado:** vigente (21/10/2026). Limitación conocida: en una ficha con
  precio, si "Agregar al pedido" queda justo en el borde inferior en móvil, el
  botón cubre su extremo derecho.
  Actualización 23/10/2026: el globo ya no es decorativo (`aria-live="polite"`),
  dura 8 s desde los 3 s de la primera página de la visita y solo se cierra
  solo, al tocarlo o con el botón (ni scroll ni menús). Se evaluó montar el botón
  una sola vez en el layout y se descartó: el plazo ya se guarda en
  `sessionStorage` y el layout no conoce el producto de la ficha o el combo.

## ADR-30: Cabecera por encima del botón flotante (`relative z-20`)
- **Contexto:** con el botón flotante (`z-10`), el menú plegable de la cabecera
  en móvil quedaba debajo de él, porque el contenido de la página no tenía
  `z-index`.
- **Decisión:** la cabecera pasa a `relative z-20` (`Header.tsx`, línea 121),
  por encima del botón. Se verificó que no hay solape entre los paneles de la
  cabecera y el panel de categorías del catálogo (también `z-20`) a 360, 768,
  1024 y 1280 px. Si algún día se solaparan, subir la cabecera a `z-30`.
- **Alternativas descartadas:** ninguna se evaluó.
- **Estado:** vigente (21/10/2026).

## ADR-31: Portada de inicio con una imagen en dos versiones y resumen del catálogo por categoría
- **Contexto:** la página de inicio era temporal (nombre, descripción y botón
  al catálogo). Se quería una portada con imagen y, debajo, un resumen del
  catálogo.
- **Decisión (portada):** cada portada es UNA imagen con dos versiones
  (`src/data/portada.ts`): escritorio 1920x720 (8:3) desde `md` y móvil
  800x1000 (4:5) por debajo, con el texto ya dentro de la imagen (no se dibuja
  nada encima). Dirección de arte con `<picture>` + `getImageProps` de Next:
  cada dispositivo descarga solo su versión. El alto se reserva con
  `aspect-ratio` y la primera portada carga con `priority`. Con una sola
  portada se dibuja estática y sin JS; con 2 o más, `CarruselPortada`
  (cliente) agrega UNA flecha "Siguiente imagen" (sin puntos) y avance cada
  6 s, en pausa con hover o foco y desactivado con `prefers-reduced-motion`.
  Las portadas ocultas cargan diferidas (no se descargan hasta mostrarse).
- **Decisión (resumen):** `seccionesResumen()` en `src/lib/resumenCatalogo.ts`
  (lógica pura, `scripts/test-resumen.ts`): por categoría, en el orden del
  catálogo, se saltan los productos sin precio (ADR-13), los disponibles van
  antes que los agotados, máximo 4, y una categoría sin ninguno vendible no
  sale. Sin combos (tienen su propio menú). "Ver todos" usa `urlCatalogo()`.
  Stock y precio con UNA `getStockPorSkus()` e ISR de 60 s, igual que
  `/catalogo`. La tarjeta es `ProductCard` con la prop `compacta` (foto,
  nombre, precio con "IVA incluido" y código del ERP), no un componente nuevo.
- **Alternativas descartadas:** ninguna se evaluó; la forma la fijó el pedido.
- **Nota (22/10/2026):** se quitó el bloque de la portada temporal que había
  quedado al final (título "Maya Home" visible, descripción y botón "Ver
  catálogo"); la portada nueva cumple esa función. En su lugar, tras la última
  categoría, un enlace de texto "Ver catálogo completo" (`urlCatalogo()`). Se
  conserva el `h1` oculto (`sr-only`), único en la página.
- **Nota (23/10/2026):** la parte "sin combos (tienen su propio menú)" la
  reemplaza ADR-32: el resumen tiene ahora una fila "Combos lavamanos".
- **Estado:** vigente (22/10/2026).

## ADR-32: Combos en el resumen de inicio y en la vista "Todos" del catálogo
- **Contexto:** los combos solo se veían en `/catalogo` eligiendo "Combos
  lavamanos" o buscando algo en "Todos"; el inicio no los mostraba (ADR-31).
- **Decisión (inicio):** fila "Combos lavamanos" justo después de la de
  Lavamanos (si esa no sale, al final), con "Ver todos" a
  `urlCatalogo(PESTANA_COMBOS)`. La elige `combosResumen()` en
  `src/lib/resumenCatalogo.ts` (lógica pura): se omiten las familias sin precio
  calculable (`desde = null`: ninguna combinación con las dos piezas con
  precio), las disponibles (alguna combinación vendible no agotada) van
  primero, orden estable de `data/combos.ts`, máximo `POR_CATEGORIA` (4); sin
  ninguna vendible la fila no sale. Los datos de cada familia salen de
  `tarjetaFamilia()` (`src/lib/combos.ts`), que ahora usan también `/catalogo`
  (antes armaba el objeto a mano). Productos y piezas de combos en UNA
  `getStockPorSkus()` (ADR-1). La tarjeta es `ComboCard` con la prop
  `compacta` (foto, "Combo <nombre>", "Desde $X" + "IVA incluido"), sin
  componente nuevo y **sin código**: la ficha `/combos/[familia]` tampoco
  muestra uno (cada pieza tiene su sku), así que no se inventó.
- **Decisión (catálogo):** "Todos" muestra los productos y a continuación los
  combos, bajo el título "Combos lavamanos", con o sin búsqueda (antes solo
  con búsqueda). Una categoría concreta muestra solo esa; "Combos lavamanos",
  solo combos. La cantidad de "Todos" en `opcionesCategorias()` pasa a ser
  productos + familias de combos (33 hoy).
- **Alternativas descartadas:** ninguna se evaluó; la forma la fijó el pedido.
- **Consecuencia:** reemplaza la parte "sin combos" de ADR-31 y el pendiente
  de ADR-18 sobre combos en "Todos".
- **Estado:** vigente (23/10/2026).
