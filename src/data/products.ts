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
//
// Cómo añadir datos a la ficha (/productos/[id]) - cada bloque se muestra SOLO si tiene datos:
// - Descripción: el campo "description" ("" = sin bloque).
// - Especificaciones: la tabla junta "medidas" (de variants), los campos opcionales
//   "especificaciones" y las demás variants.
// - Fotos: el arreglo "images" (la primera es la principal; con más de una salen miniaturas).

// Una variante o dato propio del producto (ej. { attribute: "medidas", value: "500 x 350 x 120 mm" }).
// En la ficha del producto (/productos/[id]) se muestra como una fila de la tabla
// "Especificaciones": la de attribute "medidas" va PRIMERA con la etiqueta "Medidas";
// las demás (material, accionamiento, potencia, color, funciones, vidrio...) llevan como
// etiqueta el attribute con la primera letra en mayúscula. Ver src/lib/fichaProducto.ts.
export type ProductVariant = {
  attribute: string;
  value: string;
};

export type ProductPrices = {
  minorista: number | null;
  mayorista: number | null;
};

// Una fila de la tabla "Especificaciones" de la ficha, escrita tal como se quiere ver.
export type ProductSpec = {
  etiqueta: string; // nombre del dato, ej. "Garantía"
  valor: string; // su valor, ej. "12 meses"
};

export type Product = {
  id: string;
  name: string;
  category: string;
  subcategory?: string;
  // Texto del bloque "Descripción" de la ficha. Con "" el bloque no se muestra.
  description: string;
  // Fotos del producto. La PRIMERA es la principal (tarjeta del catálogo y ficha); si hay más
  // de una, la ficha muestra miniaturas debajo de la foto principal. Con [] se usa el placeholder.
  // Para añadir fotos: copiar el archivo a public/images/products/ y agregar su ruta al arreglo.
  images: string[];
  // Datos del producto que hoy ya existen. El que tenga attribute "medidas" es la fila "Medidas"
  // de la ficha (no se migró a especificaciones; siguen aquí).
  variants: ProductVariant[];
  prices: ProductPrices;
  brand?: string;
  sku?: string; // código del producto en el ERP (stock_espejo) - es la clave para enlazar stock y precio público
  // OPCIONAL. Filas EXTRA de la tabla "Especificaciones" de la ficha (garantía, instalación,
  // dimensiones del empaque, etc.). Solo datos confirmados: no se escribe nada que no esté
  // en el catálogo o el ERP. Se muestran después de "Medidas" y antes de las demás variants;
  // si una etiqueta coincide con la de una variante (sin importar mayúsculas ni tildes) gana
  // la de aquí. Para las medidas NO usar este campo: van en variants (attribute "medidas").
  // Si un producto no la tiene, simplemente no se agregan filas. Ejemplo:
  //   especificaciones: [{ etiqueta: "Garantía", valor: "12 meses" }],
  especificaciones?: ProductSpec[];
  // OPCIONAL. Lista del bloque "Características" de la ficha (una frase por elemento).
  // Solo datos confirmados. Si no existe o está vacía, el bloque no se muestra.
  caracteristicas?: string[];
  // OPCIONAL. Imágenes anchas del bloque "Detalles del producto" (collage de vistas,
  // infografía...). Se muestran una bajo otra, a ancho completo y sin recortar. Aparte de
  // src y alt llevan width y height (px del archivo) para reservar el espacio y evitar saltos.
  // Si no existe o está vacío, el bloque no se muestra.
  detalles?: ProductDetalle[];
};

export type ProductDetalle = {
  src: string; // ruta en public/, ej. "/images/products/x-2.jpeg"
  alt: string; // descripción breve de lo que muestra la imagen
  width: number; // ancho real del archivo en px
  height: number; // alto real del archivo en px
};

export const products: Product[] = [
  // ==========================================
  // CATEGORÍA: LAVAMANOS (Ceramic Basin)
  // ==========================================
  {
    id: "lavamanos-9636m001",
    name: "Lavamanos Rectangular Negro 9636 M-001",
    category: "Lavamanos",
    description:
      "Lavabo de cerámica tipo vessel, rectangular, para instalar sobre mesón.",
    images: ["/images/products/lavamanos-9636m001.jpg"],
    caracteristicas: [
      "Lavabo de cerámica tipo vessel, de instalación sobre mesón",
      "Modelo rectangular",
      "Se recomienda desagüe con rebosadero",
      "Se combina con grifería alta",
    ],
    especificaciones: [
      { etiqueta: "Medidas", valor: "50 x 35 x 12 cm" },
      { etiqueta: "Material", valor: "Cerámica" },
      { etiqueta: "Instalación", valor: "Sobre mesón" },
      { etiqueta: "Color", valor: "Negro" },
    ],
    variants: [{ attribute: "medidas", value: "500 x 350 x 120 mm" }],
    prices: { minorista: null, mayorista: null },
    sku: "9636M001",
  },
  {
    id: "lavamanos-9636",
    name: "Lavamanos Rectangular Blanco 9636",
    category: "Lavamanos",
    description:
      "Lavabo de cerámica tipo vessel, rectangular, para instalar sobre mesón.",
    images: ["/images/products/lavamanos-9636.jpg"],
    caracteristicas: [
      "Lavabo de cerámica tipo vessel, de instalación sobre mesón",
      "Modelo rectangular",
      "Se recomienda desagüe con rebosadero",
      "Se combina con grifería alta",
    ],
    especificaciones: [
      { etiqueta: "Medidas", valor: "50 x 35 x 12 cm" },
      { etiqueta: "Material", valor: "Cerámica" },
      { etiqueta: "Instalación", valor: "Sobre mesón" },
      { etiqueta: "Color", valor: "Blanco" },
    ],
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
      "Lavabo de cerámica rectangular para instalar incrustado bajo mesón.", // texto visible, tomado del PDF
    images: ["/images/products/lavamanos-4243.jpg"], // foto principal
    caracteristicas: [
      "Lavabo de cerámica de instalación incrustada bajo mesón",
      "Modelo rectangular",
      "Se recomienda desagüe con rebosadero",
      "Se combina con grifería baja",
    ],
    especificaciones: [
      { etiqueta: "Medidas", valor: "60,5 x 39 x 19 cm" },
      { etiqueta: "Material", valor: "Cerámica" },
      { etiqueta: "Instalación", valor: "Incrustada bajo mesón" },
      { etiqueta: "Color", valor: "Blanco" },
    ],
    variants: [{ attribute: "medidas", value: "605 x 390 x 190 mm" }], // equivale a 60,5 x 39 x 19 cm del PDF
    prices: { minorista: null, mayorista: null }, // el precio viene del ERP, no de este archivo
    sku: "4243", // código del ERP (coincide exacto con stock_espejo)
  },
  {
    id: "lavamanos-b191",
    name: "Lavamanos de Pedestal B-191",
    category: "Lavamanos",
    description:
      "Lavabo de cerámica con pedestal, de cuerpo completo e instalación al piso.",
    images: ["/images/products/lavamanos-b191.jpg"],
    caracteristicas: [
      "Lavabo de cerámica de cuerpo completo (pedestal), de instalación al piso",
      "Desagüe normal a la pared",
      "Se recomienda con grifería alta o baja",
      "Se combina con desagüe con rebosadero",
    ],
    especificaciones: [
      { etiqueta: "Medidas", valor: "42 x 42 x 83 cm" },
      { etiqueta: "Material", valor: "Cerámica" },
      { etiqueta: "Instalación", valor: "Al piso" },
      { etiqueta: "Color", valor: "Blanco" },
    ],
    variants: [{ attribute: "medidas", value: "420 x 420 x 830 mm" }],
    prices: { minorista: null, mayorista: null },
    sku: "B-191",
  },

  // ==========================================
  // CATEGORÍA: SANITARIOS (Ceramic Toilet)
  // ==========================================
  {
    id: "sanitario-sd1001",
    name: "Sanitario SD-1001 con bidet · blanco",
    category: "Sanitarios",
    description:
      "Sanitario de cerámica de lujo con bidet de doble chorro, asiento hidráulico y doble flujo de agua.",
    images: ["/images/products/sanitario-sd1001.jpg"],
    caracteristicas: [
      "Sanitario de cerámica de lujo, totalmente estético, que facilita la limpieza",
      "Conexión 1/2 por la parte posterior",
      "Asiento hidráulico que impide el golpe fuerte de cierre",
      "Descarga completa al costado izquierdo y medio tanque a la base",
      "Viene con conexión de bidet de doble chorro, que se controla con un botón al costado derecho",
      "Doble flujo de agua para mejor evacuación",
      "Viene con anillo de cera",
    ],
    especificaciones: [
      { etiqueta: "Material", valor: "Cerámica" },
      { etiqueta: "Color", valor: "Blanco" },
    ],
    variants: [{ attribute: "medidas", value: "695 x 390 x 500 mm" }],
    prices: { minorista: null, mayorista: null },
    sku: "SD-1001",
  },
  {
    id: "sanitario-sd1001-mb",
    name: "Sanitario SD-1001 con bidet · negro mate",
    category: "Sanitarios",
    description:
      "Sanitario de cerámica de lujo con bidet de doble chorro, asiento hidráulico y doble flujo de agua.",
    images: ["/images/products/sanitario-sd1001-mb.jpg"],
    caracteristicas: [
      "Sanitario de cerámica de lujo, totalmente estético, que facilita la limpieza",
      "Conexión 1/2 por la parte posterior",
      "Asiento hidráulico que impide el golpe fuerte de cierre",
      "Descarga completa al costado izquierdo y medio tanque a la base",
      "Viene con conexión de bidet de doble chorro, que se controla con un botón al costado derecho",
      "Doble flujo de agua para mejor evacuación",
      "Viene con anillo de cera",
    ],
    especificaciones: [
      { etiqueta: "Material", valor: "Cerámica" },
      { etiqueta: "Color", valor: "Negro" },
    ],
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
    description:
      "Sanitario de cerámica de lujo, de diseño estético que facilita la limpieza, con asiento hidráulico, descarga superior y doble flujo de agua.",
    images: ["/images/products/sanitario-717.jpg"],
    caracteristicas: [
      "Sanitario de cerámica de lujo, totalmente estético, que facilita la limpieza",
      "Conexión 1/2 por la parte posterior",
      "Asiento hidráulico que impide el golpe fuerte de cierre",
      "Descarga superior",
      "Doble flujo de agua para mejor evacuación",
      "Viene con anillo de cera",
    ],
    especificaciones: [
      { etiqueta: "Material", valor: "Cerámica" },
      { etiqueta: "Color", valor: "Blanco" },
    ],
    variants: [{ attribute: "medidas", value: "660 x 420 x 665 mm" }],
    prices: { minorista: null, mayorista: null },
    sku: "717",
  },
  {
    // TODO: igual que el 717 (ERP "tanque alto" vs catálogo "una pieza").
    id: "sanitario-717-mb",
    name: "Sanitario 717 MB",
    category: "Sanitarios",
    description:
      "Sanitario de cerámica de lujo, de diseño estético que facilita la limpieza, con asiento hidráulico, descarga superior y doble flujo de agua.",
    images: ["/images/products/sanitario-717-mb.jpg"],
    caracteristicas: [
      "Sanitario de cerámica de lujo, totalmente estético, que facilita la limpieza",
      "Conexión 1/2 por la parte posterior",
      "Asiento hidráulico que impide el golpe fuerte de cierre",
      "Descarga superior",
      "Doble flujo de agua para mejor evacuación",
      "Viene con anillo de cera",
    ],
    especificaciones: [
      { etiqueta: "Material", valor: "Cerámica" },
      { etiqueta: "Color", valor: "Negro" },
    ],
    variants: [{ attribute: "medidas", value: "660 x 420 x 665 mm" }],
    prices: { minorista: null, mayorista: null },
    sku: "717-MB",
  },
  {
    id: "sanitario-168w",
    name: "Sanitario 168W",
    category: "Sanitarios",
    description:
      "Sanitario de cerámica smart de lujo, de diseño estético que facilita la limpieza. Con conexión de bidet, descarga con sensor, cierre automático del asiento y control remoto.",
    images: [
      "/images/products/sanitario-168w.jpg",
      "/images/products/sanitario-168w-2.jpeg",
      "/images/products/sanitario-168w-3.jpeg",
    ],
    detalles: [
      {
        src: "/images/products/sanitario-168w-2.jpeg",
        alt: "Sanitario 168W: vistas del producto y detalles de sus funciones",
        width: 1536,
        height: 1024,
      },
      {
        src: "/images/products/sanitario-168w-3.jpeg",
        alt: "Sanitario 168W: infografía de sus funciones",
        width: 1227,
        height: 1282,
      },
    ],
    caracteristicas: [
      "Conexión 1/2 por la parte posterior",
      "Cierre automático del asiento con sensor hidráulico que evita el golpe fuerte",
      "Descarga con sensor",
      "Bidet controlado con el botón del costado izquierdo y con el control remoto",
      "Doble flujo de agua para mejor evacuación",
      "Aro del asiento con 3 niveles de temperatura",
      "Control remoto que maneja diferentes funciones",
      "Incluye anillo de cera",
    ],
    especificaciones: [
      { etiqueta: "Medidas", valor: "680 x 340 x 465 mm" },
      { etiqueta: "Material", valor: "Cerámica" },
      { etiqueta: "Color", valor: "Blanco" },
    ],
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
    caracteristicas: [
      "Dispensador de jabón manual de plástico",
      "Depósito interno",
      "Recarga interna con apertura de llave",
    ],
    especificaciones: [
      { etiqueta: "Material", valor: "Plástico" },
      { etiqueta: "Color", valor: "Blanco" },
    ],
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
      "Dispensador de jabón manual de acero inoxidable antivandálico, con depósito interno y recarga superior con apertura de llave.",
    images: ["/images/products/dispensador-jabon-manual-acero.jpg"],
    caracteristicas: [
      "Dispensador de jabón manual",
      "Acero inoxidable antivandálico",
      "Depósito interno",
      "Recarga superior con apertura de llave",
    ],
    especificaciones: [
      { etiqueta: "Color", valor: "Gris" },
      { etiqueta: "Material", valor: "Acero inoxidable antivandálico" },
    ],
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
      "Dispensador de jabón de plástico, eléctrico o a pilas, con 2 velocidades de caída del jabón y control de la distancia del sensor.",
    images: ["/images/products/dispensador-jabon-automatico-blanco.jpg"],
    caracteristicas: [
      "Dispensador de jabón de plástico, eléctrico o a pilas (4 pilas AA)",
      "2 velocidades para la caída del jabón",
      "Control para la distancia del sensor",
      "Recarga mediante apertura superior con llave",
    ],
    especificaciones: [
      { etiqueta: "Material", valor: "Plástico" },
      { etiqueta: "Color", valor: "Blanco" },
      { etiqueta: "Alimentación", valor: "Eléctrico o 4 pilas AA" },
    ],
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
      "Dispensador de jabón de acero inoxidable antivandálico, eléctrico o a pilas, con 2 velocidades de caída del jabón y control de la distancia del sensor.",
    images: ["/images/products/dispensador-jabon-automatico-acero.jpg"],
    caracteristicas: [
      "Dispensador de jabón eléctrico o a pilas (4 pilas AA)",
      "Acero inoxidable antivandálico",
      "2 velocidades para la caída del jabón",
      "Control para la distancia del sensor",
      "Recarga mediante apertura superior con llave",
    ],
    especificaciones: [
      { etiqueta: "Color", valor: "Gris" },
      { etiqueta: "Alimentación", valor: "Eléctrico o 4 pilas AA" },
      { etiqueta: "Material", valor: "Acero inoxidable antivandálico" },
    ],
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
    description:
      "Dispensador de papel manual de plástico para papel rectangular.",
    images: ["/images/products/dispensador-papel-blanco.jpg"],
    caracteristicas: [
      "Dispensador de papel manual de plástico",
      "Recarga de papel rectangular",
    ],
    especificaciones: [
      { etiqueta: "Material", valor: "Plástico" },
      { etiqueta: "Color", valor: "Blanco" },
    ],
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
    description:
      "Dispensador de papel manual de plástico para papel redondo.",
    images: ["/images/products/dispensador-papel-manual-blanco.jpg"],
    caracteristicas: [
      "Dispensador de papel manual de plástico",
      "Recarga de papel redondo",
    ],
    especificaciones: [
      { etiqueta: "Material", valor: "Plástico" },
      { etiqueta: "Color", valor: "Blanco" },
    ],
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
    description:
      "Dispensador de papel manual de acero inoxidable antivandálico para papel rectangular.",
    images: ["/images/products/dispensador-papel-manual-acero.jpg"],
    caracteristicas: [
      "Dispensador de papel manual",
      "Acero inoxidable antivandálico",
      "Recarga de papel rectangular",
    ],
    especificaciones: [
      { etiqueta: "Color", valor: "Gris" },
      { etiqueta: "Material", valor: "Acero inoxidable antivandálico" },
    ],
    variants: [{ attribute: "accionamiento", value: "Manual" }],
    prices: { minorista: null, mayorista: null },
    sku: "KW-7370GUNGREY",
  },
  {
    id: "dispensador-papel-automatico-acero",
    name: "Dispensador automático de papel · acero antimanchas",
    category: "Dispensadores de papel",
    description:
      "Dispensador de papel eléctrico o a pilas (4 pilas D), de acero inoxidable antivandálico, para papel redondo de 20x21 cm, con control del largo del papel y panel digital frontal.",
    images: ["/images/products/dispensador-papel-automatico-acero.jpg"],
    caracteristicas: [
      "Dispensador de papel eléctrico o a pilas (4 pilas D)",
      "Acero inoxidable antivandálico",
      "Recarga de papel redondo de 20x21 cm",
      "Control interno para el largo del papel",
      "Control de encendido y apagado",
      "Panel digital frontal para su uso",
    ],
    especificaciones: [
      { etiqueta: "Color", valor: "Gris" },
      { etiqueta: "Alimentación", valor: "Eléctrico o 4 pilas D" },
      { etiqueta: "Material", valor: "Acero inoxidable antivandálico" },
    ],
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
      "Secador de manos eléctrico de 110 V y 700 W, con opción de aire caliente o frío y control de la distancia del sensor.",
    images: ["/images/products/secador-manos-pequeno-blanco.jpg"],
    caracteristicas: [
      "Secador de manos eléctrico",
      "Opción de aire caliente o frío",
      "Control para el sensor de distancia",
    ],
    especificaciones: [
      { etiqueta: "Alimentación", valor: "110 V" },
      { etiqueta: "Potencia", valor: "700 W" },
      { etiqueta: "Color", valor: "Blanco" },
    ],
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
      "Secador de manos eléctrico de acero inoxidable antivandálico, de 110 V y 1800 W, con opción de aire caliente o frío y control de la distancia del sensor.",
    images: ["/images/products/secador-manos-mediano.jpg"],
    caracteristicas: [
      "Secador de manos eléctrico",
      "Acero inoxidable antivandálico",
      "Opción de aire caliente o frío",
      "Control para el sensor de distancia",
    ],
    especificaciones: [
      { etiqueta: "Alimentación", valor: "110 V" },
      { etiqueta: "Potencia", valor: "1800 W" },
      { etiqueta: "Color", valor: "Gris" },
      { etiqueta: "Material", valor: "Acero inoxidable antivandálico" },
    ],
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
      "Secador de manos eléctrico de 110 V y 1650 W, con aire caliente o frío, control de potencia alta o baja, tanque para descarga de agua y ducto de limpieza.",
    images: ["/images/products/secador-manos-grande-blanco.jpg"],
    caracteristicas: [
      "Secador de manos eléctrico",
      "Control de encendido y apagado",
      "Opción de aire caliente o frío",
      "Control de potencia alta o baja",
      "Tanque para descarga de agua",
      "Ducto de limpieza",
    ],
    especificaciones: [
      { etiqueta: "Alimentación", valor: "110 V" },
      { etiqueta: "Potencia", valor: "1650 W" },
      { etiqueta: "Frecuencia", valor: "60 Hz" },
      { etiqueta: "Color", valor: "Blanco" },
    ],
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
      "Secador de manos eléctrico de acero inoxidable antivandálico, de 110 V y 1650 W, con aire caliente o frío, control de potencia alta o baja, tanque para descarga de agua y ducto de limpieza.",
    images: ["/images/products/secador-manos-grande-acero.jpg"],
    caracteristicas: [
      "Secador de manos eléctrico",
      "Acero inoxidable antivandálico",
      "Control de encendido y apagado",
      "Opción de aire caliente o frío",
      "Control de potencia alta o baja",
      "Tanque para descarga de agua",
      "Ducto de limpieza",
    ],
    especificaciones: [
      { etiqueta: "Alimentación", valor: "110 V" },
      { etiqueta: "Potencia", valor: "1650 W" },
      { etiqueta: "Frecuencia", valor: "60 Hz" },
      { etiqueta: "Color", valor: "Gris" },
      { etiqueta: "Material", valor: "Acero inoxidable antivandálico" },
    ],
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
      "Espejo de 75 x 110 cm con luz LED, que integra secador de manos con sensor, dispensador de jabón y espacio para recarga de papel rectangular.",
    images: ["/images/products/espejo-3-en-1.jpg"],
    caracteristicas: [
      "Espejo con luz LED",
      "Espacio interno para recarga de papel rectangular",
      "Secador de manos eléctrico con sensor",
      "Dispensador de jabón eléctrico o a pilas (4 pilas AA)",
    ],
    especificaciones: [
      { etiqueta: "Medidas", valor: "75 x 110 cm" },
      { etiqueta: "Color", valor: "Blanco" },
    ],
    variants: [{ attribute: "funciones", value: "Jabón · secador · dispensador de papel" }],
    prices: { minorista: null, mayorista: null },
    sku: "KW-3005",
  },
  {
    id: "barra-apoyo-acero",
    name: "Barra de seguridad · acero antimanchas",
    category: "Accesorios",
    description:
      "Barra de seguridad de acero inoxidable de 60 cm.",
    images: ["/images/products/barra-apoyo-acero.jpg"],
    caracteristicas: [
      "Barra de seguridad de acero inoxidable de 60 cm",
    ],
    especificaciones: [
      { etiqueta: "Medidas", valor: "60 cm" },
      { etiqueta: "Material", valor: "Acero inoxidable" },
      { etiqueta: "Color", valor: "Gris" },
    ],
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
    name: "Sauna · 120 × 100 × 200 cm",
    category: "Saunas",
    description:
      "Sauna para 2 personas de cicuta canadiense, con calefactores de nano carbono de ultra baja EMF, temperatura regulable de 30 a 65 °C y temporizador de 5 a 60 minutos.",
    images: ["/images/products/sauna-120x100x200.jpg", "/images/products/sauna-120x100x200-2.jpg", "/images/products/sauna-120x100x200-3.jpg", "/images/products/sauna-120x100x200-4.jpg"],
    detalles: [
      { src: "/images/products/sauna-120x100x200-2.jpg", alt: "Sauna en perspectiva, con la puerta de vidrio y el interior iluminado en rojo", width: 1024, height: 1536 },
      { src: "/images/products/sauna-120x100x200-3.jpg", alt: "Interior del sauna visto de frente, con banco y paneles", width: 1024, height: 1536 },
      { src: "/images/products/sauna-120x100x200-4.jpg", alt: "Sauna visto desde arriba, con el interior abierto", width: 1536, height: 1024 },
    ],
    caracteristicas: [
      "Calefactores de nano carbono de ultra baja EMF",
      "Temperatura regulable de 30 a 65 °C",
      "Temporizador de 5 a 60 minutos",
      "Capacidad para 2 personas",
    ],
    especificaciones: [
      { etiqueta: "Medidas", valor: "1200 x 1000 x 2000 mm (ancho x fondo x alto)" },
      { etiqueta: "Capacidad", valor: "2 personas" },
      { etiqueta: "Potencia", valor: "1,9 kW" },
      { etiqueta: "Voltaje", valor: "220-240 V ~ 1N 50-60 Hz, enchufe de 10 A" },
      { etiqueta: "Material principal", valor: "Cicuta canadiense" },
      { etiqueta: "Fuente de calor", valor: "Nano carbono de ultra baja EMF" },
      { etiqueta: "Rango de temperatura", valor: "30 - 65 °C" },
      { etiqueta: "Temporizador", valor: "5 - 60 minutos" },
      { etiqueta: "Vidrio", valor: "6 mm" },
    ],
    variants: [
      { attribute: "medidas", value: "1200 x 1000 x 2000 mm (ancho x fondo x alto)" },
      { attribute: "vidrio", value: "6 mm" },
    ],
    prices: { minorista: null, mayorista: null },
    sku: "SN96129-1200",
  },
  {
    // TODO: igual que el sauna anterior (nombre provisional, foto, descripción
    // y unidad de las medidas).
    id: "sauna-135x110x210",
    name: "Sauna infrarrojo de espectro completo · 135 × 110 × 210 cm",
    category: "Saunas",
    description:
      "Sauna infrarrojo de espectro completo para 2 personas, con control por Wi-Fi, audio Bluetooth, iluminación ambiental y sistema táctil inteligente.",
    images: ["/images/products/sauna-135x110x210.jpg", "/images/products/sauna-135x110x210-2.jpg", "/images/products/sauna-135x110x210-3.jpg", "/images/products/sauna-135x110x210-4.jpg"],
    detalles: [
      { src: "/images/products/sauna-135x110x210-2.jpg", alt: "Sauna en perspectiva, con puerta de vidrio y esquinas curvas", width: 1536, height: 1024 },
      { src: "/images/products/sauna-135x110x210-3.jpg", alt: "Sauna en una sala con piso de madera y ventanales de estilo japonés", width: 1280, height: 677 },
      { src: "/images/products/sauna-135x110x210-4.jpg", alt: "Sauna en un baño con ventana hacia un bosque", width: 1280, height: 658 },
    ],
    caracteristicas: [
      "Sauna infrarrojo lejano de baja EMF",
      "Calefactores infrarrojos de espectro completo",
      "Sistema de control remoto por Wi-Fi",
      "Audio Bluetooth (altavoces de resonancia)",
      "Iluminación ambiental superior de luz cálida",
      "Iluminación ambiental de luz cálida en el asiento",
      "Portavasos fijo",
      "Generador de iones negativos",
      "Desinfección por ozono",
      "Respaldo ergonómico",
      "Sistema táctil inteligente",
    ],
    especificaciones: [
      { etiqueta: "Medidas", valor: "1350 x 1100 x 2100 mm" },
      { etiqueta: "Capacidad", valor: "2 personas (cómodamente)" },
      { etiqueta: "Potencia", valor: "2,4 kW" },
      { etiqueta: "Voltaje", valor: "230 V 1N~ 50-60 Hz / 240 V 2~ 50-60 Hz" },
      { etiqueta: "Voltaje personalizable", valor: "120 V 1N~ 50-60 Hz" },
      { etiqueta: "Madera interior", valor: "Abeto finlandés" },
      { etiqueta: "Madera exterior", valor: "Enchapado de roble de ingeniería" },
      { etiqueta: "Vidrio", valor: "Transparente, 8 mm" },
    ],
    variants: [
      { attribute: "medidas", value: "1350 x 1100 x 2100 mm" },
      { attribute: "vidrio", value: "8 mm" },
    ],
    prices: { minorista: null, mayorista: null },
    sku: "SN96137-1350",
  },

  // ==========================================
  // CATEGORÍA: PÉRGOLAS
  // (sin foto todavía: usan placeholder.jpg)
  // ==========================================
  {
    id: "pergola-3x4",
    name: "Pérgola de aluminio premium · 3 × 4 m",
    category: "Pérgolas",
    description:
      "Pérgola de aluminio premium de 3 x 4 m, con cubierta de policarbonato y malla anti insectos.",
    images: [], // sin foto todavía: se usa el placeholder
    caracteristicas: [
      "Estructura de aluminio",
      "Cubierta de policarbonato",
      "Malla anti insectos",
    ],
    especificaciones: [
      { etiqueta: "Medidas", valor: "3 x 4 m" },
      { etiqueta: "Estructura", valor: "Aluminio" },
      { etiqueta: "Cubierta", valor: "Policarbonato" },
    ],
    variants: [],
    prices: { minorista: null, mayorista: null },
    sku: "SHELTERTENT",
  },
  {
    id: "pergola-3x3",
    name: "Pérgola de aluminio premium · 3 × 3 m",
    category: "Pérgolas",
    description:
      "Pérgola de aluminio premium de 3 x 3 m, con cubierta de policarbonato y malla anti insectos.",
    images: [], // sin foto todavía: se usa el placeholder
    caracteristicas: [
      "Estructura de aluminio",
      "Cubierta de policarbonato",
      "Malla anti insectos",
    ],
    especificaciones: [
      { etiqueta: "Medidas", valor: "3 x 3 m" },
      { etiqueta: "Estructura", valor: "Aluminio" },
      { etiqueta: "Cubierta", valor: "Policarbonato" },
    ],
    variants: [],
    prices: { minorista: null, mayorista: null },
    sku: "YS1003",
  },

  // ==========================================
  // CATEGORÍA: LIMPIEZA
  // ==========================================
  {
    id: "barredora-manual",
    name: "Barredora manual",
    category: "Limpieza",
    description:
      "Barredora manual plegable de 98 cm de ancho, que funciona sin baterías, motor ni electricidad y recoge hojas, polvo fino y basura.",
    images: [], // sin foto todavía: se usa el placeholder
    caracteristicas: [
      "100% manual: no necesita baterías, motor ni electricidad",
      "Plegable: se guarda fácilmente y ocupa menos espacio",
      "Ancho de 98 cm para mayor cobertura en cada pasada",
      "Recoge residuos: ideal para hojas, polvo fino y basura",
    ],
    especificaciones: [
      { etiqueta: "Ancho", valor: "98 cm" },
      { etiqueta: "Funcionamiento", valor: "Manual, sin baterías ni electricidad" },
    ],
    variants: [],
    prices: { minorista: null, mayorista: null },
    sku: "YZ-S1",
  },
];

export const categories = Array.from(new Set(products.map((p) => p.category)));
