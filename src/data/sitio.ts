// src/data/sitio.ts
//
// Datos generales del sitio (marca, contacto, redes) en UN solo archivo.
// Header, Footer y la portada leen de aquí; no se repiten en otros componentes.
//
// REGLA: si un campo vale null, NO se muestra (ni enlace muerto, ni "#", ni
// relleno). Para activarlo basta con poner el valor real aquí.

// Los campos que pueden faltar son string | null
type Sitio = {
  nombre: string;
  empresa: string;
  descripcion: string;
  ubicacion: string;
  envios: string;
  telefono: string;
  telefonoHref: string;
  correo: string;
  redes: {
    facebook: string | null;
    instagram: string | null;
    tiktok: string | null;
    whatsapp: string | null;
  };
  urlPrivacidad: string | null;
};

// wa.me solo acepta el número en dígitos (con código de país, sin "+" ni espacios).
// Es la MISMA variable de entorno que usa el carrito para los pedidos, así que el
// número se cambia en un solo lugar (.env.local). Si no está definida, no hay enlace.
const digitosWhatsapp = (process.env.NEXT_PUBLIC_ADVISOR_PHONE ?? "").replace(/\D/g, "");

export const sitio: Sitio = {
  // Nombre de la marca (cabecera, pie, alt del logo)
  nombre: "Maya Home",
  // Empresa propietaria (franja legal del pie: "© <año> Comercial Maya")
  empresa: "Comercial Maya",
  // Mismo texto que la descripción de metadata en layout.tsx (si cambia uno, cambiar
  // el otro); se usa en la portada y en la columna de marca del pie
  descripcion:
    "Catálogo de lavamanos, sanitarios, pisos de bambú, piedras flexibles y acabados para el hogar.",
  // Ciudad (columna de contacto del pie)
  ubicacion: "Ambato",
  // Cobertura de entregas (columna de contacto del pie)
  envios: "Envíos a todo Ecuador",
  // Teléfono tal como se muestra en pantalla
  telefono: "099 729 3914",
  // Mismo teléfono en formato tel: (internacional, sin espacios) para el enlace de llamada
  telefonoHref: "tel:+593997293914",
  // Correo de contacto (se enlaza con mailto:)
  correo: "marketingd@comercialmaya.com",
  redes: {
    // Página de Facebook
    facebook: "https://www.facebook.com/ComercialMaya",
    // Perfil de Instagram
    instagram: "https://www.instagram.com/comercialmaya",
    // Perfil de TikTok
    tiktok: "https://www.tiktok.com/@comercial.maya",
    // Chat de WhatsApp: se construye con NEXT_PUBLIC_ADVISOR_PHONE (no hay número copiado a mano)
    whatsapp: digitosWhatsapp ? `https://wa.me/${digitosWhatsapp}` : null,
  },
  // Página de política de privacidad: todavía no existe, por eso null (el enlace no se muestra)
  urlPrivacidad: null,
};
