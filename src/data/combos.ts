// src/data/combos.ts
//
// Familias de combos (lavamanos + mueble) de Maya Home. Los sku son los códigos
// del ERP (ver la tabla de combos en docs/MAPEO-PRODUCTOS-ERP.md).
// Aquí NO hay precios ni stock: salen de stock_espejo vía getStockPorSkus.
// Regla: lavamanos y mueble solo se combinan dentro de la MISMA familia.
//
// IMPORTANTE - solo datos reales: los textos salen del catálogo mayorista (PDF)
// y las medidas/colores del ERP. Lo que no esté confirmado NO se escribe.

// Una pieza del combo (lavamanos o mueble) con su código del ERP
export type PiezaCombo = {
  sku: string; // código del ERP (stock_espejo), ya sin espacios
  nombre: string; // nombre completo (carrito, correo, pedido): pieza, familia, medidas y color/acabado
  etiqueta: string; // texto corto para el selector: solo lo que distingue a esta pieza de sus hermanas
};

// Una familia: sus lavamanos y muebles posibles (se combinan todos con todos)
export type FamiliaCombo = {
  id: string; // slug estable, va dentro del id de la combinación
  nombre: string; // nombre para mostrar
  descripcion: string; // texto del catálogo, sin precios
  imagen: string; // foto de la tarjeta y respaldo de las combinaciones sin foto propia
  lavamanos: PiezaCombo[];
  muebles: PiezaCombo[];
};

// FOTOS (un solo sitio): { id de combinación -> ruta de la foto }.
// Para agregar una foto nueva: copiar el JPG (800x600) a public/images/combos/ y
// añadir una línea aquí; no hay que tocar ninguna lógica. Las combinaciones que no
// aparecen en este mapa usan la foto de su familia, marcada como "imagen referencial".
// El id es "<familia>__<sku lavamanos>__<sku mueble>" (ver idCombinacion en src/lib/combos.ts);
// el test (scripts/test-combos.ts) falla si alguna clave no es una combinación válida.
export const FOTOS_COMBINACION: Record<string, string> = {
  "lux-600__LAVLUX-600BL__MUEBLLUX-600SMOKE": "/images/combos/lux-600.jpg",
  "flute-800__LAVFLUTE800BL__MUEBLFLUTE800NATURA": "/images/combos/flute-800.jpg",
  "connon-sx800__LAVCONNONSX800BLACK__MUEBLCONNOSX-800SMOK": "/images/combos/connon-sx800.jpg",
  "connon-sx800__LAVCONNONSX800BL__MUEBLCONNOSX-800SMOK": "/images/combos/connon-sx800-blanco.jpg",
  "lux-800__LAVLUX-800BL__MUEBLLUX-800HONEY": "/images/combos/lux-800-blanco-honey.jpg",
  "lux-800__LAVLUX-800BLACK__MUEBLLUX-800SUNTH": "/images/combos/lux-800-negro-sunth.jpg",
  "lux-800__LAVLUX-800BL__MUEBLLUX-800SUNTH": "/images/combos/lux-800-blanco-sunth.jpg",
  "lux-800__LAVLUX-800BLACK__MUEBLLUX-800HONEY": "/images/combos/lux-800-negro-honey.jpg",
  "lumina-1600__LAVLUMINA-1600BL__MUEBLLUMINA-1600DANI": "/images/combos/lumina-1600.jpg",
};

// Foto ambientada o de vista extra de una combinación: se muestra como miniatura en la
// ficha del combo, después de la foto principal. width y height son los px del archivo.
export type FotoExtraCombo = { src: string; alt: string; width: number; height: number };

// FOTOS EXTRA (un solo sitio): { id de combinación -> fotos extra }, mismo id que
// FOTOS_COMBINACION. Una combinación que no aparece aquí no muestra miniaturas.
// El test (scripts/test-combos.ts) falla si alguna clave no es una combinación válida
// o si falta algún archivo.
export const FOTOS_EXTRA_COMBINACION: Record<string, FotoExtraCombo[]> = {
  "lux-600__LAVLUX-600BL__MUEBLLUX-600SMOKE": [
    { src: "/images/combos/lux-600-2.jpg", alt: "Combo LUX-600: lavamanos blanco y mueble de nogal de dos cajones, instalado en un baño", width: 1254, height: 1254 },
    { src: "/images/combos/lux-600-3.jpg", alt: "Combo LUX-600, vista frontal sobre fondo gris", width: 1254, height: 1254 },
  ],
  "flute-800__LAVFLUTE800BL__MUEBLFLUTE800NATURA": [
    { src: "/images/combos/flute-800-2.jpg", alt: "Combo FLUTE-800: lavamanos blanco y mueble de roble con tiradores negros, instalado en un baño", width: 1158, height: 1359 },
    { src: "/images/combos/flute-800-3.jpg", alt: "Combo FLUTE-800, vista frontal sobre fondo gris", width: 1158, height: 1359 },
  ],
  "connon-sx800__LAVCONNONSX800BL__MUEBLCONNOSX-800SMOK": [
    { src: "/images/combos/connon-sx800-blanco-2.jpg", alt: "Combo CONNON SX-800 con lavamanos blanco y mueble acanalado de nogal, instalado en un baño", width: 1122, height: 1402 },
    { src: "/images/combos/connon-sx800-blanco-3.jpg", alt: "Combo CONNON SX-800 con lavamanos blanco, vista frontal sobre fondo gris", width: 1123, height: 1401 },
  ],
  "connon-sx800__LAVCONNONSX800BLACK__MUEBLCONNOSX-800SMOK": [
    { src: "/images/combos/connon-sx800-2.jpg", alt: "Combo CONNON SX-800 con lavamanos negro y mueble acanalado de nogal, instalado en un baño", width: 1127, height: 1396 },
    { src: "/images/combos/connon-sx800-3.jpg", alt: "Combo CONNON SX-800 con lavamanos negro, vista frontal sobre fondo gris", width: 1127, height: 1396 },
  ],
  "lumina-1600__LAVLUMINA-1600BL__MUEBLLUMINA-1600DANI": [
    { src: "/images/combos/lumina-1600-2.jpg", alt: "Combo LUMINA-1600: dos lavamanos blancos sobre mueble oscuro de cuatro cajones, instalado en un baño", width: 1254, height: 1254 },
    { src: "/images/combos/lumina-1600-3.jpg", alt: "Combo LUMINA-1600, vista frontal sobre fondo gris", width: 1254, height: 1254 },
  ],
  "lux-800__LAVLUX-800BL__MUEBLLUX-800HONEY": [
    { src: "/images/combos/lux-800-blanco-honey-2.jpg", alt: "Combo LUX-800 con lavamanos blanco y mueble de nogal miel dorado, instalado en un baño", width: 1254, height: 1254 },
    { src: "/images/combos/lux-800-blanco-honey-3.jpg", alt: "Combo LUX-800 con lavamanos blanco y mueble de nogal miel dorado, vista frontal sobre fondo gris", width: 1254, height: 1254 },
  ],
  "lux-800__LAVLUX-800BL__MUEBLLUX-800SUNTH": [
    { src: "/images/combos/lux-800-blanco-sunth-2.jpg", alt: "Combo LUX-800 con lavamanos blanco y mueble de nogal Sun Thin, instalado en un baño", width: 1024, height: 1536 },
  ],
  "lux-800__LAVLUX-800BLACK__MUEBLLUX-800HONEY": [
    { src: "/images/combos/lux-800-negro-honey-2.jpg", alt: "Combo LUX-800 con lavamanos negro y mueble de nogal miel dorado, instalado en un baño", width: 1024, height: 1536 },
  ],
  "lux-800__LAVLUX-800BLACK__MUEBLLUX-800SUNTH": [
    { src: "/images/combos/lux-800-negro-sunth-2.jpg", alt: "Combo LUX-800 con lavamanos negro y mueble de nogal Sun Thin, instalado en un baño", width: 1254, height: 1254 },
    { src: "/images/combos/lux-800-negro-sunth-3.jpg", alt: "Combo LUX-800 con lavamanos negro y mueble de nogal Sun Thin, vista frontal sobre fondo gris", width: 1254, height: 1254 },
  ],
};

export const FAMILIAS_COMBO: FamiliaCombo[] = [
  {
    id: "lux-600",
    nombre: "LUX-600",
    descripcion:
      "Lavamanos de bordes suaves. Mueble de 2 cajones con marco y tiradores negros. Incluye desagüe tipo push metálico.",
    imagen: "/images/combos/lux-600.jpg",
    lavamanos: [
      { sku: "LAVLUX-600BL", nombre: "LAV LUX-600 BLANCO · 60*48", etiqueta: "Blanco" },
    ],
    muebles: [
      {
        sku: "MUEBLLUX-600SMOKE",
        nombre: "MUEBL LUX-600 SMOKE WALNUT · 59.2*47.4",
        etiqueta: "Nogal ahumado",
      },
    ],
  },
  {
    id: "flute-800",
    nombre: "FLUTE-800",
    descripcion:
      "Lavamanos de líneas rectas. Mueble de 2 cajones con tiradores negros. Incluye desagüe tipo push metálico.",
    imagen: "/images/combos/flute-800.jpg",
    lavamanos: [
      { sku: "LAVFLUTE800BL", nombre: "LAV FLUTE 800 WHITE · 80*48", etiqueta: "Blanco" },
    ],
    muebles: [
      {
        sku: "MUEBLFLUTE800NATURA",
        nombre: "MUEBL FLUTE 800 NATURAL OAK · 79.2*47.4",
        etiqueta: "Roble claro",
      },
    ],
  },
  {
    id: "connon-sx800",
    nombre: "CONNON SX800",
    descripcion: "Lavamanos ovalado. Mueble de 2 cajones con frente acanalado, sin tiradores.",
    imagen: "/images/combos/connon-sx800.jpg",
    lavamanos: [
      { sku: "LAVCONNONSX800BL", nombre: "LAV CONNON SX-800 WHITE · 80*52.5", etiqueta: "Blanco" },
      {
        sku: "LAVCONNONSX800BLACK",
        nombre: "LAV CONNON SX-800 BLACK · 80*52.5",
        etiqueta: "Negro mate",
      },
    ],
    muebles: [
      {
        sku: "MUEBLCONNOSX-800SMOK",
        nombre: "MUEBL CONNON SX-800 SMOKE WALNUT · 79.2*51.9",
        etiqueta: "Nogal oscuro",
      },
    ],
  },
  {
    id: "lux-800",
    nombre: "LUX-800",
    descripcion:
      "Lavamanos de bordes suaves. Mueble de 2 cajones con marco y tiradores negros. Incluye desagüe tipo push metálico.",
    imagen: "/images/combos/lux-800-blanco-honey.jpg",
    lavamanos: [
      { sku: "LAVLUX-800BL", nombre: "LAV LUX-800 WHITE · 80*48", etiqueta: "Blanco" },
      {
        sku: "LAVLUX-800BLACK",
        nombre: "LAV LUX-800 BLACK · 80*48",
        etiqueta: "Negro mate",
      },
    ],
    muebles: [
      { sku: "MUEBLLUX-800HONEY", nombre: "MUEBL LUX-800 HONEY GOLD WALNUT · 79.2*47.4", etiqueta: "Nogal miel" },
      { sku: "MUEBLLUX-800SUNTH", nombre: "MUEBL LUX-800 SUN THIN WALNUT · 79.2*47.4", etiqueta: "Roble claro" },
    ],
  },
  {
    id: "lumina-1600",
    nombre: "LUMINA-1600",
    descripcion: "Dos lavamanos de sobreponer sobre mueble de 4 cajones, para baños principales.",
    imagen: "/images/combos/lumina-1600.jpg",
    lavamanos: [
      { sku: "LAVLUMINA-1600BL", nombre: "LAV LUMINA-1600 BLANCO · 60*40", etiqueta: "Blanco" },
    ],
    muebles: [
      {
        sku: "MUEBLLUMINA-1600DANI",
        nombre: "MUEBL LUMINA-1600 DANISH WALNUT · 160*52.5",
        etiqueta: "Oscuro",
      },
    ],
  },
];
