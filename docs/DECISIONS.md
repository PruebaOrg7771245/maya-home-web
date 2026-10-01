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
- **Estado:** vigente. Pendiente reemplazar el placeholder — ver
  [`REQUIREMENTS-STOCK.md`](./REQUIREMENTS-STOCK.md).

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
