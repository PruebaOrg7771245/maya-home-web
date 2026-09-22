// src/data/products.ts
//
// Catálogo real de Maya Home, tomado del packing list del proveedor
// (Guangdong Yingjie Sanitary Ware Technology Co., Ltd - Invoice YJ20260429CO).
//
// IMPORTANTE - datos que NO vienen en el packing list y siguen pendientes:
// - Precios: el packing list es un documento de importación/logística,
//   no de venta al público - no trae precios. Quedan en null.
// - Nombres comerciales: el proveedor solo da un "ITEM NO." (código de
//   fábrica) y una descripción genérica en inglés - los nombres que
//   ves abajo son una versión legible que armé a partir de eso, no son
//   nombres comerciales oficiales todavía. Cuando el cliente defina cómo
//   quiere llamar a cada modelo, se actualiza aquí.
// - Fotos: son las miniaturas de baja resolución del packing list -
//   sirven para el boceto, pero conviene reemplazarlas por fotos de
//   producto reales en alta resolución antes de la versión final.

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
  sku?: string; // código de referencia del proveedor - útil para relacionar con inventario/stock más adelante
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
    images: ["/images/products/basin-9636m001.jpg"],
    variants: [{ attribute: "medidas", value: "500 x 350 x 120 mm" }],
    prices: { minorista: null, mayorista: null },
    sku: "9636 M-001",
  },
  {
    id: "lavamanos-9636",
    name: "Lavamanos Rectangular Blanco 9636",
    category: "Lavamanos",
    description: "Lavamanos cerámico de sobreponer, acabado blanco, línea rectangular minimalista.",
    images: ["/images/products/basin-9636.jpg"],
    variants: [{ attribute: "medidas", value: "500 x 350 x 120 mm" }],
    prices: { minorista: null, mayorista: null },
    sku: "9636",
  },
  {
    id: "lavamanos-4243",
    name: "Lavamanos Ovalado Blanco 4243",
    category: "Lavamanos",
    description: "Lavamanos cerámico de sobreponer, acabado blanco, línea ovalada.",
    images: ["/images/products/basin-4243.jpg"],
    variants: [{ attribute: "medidas", value: "605 x 390 x 190 mm" }],
    prices: { minorista: null, mayorista: null },
    sku: "4243",
  },
  {
    id: "lavamanos-b191",
    name: "Lavamanos de Pedestal B-191",
    category: "Lavamanos",
    description: "Lavamanos cerámico de pedestal (columna), acabado blanco.",
    images: ["/images/products/basin-b191.jpg"],
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
    images: ["/images/products/toilet-sd1001.jpg"],
    variants: [{ attribute: "medidas", value: "695 x 390 x 500 mm" }],
    prices: { minorista: null, mayorista: null },
    sku: "SD-1001",
  },
  {
    id: "sanitario-sd1001-mb",
    name: "Sanitario SD-1001 MB",
    category: "Sanitarios",
    description: "Sanitario cerámico de una pieza, acabado negro mate.",
    images: ["/images/products/toilet-sd1001mb.jpg"],
    variants: [{ attribute: "medidas", value: "695 x 390 x 500 mm" }],
    prices: { minorista: null, mayorista: null },
    sku: "SD-1001 MB",
  },
  {
    id: "sanitario-717",
    name: "Sanitario 717",
    category: "Sanitarios",
    description: "Sanitario cerámico de una pieza, acabado blanco.",
    images: ["/images/products/toilet-717.jpg"],
    variants: [{ attribute: "medidas", value: "660 x 420 x 665 mm" }],
    prices: { minorista: null, mayorista: null },
    sku: "717",
  },
  {
    id: "sanitario-717-mb",
    name: "Sanitario 717 MB",
    category: "Sanitarios",
    description: "Sanitario cerámico de una pieza, acabado negro mate.",
    images: ["/images/products/toilet-717mb.jpg"],
    variants: [{ attribute: "medidas", value: "660 x 420 x 665 mm" }],
    prices: { minorista: null, mayorista: null },
    sku: "717-MB",
  },
  {
    id: "sanitario-168w",
    name: "Sanitario 168W",
    category: "Sanitarios",
    description: "Sanitario cerámico de una pieza, diseño compacto, acabado blanco.",
    images: ["/images/products/toilet-168w.jpg"],
    variants: [{ attribute: "medidas", value: "680 x 340 x 465 mm" }],
    prices: { minorista: null, mayorista: null },
    sku: "168W",
  },
];

export const categories = Array.from(new Set(products.map((p) => p.category)));
