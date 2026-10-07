// src/data/products.ts
//
// Catálogo real de Maya Home. Los 9 primeros productos salen del packing list
// del proveedor (Guangdong Yingjie Sanitary Ware Technology Co., Ltd - Invoice
// YJ20260429CO); el resto (dispensadores, secadores, espejo, barra de apoyo y
// saunas) se agregó desde el catálogo PDF y el mapeo en docs/MAPEO-PRODUCTOS-ERP.md.
//
// IMPORTANTE - datos que siguen pendientes:
// - Precios: quedan en null. El precio público vendrá del ERP (stock_espejo);
//   los precios del catálogo PDF son mayoristas y NO se copian aquí.
// - Nombres comerciales: los de los 9 primeros son una versión legible armada
//   a partir del packing list, no nombres oficiales. Los nuevos usan el
//   "nombre web" del mapeo.
// - Fotos: salen del catálogo PDF (baja resolución, ~250-500 px de lado), así
//   que conviene reemplazarlas por fotos reales en alta resolución antes de la
//   versión final. Los saunas no tienen foto y usan placeholder.jpg.
// - Los comentarios "TODO" marcan datos en duda del catálogo/ERP: se dejaron
//   en blanco a propósito hasta confirmarlos.

export type ProductVariant = {
  attribute: string;
  value: string;
};

export type ProductPrices = {
  minorista: number | null;
  mayorista: number | null;
};

export type Product = {
  id: string;
  name: string;
  category: string;
  subcategory?: string;
  description: string;
  images: string[];
  variants: ProductVariant[];
  prices: ProductPrices;
  brand?: string;
  sku?: string; // código del producto en el ERP (stock_espejo) - es la clave para enlazar stock y precio público
};

export const products: Product[] = [
  // ==========================================
  // CATEGORÍA: LAVAMANOS (Ceramic Basin)
  // ==========================================
  {
    id: "lavamanos-9636m001",
    name: "Lavamanos Rectangular Negro 9636 M-001",
    category: "Lavamanos",
    description: "Lavamanos cerámico de sobreponer, acabado negro mate, línea rectangular minimalista.",
    images: ["/images/products/lavamanos-9636m001.jpg"],
    variants: [{ attribute: "medidas", value: "500 x 350 x 120 mm" }],
    prices: { minorista: null, mayorista: null },
    sku: "9636M001",
  },
  {
    id: "lavamanos-9636",
    name: "Lavamanos Rectangular Blanco 9636",
    category: "Lavamanos",
    description: "Lavamanos cerámico de sobreponer, acabado blanco, línea rectangular minimalista.",
    images: ["/images/products/lavamanos-9636.jpg"],
    variants: [{ attribute: "medidas", value: "500 x 350 x 120 mm" }],
    prices: { minorista: null, mayorista: null },
    sku: "9636",
  },
   {
    id: "lavamanos-4243", // id interno: no cambia, porque la URL /productos/lavamanos-4243 depende de él
    name: "Lavamanos Bajo Encimera Blanco 4243", // nombre visible para el cliente
    category: "Lavamanos", // categoría del filtro
    // Nota interna: en el ERP figura como "LAV BAJO TOPE BLANCO" ("bajo tope" = bajo encimera). NO mostrar al cliente.
    description:
      "Lavamanos bajo encimera, acabado blanco. Se instala por debajo de la encimera y deja la superficie libre y fácil de limpiar. Incluye rebosadero.", // texto visible, tomado del PDF
    images: ["/images/products/lavamanos-4243.jpg"], // foto principal
    variants: [{ attribute: "medidas", value: "605 x 390 x 190 mm" }], // equivale a 60,5 x 39 x 19 cm del PDF
    prices: { minorista: null, mayorista: null }, // el precio viene del ERP, no de este archivo
    sku: "4243", // código del ERP (coincide exacto con stock_espejo)
  },
  {
    id: "lavamanos-b191",
    name: "Lavamanos de Pedestal B-191",
    category: "Lavamanos",
    description: "Lavamanos cerámico de pedestal (columna), acabado blanco.",
    images: ["/images/products/lavamanos-b191.jpg"],
    variants: [{ attribute: "medidas", value: "420 x 420 x 830 mm" }],
    prices: { minorista: null, mayorista: null },
    sku: "B-191",
  },

  // ==========================================
  // CATEGORÍA: SANITARIOS (Ceramic Toilet)
  // ==========================================
  {
    id: "sanitario-sd1001",
    name: "Sanitario SD-1001",
    category: "Sanitarios",
    description: "Sanitario cerámico de una pieza, acabado blanco.",
    images: ["/images/products/sanitario-sd1001.jpg"],
    variants: [{ attribute: "medidas", value: "695 x 390 x 500 mm" }],
    prices: { minorista: null, mayorista: null },
    sku: "SD-1001",
  },
  {
    id: "sanitario-sd1001-mb",
    name: "Sanitario SD-1001 MB",
    category: "Sanitarios",
    description: "Sanitario cerámico de una pieza, acabado negro mate.",
    images: ["/images/products/sanitario-sd1001-mb.jpg"],
    variants: [{ attribute: "medidas", value: "695 x 390 x 500 mm" }],
    prices: { minorista: null, mayorista: null },
    sku: "SD-1001MB",
  },
  {
    // TODO: el ERP llama a este modelo "tanque alto" y el catálogo "una pieza";
    // verificar cuál es y corregir la descripción.
    id: "sanitario-717",
    name: "Sanitario 717",
    category: "Sanitarios",
    description: "Sanitario cerámico de una pieza, acabado blanco.",
    images: ["/images/products/sanitario-717.jpg"],
    variants: [{ attribute: "medidas", value: "660 x 420 x 665 mm" }],
    prices: { minorista: null, mayorista: null },
    sku: "717",
  },
  {
    // TODO: igual que el 717 (ERP "tanque alto" vs catálogo "una pieza").
    id: "sanitario-717-mb",
    name: "Sanitario 717 MB",
    category: "Sanitarios",
    description: "Sanitario cerámico de una pieza, acabado negro mate.",
    images: ["/images/products/sanitario-717-mb.jpg"],
    variants: [{ attribute: "medidas", value: "660 x 420 x 665 mm" }],
    prices: { minorista: null, mayorista: null },
    sku: "717-MB",
  },
  {
    id: "sanitario-168w",
    name: "Sanitario 168W",
    category: "Sanitarios",
    description: "Sanitario cerámico de una pieza, diseño compacto, acabado blanco.",
    images: ["/images/products/sanitario-168w.jpg"],
    variants: [{ attribute: "medidas", value: "680 x 340 x 465 mm" }],
    prices: { minorista: null, mayorista: null },
    sku: "168W",
  },

  // ==========================================
  // CATEGORÍA: DISPENSADORES DE JABÓN
  // ==========================================
  {
    id: "dispensador-jabon-manual-blanco",
    name: "Dispensador de jabón manual · blanco",
    category: "Dispensadores de jabón",
    description:
      "Dispensador de jabón manual de plástico, con depósito interno y recarga interna con apertura de llave.",
    images: ["/images/products/dispensador-jabon-manual-blanco.jpg"],
    variants: [
      { attribute: "accionamiento", value: "Manual" },
      { attribute: "material", value: "Plástico blanco" },
    ],
    prices: { minorista: null, mayorista: null },
    sku: "KW-7226WHITE",
  },
  {
    id: "dispensador-jabon-manual-acero",
    name: "Dispensador de jabón manual · acero antimanchas",
    category: "Dispensadores de jabón",
    description:
      "Dispensador de jabón manual de acero antimanchas inoxidable, con depósito interno y recarga superior con apertura de llave.",
    images: ["/images/products/dispensador-jabon-manual-acero.jpg"],
    variants: [
      { attribute: "accionamiento", value: "Manual" },
      { attribute: "material", value: "Acero antimanchas" },
    ],
    prices: { minorista: null, mayorista: null },
    sku: "KW-7217GUNGREY",
  },
  {
    id: "dispensador-jabon-automatico-blanco",
    name: "Dispensador de jabón automático · blanco",
    category: "Dispensadores de jabón",
    description:
      "Dispensador de jabón de plástico, eléctrico o a pilas (4 pilas AA). Dos velocidades de salida del jabón, control de distancia del sensor y recarga por apertura superior con llave.",
    images: ["/images/products/dispensador-jabon-automatico-blanco.jpg"],
    variants: [
      { attribute: "accionamiento", value: "Automático" },
      { attribute: "material", value: "Plástico blanco" },
    ],
    prices: { minorista: null, mayorista: null },
    sku: "KW-7206ABSWHITE",
  },
  {
    id: "dispensador-jabon-automatico-acero",
    name: "Dispensador de jabón automático · acero antimanchas",
    category: "Dispensadores de jabón",
    description:
      "Dispensador de jabón de acero antimanchas inoxidable, eléctrico o a pilas (4 pilas AA). Dos velocidades de salida del jabón, control de distancia del sensor y recarga por apertura superior con llave.",
    images: ["/images/products/dispensador-jabon-automatico-acero.jpg"],
    variants: [
      { attribute: "accionamiento", value: "Automático" },
      { attribute: "material", value: "Acero antimanchas" },
    ],
    prices: { minorista: null, mayorista: null },
    sku: "KW-7206GUNGREY",
  },

  // ==========================================
  // CATEGORÍA: DISPENSADORES DE PAPEL
  // ==========================================
  {
    id: "dispensador-papel-blanco",
    name: "Dispensador de papel blanco (papel rectangular)",
    category: "Dispensadores de papel",
    description: "Dispensador de papel manual de plástico, para recarga de papel rectangular.",
    images: ["/images/products/dispensador-papel-blanco.jpg"],
    variants: [
      { attribute: "accionamiento", value: "Manual" },
      { attribute: "material", value: "Plástico blanco" },
    ],
    prices: { minorista: null, mayorista: null },
    sku: "KW-7336WHITE",
  },
  {
    id: "dispensador-papel-manual-blanco",
    name: "Dispensador de papel manual blanco (rollo)",
    category: "Dispensadores de papel",
    description: "Dispensador de papel manual de plástico, para recarga de papel en rollo.",
    images: ["/images/products/dispensador-papel-manual-blanco.jpg"],
    variants: [
      { attribute: "accionamiento", value: "Manual" },
      { attribute: "material", value: "Plástico blanco" },
    ],
    prices: { minorista: null, mayorista: null },
    sku: "KW-7316WHITE",
  },
  {
    // TODO: la ficha del catálogo dice "acero antimanchas" en el título pero
    // "plástico mate" en la etiqueta de material; se omite el material hasta
    // confirmarlo.
    id: "dispensador-papel-manual-acero",
    name: "Dispensador de papel manual · acero antimanchas",
    category: "Dispensadores de papel",
    description: "Dispensador de papel manual para recarga de papel rectangular.",
    images: ["/images/products/dispensador-papel-manual-acero.jpg"],
    variants: [{ attribute: "accionamiento", value: "Manual" }],
    prices: { minorista: null, mayorista: null },
    sku: "KW-7370GUNGREY",
  },
  {
    id: "dispensador-papel-automatico-acero",
    name: "Dispensador automático de papel · acero antimanchas",
    category: "Dispensadores de papel",
    description:
      "Dispensador de papel eléctrico o a pilas (4 pilas D), para rollos de 20 × 21 cm. Control interno del largo del papel, botón de encendido/apagado y panel digital frontal.",
    images: ["/images/products/dispensador-papel-automatico-acero.jpg"],
    variants: [
      { attribute: "accionamiento", value: "Automático" },
      { attribute: "material", value: "Acero antimanchas" },
    ],
    prices: { minorista: null, mayorista: null },
    sku: "KW-7390GUNGREY",
  },

  // ==========================================
  // CATEGORÍA: SECADORES DE MANOS
  // ==========================================
  {
    id: "secador-manos-pequeno-blanco",
    name: "Secador de manos pequeño · blanco",
    category: "Secadores de manos",
    description:
      "Secador de manos eléctrico de 700 W (110 V), con opción de aire caliente o frío y control de distancia del sensor.",
    images: ["/images/products/secador-manos-pequeno-blanco.jpg"],
    variants: [
      { attribute: "potencia", value: "700 W (110 V)" },
      { attribute: "color", value: "Blanco" },
    ],
    prices: { minorista: null, mayorista: null },
    sku: "KW-1019WHITE",
  },
  {
    // TODO: el catálogo lo rotula "negro" pero el código es GUNGREY y el
    // material es acero antimanchas; se omite el color hasta confirmarlo.
    id: "secador-manos-mediano",
    name: "Secador de manos mediano",
    category: "Secadores de manos",
    description:
      "Secador de manos eléctrico de 1800 W (110 V), con opción de aire caliente o frío y control de distancia del sensor.",
    images: ["/images/products/secador-manos-mediano.jpg"],
    variants: [
      { attribute: "potencia", value: "1800 W (110 V)" },
      { attribute: "material", value: "Acero antimanchas" },
    ],
    prices: { minorista: null, mayorista: null },
    sku: "KW-1036GUNGREY",
  },
  {
    id: "secador-manos-grande-blanco",
    name: "Secador de manos grande · blanco",
    category: "Secadores de manos",
    description:
      "Secador de manos eléctrico de 1650 W (110 V, 60 Hz), con encendido/apagado, aire caliente o frío y potencia alta/baja. Incluye tanque para recoger el agua y ducto de limpieza.",
    images: ["/images/products/secador-manos-grande-blanco.jpg"],
    variants: [
      { attribute: "potencia", value: "1650 W (110 V)" },
      { attribute: "color", value: "Blanco" },
    ],
    prices: { minorista: null, mayorista: null },
    sku: "KW-1091PLUS",
  },
  {
    id: "secador-manos-grande-acero",
    name: "Secador de manos grande · acero antimanchas",
    category: "Secadores de manos",
    description:
      "Secador de manos eléctrico de 1650 W (110 V, 60 Hz), con encendido/apagado, aire caliente o frío y potencia alta/baja. Incluye tanque para recoger el agua y ducto de limpieza.",
    images: ["/images/products/secador-manos-grande-acero.jpg"],
    variants: [
      { attribute: "potencia", value: "1650 W (110 V)" },
      { attribute: "material", value: "Acero antimanchas" },
    ],
    prices: { minorista: null, mayorista: null },
    sku: "KW-1090GUNGREY",
  },

  // ==========================================
  // CATEGORÍA: ACCESORIOS
  // ==========================================
  {
    // TODO: el catálogo trae las medidas "75 × 110" y el mapeo marca la unidad
    // como dudosa (mm vs cm); se omiten hasta confirmarlas.
    id: "espejo-3-en-1",
    name: "Espejo 3 en 1",
    category: "Accesorios",
    description:
      "Espejo con luz LED que integra tres módulos: dispensador de jabón eléctrico o a pilas (4 pilas AA), secador de manos eléctrico con sensor y espacio interno para recarga de papel rectangular.",
    images: ["/images/products/espejo-3-en-1.jpg"],
    variants: [{ attribute: "funciones", value: "Jabón · secador · dispensador de papel" }],
    prices: { minorista: null, mayorista: null },
    sku: "KW-3005",
  },
  {
    id: "barra-apoyo-acero",
    name: "Barra de apoyo · acero antimanchas",
    category: "Accesorios",
    description: "Barra de seguridad de acero antimanchas inoxidable de 60 cm de largo.",
    images: ["/images/products/barra-apoyo-acero.jpg"],
    variants: [{ attribute: "medidas", value: "60 cm de largo" }],
    prices: { minorista: null, mayorista: null },
    sku: "KW-7501GUNGREY",
  },

  // ==========================================
  // CATEGORÍA: SAUNAS
  // (no están en el catálogo PDF: sin foto ni descripción)
  // ==========================================
  {
    // TODO: nombre provisional tomado del ERP; falta nombre comercial, foto,
    // descripción y confirmar la unidad de las medidas (¿cm?).
    id: "sauna-120x100x200",
    name: "Sauna 120×100×200 (vidrio 6 mm)",
    category: "Saunas",
    description: "",
    images: ["/images/products/placeholder.jpg"],
    variants: [
      { attribute: "medidas", value: "120 x 100 x 200" },
      { attribute: "vidrio", value: "6 mm" },
    ],
    prices: { minorista: null, mayorista: null },
    sku: "SN96129-1200",
  },
  {
    // TODO: igual que el sauna anterior (nombre provisional, foto, descripción
    // y unidad de las medidas).
    id: "sauna-135x110x210",
    name: "Sauna 135×110×210 (vidrio 8 mm)",
    category: "Saunas",
    description: "",
    images: ["/images/products/placeholder.jpg"],
    variants: [
      { attribute: "medidas", value: "135 x 110 x 210" },
      { attribute: "vidrio", value: "8 mm" },
    ],
    prices: { minorista: null, mayorista: null },
    sku: "SN96137-1350",
  },
];

export const categories = Array.from(new Set(products.map((p) => p.category)));
