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
- **Alternativas descartadas:** pasarela de pago real — descartada por
  ahora porque no hay backend de pedidos ni necesidad inmediata de cobrar
  online.
- **Estado:** vigente. Si en el futuro se agrega pago en línea, este ADR
  queda superado y hay que documentar el reemplazo acá.

## ADR-3: Sin backend propio (todavía)
- **Contexto:** el catálogo vive en `src/data/products.ts` (datos
  estáticos en el repo), no en una base de datos propia del sitio.
- **Decisión:** por ahora el sitio es mayormente estático; los únicos
  puntos que van a requerir datos externos en vivo son el stock (ADR-1) y,
  eventualmente, pedidos/pagos.
- **Estado:** vigente.
