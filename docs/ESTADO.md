# Estado del proyecto

Resumen vivo de dónde está el proyecto. No repite el detalle de
[`CHANGELOG.md`](./CHANGELOG.md) ni de [`DECISIONS.md`](./DECISIONS.md).
Última actualización: 27/10/2026.

## Hecho
- Catálogo de 35 productos en 11 categorías, con precio y stock desde `stock_espejo`.
- Catálogo con cinta de categorías y buscador sobre todo el catálogo (ADR-33, ADR-34).
- Combos lavamanos + mueble con nombres de pieza según el ERP; LUX-800 con foto propia en sus 4 combinaciones.
- Venta por medida del piso de bambú: estado sin existencia visible y cobro por cajas de 1,37 m² (ADR-35, ADR-36).
- Carrito en 3 pasos con pedido por WhatsApp o correo; el total se calcula en el servidor.
- Enlace "Ver carrito" en la ficha, junto al selector de cantidad.
- Portada con carrusel y catálogo resumido en "/".
- LUMINA-1600 resuelto: los 2 lavamanos se venden bajo un solo SKU del ERP (60×40) porque el mueble es específico para el par; el precio es correcto.

## Antes de publicar
- Hacer un pedido de prueba (13 m² de bambú → $669,52, 9 cajas, 12,33 m²) y borrarlo después.
- Correr `sync-stock.js` desde la red de la oficina (el stock se llena a mano).
- Configurar las variables de entorno de Preview (y Production) en Vercel.
- Confirmar el número de WhatsApp real (`NEXT_PUBLIC_ADVISOR_PHONE`).
- Poner los correos reales de los asesores (`ADVISOR_EMAIL`, Resend).
- Definir el dominio.
- Revisar la vista previa de Vercel de punta a punta antes de publicar.

## Datos pendientes
- "4 piezas por caja" del bambú: el ERP dice "(1.37M-4P)", pero no está confirmado.
- Fotos de los otros 5 combos al estilo de las de LUX-800 (hoy usan la foto de la familia).
- Color de los muebles de LUX-800 frente a "WALNUT" del ERP: sin confirmar cuál es el correcto.
- Título del sitio: pendiente de definir.

## Ideas futuras
- Carrito persistente (hoy solo en memoria; se pierde al recargar).
- Barra fija "Ver carrito" en celular.
- Aviso de descuento en combos.
- Horarios de atención.
- Galería de ángulos de los combos.
- Pasarela Datafast: Datalink es el proceso; Dataweb solo si el cliente lo quiere.

## Deuda técnica
- `scripts/test-ficha.ts` usa conteos fijos (falla si cambian las características o los detalles de un producto).
- `PESTANA_COMBOS` es a la vez texto visible y valor de URL (`lib/catalogoUrl.ts`).
- La cinta de categorías no tiene botón de pausa: incumple WCAG 2.2.2; decisión del dueño (ADR-34).
