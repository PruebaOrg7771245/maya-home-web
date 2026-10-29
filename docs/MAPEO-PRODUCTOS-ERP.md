# Mapeo de productos web ↔ códigos del ERP (stock_espejo)

Fuente: consultas sobre `stock_espejo` (bodega BG). Los nombres para mostrar salen del catálogo PDF; el nombre del ERP solo se usa para buscar.

## Reglas ya decididas

- La web muestra **solo el precio PÚBLICO del ERP** (`stock_espejo.precio_publico`, **IVA incluido**).
- Estado de stock: existencia ≤ 0 → Agotado; > 0 y ≤ 5 → Pocas unidades; > 5 → Disponible.
- **Combos = ETAPA 2 (implementada el 08/10/2026; ver ADR-14 y ADR-15).** Alcance: **todas las combinaciones válidas por familia** (9 en total; LUX-800 admite sus 4 combinaciones). Stock del combo = la **menor** existencia de sus dos piezas. Precio = **suma de los precios públicos de las dos piezas (IVA incluido)**; los descuentos los maneja el asesor y la tarjeta del combo dice 'Consulta nuestros descuentos por llevarte el combo'.
- **Sin precio = no se vende.** Un producto sin fila en `stock_espejo` o con precio 0 es un error de datos o un producto que aún no está en el ERP: no se agrega al carrito. Un producto **agotado** (con fila y precio, existencia <= 0) **sí** se puede agregar, con el aviso 'Consulta la disponibilidad con tu asesor'.
- Los datos se actualizan **a mano** con `sync-stock.js` desde la red de la oficina.

## Productos individuales (sku = código ERP)

| Categoría | Nombre web | sku (código ERP) | Nota |
| --- | --- | --- | --- |
| Dispensadores | Dispensador de jabón manual · blanco | `KW-7226WHITE` |  |
| Dispensadores | Dispensador de jabón manual · acero antimanchas | `KW-7217GUNGREY` |  |
| Dispensadores | Dispensador de jabón automático · blanco | `KW-7206ABSWHITE` |  |
| Dispensadores | Dispensador de jabón automático · acero antimanchas | `KW-7206GUNGREY` |  |
| Dispensadores | Dispensador de papel blanco (papel rectangular) | `KW-7336WHITE` |  |
| Dispensadores | Dispensador de papel manual blanco (rollo) | `KW-7316WHITE` |  |
| Dispensadores | Dispensador de papel manual · acero antimanchas | `KW-7370GUNGREY` |  |
| Dispensadores | Dispensador automático de papel · acero antimanchas | `KW-7390GUNGREY` |  |
| Secadores de manos | Secador de manos pequeño · blanco | `KW-1019WHITE` |  |
| Secadores de manos | Secador de manos mediano | `KW-1036GUNGREY` | El PDF dice 'negro' pero el código es GUNGREY y el material acero: revisar |
| Secadores de manos | Secador de manos grande · blanco | `KW-1091PLUS` |  |
| Secadores de manos | Secador de manos grande · acero antimanchas | `KW-1090GUNGREY` |  |
| Sanitarios | Inodoro de una pieza · blanco | `717` | El ERP lo llama 'TANQUE ALTO'; el PDF 'una pieza': verificar |
| Sanitarios | Inodoro de una pieza · negro mate | `717-MB` | Igual que el 717 |
| Sanitarios | Inodoro compacto · negro mate | `SD-1001MB` |  |
| Sanitarios | Inodoro compacto · blanco | `SD-1001` |  |
| Sanitarios | Inodoro inteligente · blanco | `168W` |  |
| Lavamanos | Lavamanos rectangular · blanco (tipo vessel) | `9636` |  |
| Lavamanos | Lavamanos rectangular · negro mate (tipo vessel) | `9636M001` |  |
| Lavamanos | Lavamanos bajo encimera · blanco | `4243` |  |
| Lavamanos | Lavamanos de columna · blanco | `B-191` |  |
| Accesorios | Espejo 3 en 1 | `KW-3005` | Medidas 75 × 110 cm (unidad ya corregida en el PDF) |
| Accesorios | Barra de apoyo · acero antimanchas | `KW-7501GUNGREY` |  |
| Saunas | Sauna 120×100×200 (vidrio 6 mm) [nombre provisional, sale del ERP] | `SN96129-1200` | Sin foto ni descripción: no está en el PDF |
| Saunas | Sauna 135×110×210 (vidrio 8 mm) [nombre provisional, sale del ERP] | `SN96137-1350` | Sin foto ni descripción: no está en el PDF |

### Pisos de bambú y piedras flexibles (cargados el 26/10/2026)

Skus y medidas verificados por Mateo en el ERP. El nombre del ERP es
la columna `producto` de `stock_espejo`. Existencia y precio salen del ERP (no se copian aquí).

| Categoría | Nombre web | sku (código ERP) | Nombre en el ERP | Nota |
|---|---|---|---|---|
| Pisos de bambú | Piso de bambú · natural | `BAMBNATU18501514MM` | BAMBU NATURAL 1850*185*14MM (1.37M-4P ) FOSH | Venta por m² (umbral 20). Sin foto. "Contenido por caja" pendiente: no cargado |
| Pisos de bambú | Piso de bambú · carbonized | `BAMBCARBO185018514MM` | BAMBU CARBONIZED 1850*185*14MM (1.37M-4P) FOSH | Igual que el natural |
| Piedras flexibles | Piedra flexible · Star Moon | `6810191000` | FLEXIBLE STONE STAR MOON 60*120 FOSH | Venta por unidad |
| Piedras flexibles | Piedra flexible · Linen Weaving | `6810191001` | FLEXIBLE STONE LINEN WEAVING 60*120 FOSH | Venta por unidad |
| Piedras flexibles | Piedra flexible · 3D Travertine | `6810191002` | FLEXIBLE STONE 3D TRAVERTINE 60*120 FOSH | Venta por unidad |
| Piedras flexibles | Piedra de poliuretano · Volcanic Gray | `39255900000` | PANEL STONE VOLCANIC GRAY 60*120 FOSH | sku de 11 dígitos, tal cual del ERP (confirmado) |
| Piedras flexibles | Piedra de poliuretano · White Jade | `3925900001` | PANEL STONE WHITE JADE 60*120 FOSH | sku de 10 dígitos, tal cual del ERP (confirmado) |

## Combos (2 códigos por versión) — 9 combinaciones válidas

Regla de familias: lavamanos y mueble solo se combinan si **comparten la referencia de familia en el código** (`LUX-600`, `FLUTE800`, `CONNONSX800`/`CONNOSX-800`, `LUX-800`, `LUMINA-1600`). LUX-600 **no** se mezcla con LUX-800 ni con ninguna otra. Que LUX-800 admita lavamanos y muebles cruzados es intencional (así lo creó el negocio).

| Familia | Código lavamanos | Código mueble |
| --- | --- | --- |
| LUX-600 | `LAVLUX-600BL` | `MUEBLLUX-600SMOKE` |
| FLUTE-800 | `LAVFLUTE800BL` | `MUEBLFLUTE800NATURA` |
| CONNON SX800 | `LAVCONNONSX800BL` | `MUEBLCONNOSX-800SMOK` |
| CONNON SX800 | `LAVCONNONSX800BLACK` | `MUEBLCONNOSX-800SMOK` |
| LUX-800 | `LAVLUX-800BL` | `MUEBLLUX-800HONEY` |
| LUX-800 | `LAVLUX-800BL` | `MUEBLLUX-800SUNTH` |
| LUX-800 | `LAVLUX-800BLACK` | `MUEBLLUX-800HONEY` |
| LUX-800 | `LAVLUX-800BLACK` | `MUEBLLUX-800SUNTH` |
| LUMINA-1600 | `LAVLUMINA-1600BL` | `MUEBLLUMINA-1600DANI` |

El precio del combo sale del ERP: `src/lib/combos.ts` suma los precios públicos (IVA incluido) de cada pieza y redondea una sola vez al final.

### Notas de combos

- **El ERP no tiene precio de combo.** El precio mostrado es la suma de los precios públicos de las dos piezas (IVA incluido). Los descuentos los maneja el asesor; la tarjeta dice 'Consulta nuestros descuentos por llevarte el combo'.
- Si falta una pieza en el ERP (sin fila o precio 0): el combo no tiene precio y **no se vende**. Si una pieza está agotada: el combo está agotado y **se puede agregar** con el aviso.
- Si dos combos comparten una pieza (ej. el mismo mueble CONNON o LUX-800), el stock de cada combo **no descuenta** el del otro. Simplificación aceptada por ahora.
- `MUEBLLUX-600SMOKE` llega con espacios al final desde el ERP: sin el `.trim()` en `sync-stock.js` el combo LUX-600 no encuentra su pieza.
- Fotos: hay una foto por combo/versión en el catálogo (LUX-800: las 4 combinaciones tienen foto propia). Implementado: 6 fotos del PDF en `public/images/combos/` (mapa `FOTOS_COMBINACION` en `src/data/combos.ts`, origen ~360 px, se ven suaves: pedir originales). LUX-800 tiene 4 fotos propias (1448 × 1086, 27/10/2026). Las combinaciones sin foto propia usan la foto de la familia con la leyenda "Imagen referencial: el color puede variar".
- Los skus de las piezas se declaran en `src/data/combos.ts`; si cambia un código en el ERP, cambiarlo ahí y en la tabla de arriba.

## Pendientes del catálogo (a corregir antes de publicar)

- Combo LUX-800 (pág. 8): texto 'lavamanos negro mate' vs código `LAVLUX-800BL` (blanco). Con las 4 combinaciones abiertas deja de ser bloqueante, pero el texto del PDF debe corregirse.
- Pág. 3: secador mediano 'negro' vs acero (GUNGREY).
- Inodoro 717/717-MB: ERP 'tanque alto' vs PDF 'una pieza'.
- Textos de plantilla con corchetes (`[110 / 220] V`, `[de toallas]`) y typo 'Dispensor'.

## Ya corregidos en el PDF (por Mateo)

- Ref. [6936] → [9636] (lavamanos rectangular blanco).
- Medidas del espejo 3 en 1: mm → cm.
- Pág. 1: rótulo del dispensador de jabón manual blanco (decía 'PAPEL').

## Decisión de nombres

- La categoría de los inodoros se queda como **Sanitarios** (el catálogo PDF dice 'Inodoros', pero no es la fuente oficial de nombres).
- Los dispensadores van en UNA categoría: **Dispensadores**.
