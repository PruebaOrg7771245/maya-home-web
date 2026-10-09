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
  "lux-800__LAVLUX-800BL__MUEBLLUX-800HONEY": "/images/combos/lux-800-blanco-honey.jpg",
  "lux-800__LAVLUX-800BLACK__MUEBLLUX-800SUNTH": "/images/combos/lux-800-negro-sunth.jpg",
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
      { sku: "LAVLUX-600BL", nombre: "Lavamanos LUX-600 · 60x48 cm · blanco", etiqueta: "Blanco" },
    ],
    muebles: [
      {
        sku: "MUEBLLUX-600SMOKE",
        nombre: "Mueble LUX-600 · 59,2x47,4 cm · nogal ahumado",
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
      { sku: "LAVFLUTE800BL", nombre: "Lavamanos FLUTE-800 · 80x48 cm · blanco", etiqueta: "Blanco" },
    ],
    muebles: [
      {
        sku: "MUEBLFLUTE800NATURA",
        nombre: "Mueble FLUTE-800 · 79,2x47,4 cm · roble claro",
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
      { sku: "LAVCONNONSX800BL", nombre: "Lavamanos CONNON SX800 · 80x52,5 cm · blanco", etiqueta: "Blanco" },
      {
        sku: "LAVCONNONSX800BLACK",
        nombre: "Lavamanos CONNON SX800 · 80x52,5 cm · negro mate",
        etiqueta: "Negro mate",
      },
    ],
    muebles: [
      {
        sku: "MUEBLCONNOSX-800SMOK",
        nombre: "Mueble CONNON SX800 · 79,2x51,9 cm · nogal oscuro",
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
      { sku: "LAVLUX-800BL", nombre: "Lavamanos LUX-800 · 80x48 cm · blanco", etiqueta: "Blanco" },
      {
        sku: "LAVLUX-800BLACK",
        nombre: "Lavamanos LUX-800 · 80x48 cm · negro mate",
        etiqueta: "Negro mate",
      },
    ],
    muebles: [
      { sku: "MUEBLLUX-800HONEY", nombre: "Mueble LUX-800 · 79,2x47,4 cm · nogal miel", etiqueta: "Nogal miel" },
      { sku: "MUEBLLUX-800SUNTH", nombre: "Mueble LUX-800 · 79,2x47,4 cm · roble claro", etiqueta: "Roble claro" },
    ],
  },
  {
    id: "lumina-1600",
    nombre: "LUMINA-1600",
    descripcion: "Dos lavamanos de sobreponer sobre mueble de 4 cajones, para baños principales.",
    imagen: "/images/combos/lumina-1600.jpg",
    lavamanos: [
      { sku: "LAVLUMINA-1600BL", nombre: "Lavamanos LUMINA-1600 · 60x40 cm · blanco", etiqueta: "Blanco" },
    ],
    muebles: [
      {
        sku: "MUEBLLUMINA-1600DANI",
        nombre: "Mueble LUMINA-1600 · 160x52,5 cm · oscuro",
        etiqueta: "Oscuro",
      },
    ],
  },
];
