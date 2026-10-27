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
