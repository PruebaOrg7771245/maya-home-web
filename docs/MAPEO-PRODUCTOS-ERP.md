# Mapeo de productos web ↔ códigos del ERP (stock_espejo)

Fuente: resultados reales de las consultas sobre `stock_espejo` (bodega BG, precio PÚBLICO). Los nombres para mostrar salen del catálogo PDF; el nombre del ERP solo se usa para buscar.

## Reglas ya decididas

- La web muestra **solo el precio PÚBLICO del ERP** (`stock_espejo.precio_publico`, **IVA incluido**). Los precios del catálogo/Excel son mayoristas y **no se usan**.
- Estado de stock: existencia ≤ 0 → Agotado; > 0 y ≤ 5 → Pocas unidades; > 5 → Disponible.
- **Combos = ETAPA 2 (todavía no se implementan).** Alcance: solo los combos del catálogo (LUX-800 con sus 2 versiones del catálogo, no las 4 combinaciones). Stock del combo = la **menor** existencia de sus dos piezas. Precio = **suma de los precios públicos de las dos piezas (IVA incluido)**; los descuentos los maneja el asesor y la tarjeta del combo dice 'Consulta nuestros descuentos por llevarte el combo'.
- **Sin precio = no se vende.** Un producto sin fila en `stock_espejo` o con precio 0 es un error de datos o un producto que aún no está en el ERP: no se agrega al carrito. Un producto **agotado** (con fila y precio, existencia <= 0) **sí** se puede agregar, con el aviso 'Consulta la disponibilidad con tu asesor'.
- Los datos se actualizan **a mano** con `sync-stock.js` desde la red de la oficina.

## Productos individuales (sku = código ERP)

| Categoría | Nombre web | sku (código ERP) | Existencia | Precio sin IVA (ERP) | ≈ Precio con IVA | Estado | Nota |
|---|---|---|---:|---:|---:|---|---|
| Dispensadores | Dispensador de jabón manual · blanco | `KW-7226WHITE` | 24 | 23.26 | 26.75 | Disponible |  |
| Dispensadores | Dispensador de jabón manual · acero antimanchas | `KW-7217GUNGREY` | 24 | 41.30 | 47.49 | Disponible |  |
| Dispensadores | Dispensador de jabón automático · blanco | `KW-7206ABSWHITE` | 24 | 56.74 | 65.25 | Disponible |  |
| Dispensadores | Dispensador de jabón automático · acero antimanchas | `KW-7206GUNGREY` | 24 | 67.17 | 77.25 | Disponible |  |
| Dispensadores | Dispensador de papel blanco (papel rectangular) | `KW-7336WHITE` | 20 | 23.26 | 26.75 | Disponible |  |
| Dispensadores | Dispensador de papel manual blanco (rollo) | `KW-7316WHITE` | 24 | 23.26 | 26.75 | Disponible |  |
| Dispensadores | Dispensador de papel manual · acero antimanchas | `KW-7370GUNGREY` | 24 | 46.52 | 53.50 | Disponible |  |
| Dispensadores | Dispensador automático de papel · acero antimanchas | `KW-7390GUNGREY` | 50 | 144.35 | 166.00 | Disponible |  |
| Secadores de manos | Secador de manos pequeño · blanco | `KW-1019WHITE` | 36 | 77.39 | 89.00 | Disponible |  |
| Secadores de manos | Secador de manos mediano | `KW-1036GUNGREY` | 36 | 173.04 | 199.00 | Disponible | El PDF dice 'negro' pero el código es GUNGREY y el material acero: revisar |
| Secadores de manos | Secador de manos grande · blanco | `KW-1091PLUS` | 12 | 356.52 | 410.00 | Disponible |  |
| Secadores de manos | Secador de manos grande · acero antimanchas | `KW-1090GUNGREY` | 12 | 516.52 | 594.00 | Disponible |  |
| Sanitarios | Inodoro de una pieza · blanco | `717` | 59 | 197.51 | 227.14 | Disponible | El ERP lo llama 'TANQUE ALTO'; el PDF 'una pieza': verificar |
| Sanitarios | Inodoro de una pieza · negro mate | `717-MB` | 12 | 263.36 | 302.86 | Disponible | Igual que el 717 |
| Sanitarios | Inodoro compacto · negro mate | `SD-1001MB` | 12 | 395.03 | 454.28 | Disponible |  |
| Sanitarios | Inodoro compacto · blanco | `SD-1001` | 60 | 318.82 | 366.64 | Disponible |  |
| Sanitarios | Inodoro inteligente · blanco | `168W` | 12 | 478.26 | 550.00 | Disponible |  |
| Lavamanos | Lavamanos rectangular · blanco (tipo vessel) | `9636` | 24 | 69.32 | 79.72 | Disponible |  |
| Lavamanos | Lavamanos rectangular · negro mate (tipo vessel) | `9636M001` | 12 | 103.98 | 119.58 | Disponible |  |
| Lavamanos | Lavamanos bajo encimera · blanco | `4243` | 12 | 90.12 | 103.64 | Disponible |  |
| Lavamanos | Lavamanos de columna · blanco | `B-191` | 15 | 259.94 | 298.93 | Disponible |  |
| Accesorios | Espejo 3 en 1 | `KW-3005` | 4 | 618.48 | 711.25 | Pocas unidades | Medidas 75 × 110 cm (unidad ya corregida en el PDF) |
| Accesorios | Barra de apoyo · acero antimanchas | `KW-7501GUNGREY` | 30 | 44.35 | 51.00 | Disponible | Su precio público es ×1,27 el mayorista; el resto de productos ≈ ×1,25 |
| Saunas | Sauna 120×100×200 (vidrio 6 mm) [nombre provisional, sale del ERP] | `SN96129-1200` | 4 | 2508.70 | 2885.00 | Pocas unidades | Sin foto ni descripción: no está en el PDF |
| Saunas | Sauna 135×110×210 (vidrio 8 mm) [nombre provisional, sale del ERP] | `SN96137-1350` | 2 | 4660.87 | 5360.00 | Pocas unidades | Sin foto ni descripción: no está en el PDF |

## Combos (2 códigos por versión)

| Combo | Versión | Código lavamanos | Código mueble | Stock lav. | Stock mueble | Stock combo | Suma piezas sin IVA | ≈ Precio mostrado (con IVA) | Estado | Nota |
|---|---|---|---|---:|---:|---:|---:|---:|---|---|
| Combo LUX-600 | lavamanos blanco + mueble nogal | `LAVLUX-600BL` | `MUEBLLUX-600SMOKE` | 30 | 30 | 30 | 360.13 | 414.15 | Disponible | El código del mueble tiene espacios al final en el ERP (corregir en el script de sincronización) |
| Combo FLUTE-800 | lavamanos blanco + mueble roble claro | `LAVFLUTE800BL` | `MUEBLFLUTE800NATURA` | 12 | 12 | 12 | 410.48 | 472.05 | Disponible |  |
| Combo CONNON SX800 | lavamanos negro mate + mueble nogal oscuro | `LAVCONNONSX800BLACK` | `MUEBLCONNOSX-800SMOK` | 6 | 12 | 6 | 473.43 | 544.44 | Disponible | El mismo mueble sirve para las 2 versiones |
| Combo CONNON SX800 | lavamanos blanco + mueble nogal oscuro | `LAVCONNONSX800BL` | `MUEBLCONNOSX-800SMOK` | 6 | 12 | 6 | 473.43 | 544.44 | Disponible |  |
| Combo LUX-800 | lavamanos negro + mueble nogal (HONEY) — catálogo pág. 7 | `LAVLUX-800BLACK` | `MUEBLLUX-800HONEY` | 12 | 12 | 12 | 416.61 | 479.10 | Disponible |  |
| Combo LUX-800 | lavamanos blanco (BL) + mueble roble claro (SUNTH) — catálogo pág. 8 | `LAVLUX-800BL` | `MUEBLLUX-800SUNTH` | 12 | 12 | 12 | 416.61 | 479.10 | Disponible | PENDIENTE: el texto de la pág. 8 dice lavamanos 'negro mate' pero el código BL es el blanco |
| Combo LUMINA-1600 | 2 lavamanos blancos + mueble oscuro | `LAVLUMINA-1600BL` | `MUEBLLUMINA-1600DANI` | 12 | 6 | 6 | 694.47 | 798.64 | Disponible |  |

### Notas de combos

- **El ERP no tiene precio de combo.** El precio mostrado es la suma de los precios públicos de las dos piezas (IVA incluido). Los descuentos por combo los maneja el asesor; la tarjeta dice 'Consulta nuestros descuentos por llevarte el combo'.
- LUX-800 tiene 4 piezas en el ERP (2 lavamanos × 2 muebles, mismo precio y stock 12). Se venden todas las combinaciones, pero **por ahora solo se manejan las 2 del catálogo**; las otras quedan como mejora futura.
- Si dos combos comparten una pieza (ej. el mismo lavamanos), el stock de cada combo **no descuenta** el del otro. Es una simplificación aceptada por ahora.

## Pendientes del catálogo (a corregir antes de publicar)

- Combo LUX-800 (pág. 8): texto 'lavamanos negro mate' vs código `LAVLUX-800BL` (blanco).
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
