// src/lib/telefono.ts
//
// Validación local del celular / WhatsApp del cliente. Hoy los clientes son
// de Ecuador, pero el sitio podría escalar a otros países, así que se
// aceptan dos formas:
//
// - Formato local de Ecuador: "09" + 8 dígitos (10 en total), ej. 0987654321.
// - Formato internacional: "+" (o "00") + código de país + número, ej.
//   +593987654321 o +57 300 123 4567. Si el código es 593 (Ecuador) se
//   exige que sea un celular (9 + 8 dígitos); para otros países solo se
//   valida el largo general de la norma E.164 (8 a 15 dígitos en total),
//   sin reglas por país.
//
// También se acepta "593..." sin el "+", porque es común copiarlo así.
// Cualquier otro número sin prefijo se rechaza: sin código de país no hay
// forma de saber a qué país pertenece.

export interface ResultadoTelefono {
  valido: boolean;
  // Número normalizado en formato internacional (+593987654321), listo para
  // el mensaje de WhatsApp. null si no es válido.
  normalizado: string | null;
  mensaje: string; // texto de error listo para mostrar en la UI ("" si es válido)
}

// Mientras se escribe se permiten dígitos, espacios, guiones y paréntesis
// (para que el cliente pueda escribirlo como le resulte natural) y un "+"
// solo al inicio. Todo lo demás se descarta.
export function limpiarTelefono(valor: string): string {
  const permitido = valor.replace(/[^\d+\s()-]/g, "");
  const conMas = permitido.trimStart().startsWith("+");
  return ((conMas ? "+" : "") + permitido.replace(/\+/g, "")).slice(0, 20);
}

const CELULAR_ECUADOR = /^9\d{8}$/; // sin el 0 inicial ni el 593

function validarEcuador(nacional: string): ResultadoTelefono {
  return CELULAR_ECUADOR.test(nacional)
    ? { valido: true, normalizado: `+593${nacional}`, mensaje: "" }
    : {
        valido: false,
        normalizado: null,
        mensaje: "Escribe el número sin +593, debe empezar con 09 (ej: 0991234567)",
      };
}

export function validarTelefono(valor: string): ResultadoTelefono {
  const limpio = valor.trim().replace(/[\s()-]/g, "");

  // Formato internacional: +XXX... o 00XXX...
  const internacional = limpio.match(/^(?:\+|00)(\d+)$/);
  if (internacional) {
    const digitos = internacional[1];
    if (digitos.startsWith("593")) return validarEcuador(digitos.slice(3));
    // E.164: el código de país nunca empieza con 0, y el total va de 8 a 15 dígitos
    if (/^[1-9]\d{7,14}$/.test(digitos)) {
      return { valido: true, normalizado: `+${digitos}`, mensaje: "" };
    }
    return {
      valido: false,
      normalizado: null,
      mensaje: "El número internacional debe tener entre 8 y 15 dígitos, incluido el código de país.",
    };
  }

  if (!/^\d+$/.test(limpio)) {
    return { valido: false, normalizado: null, mensaje: "Solo se permiten números." };
  }

  // Formato local de Ecuador: 09XXXXXXXX
  if (limpio.startsWith("0")) return validarEcuador(limpio.slice(1));

  // 593 sin el "+"
  if (limpio.startsWith("593")) return validarEcuador(limpio.slice(3));

  return {
    valido: false,
    normalizado: null,
    mensaje:
      "Si el número no es ecuatoriano empiece + y el código de país.",
  };
}
