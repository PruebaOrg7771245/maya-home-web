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
