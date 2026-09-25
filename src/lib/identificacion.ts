// src/lib/identificacion.ts
//
// Validación LOCAL (sin red, sin API externa) de cédula y RUC ecuatorianos,
// usando los algoritmos de dígito verificador del Registro Civil / SRI.
// Confirma que el número tiene una estructura matemáticamente válida - NO
// confirma que esté realmente registrado o activo (eso solo lo sabría una
// consulta al SRI, que decidimos no hacer por ahora).
//
// Reglas aplicadas (decididas explícitamente, no asumidas):
// - NO se acepta "9999999999999" (Consumidor Final) como válido.
// - NO se valida el código de provincia (primeros 2 dígitos) - solo el
//   dígito verificador.
//
// Basado en la versión de ejemplo `validarIdentificacion.ts`, pero en vez
// de devolver solo true/false devuelve también el TIPO detectado y un
// mensaje, para que el formulario del carrito pueda mostrarle al cliente
// si lo que escribió es una cédula o un RUC (y de qué tipo).

export type TipoIdentificacion =
  | "cedula"
  | "ruc-natural" // persona natural (tercer dígito 0-5)
  | "ruc-sociedad" // sociedad privada (tercer dígito 9)
  | "ruc-publico"; // entidad pública (tercer dígito 6)

export interface ResultadoIdentificacion {
  valido: boolean;
  tipo: TipoIdentificacion | null; // null si ni siquiera tiene forma de cédula/RUC
  mensaje: string; // texto listo para mostrar en la UI
}

// Nombre legible de cada tipo, para la UI y para el mensaje de WhatsApp
export const NOMBRE_TIPO: Record<TipoIdentificacion, string> = {
  cedula: "Cédula",
  "ruc-natural": "RUC persona natural",
  "ruc-sociedad": "RUC sociedad privada",
  "ruc-publico": "RUC entidad pública",
};

// Deja solo los dígitos: el campo del formulario lo usa en cada tecla para
// que no se puedan escribir letras, espacios ni guiones
export function limpiarIdentificacion(valor: string): string {
  return valor.replace(/\D/g, "").slice(0, 13);
}

// Algoritmo módulo 10 (cédula). Recibe exactamente 10 dígitos.
function digitoCedulaValido(cedula: string): boolean {
  // Coeficientes fijos del algoritmo módulo 10
  const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2];
  let suma = 0;

  for (let i = 0; i < 9; i++) {
    let valor = Number(cedula[i]) * coeficientes[i];
    if (valor > 9) valor -= 9; // regla del algoritmo: si da 2 dígitos, se restan 9
    suma += valor;
  }

  const residuo = suma % 10;
  const esperado = residuo === 0 ? 0 : 10 - residuo;
  return esperado === Number(cedula[9]);
}

// Algoritmo módulo 11 (RUC de sociedades y entidades públicas). Si el
// resultado es 10 no existe dígito verificador posible -> inválido.
function digitoModulo11Valido(digitos: string, coeficientes: number[], verificador: string): boolean {
  let suma = 0;
  for (let i = 0; i < coeficientes.length; i++) {
    suma += Number(digitos[i]) * coeficientes[i];
  }
  const residuo = suma % 11;
  const esperado = residuo === 0 ? 0 : 11 - residuo;
  return esperado === Number(verificador);
}

// Función principal que usa el formulario del carrito: detecta
// automáticamente si el texto es una cédula (10 dígitos) o un RUC
// (13 dígitos) y aplica la validación correspondiente - por eso el
// formulario sigue teniendo UN SOLO campo, sin selector.
export function validarIdentificacion(valor: string): ResultadoIdentificacion {
  const numero = valor.replace(/\s/g, ""); // por si el usuario pegó espacios sin querer

  if (!/^\d+$/.test(numero)) {
    return { valido: false, tipo: null, mensaje: "Solo se permiten números." };
  }
  if (numero.length !== 10 && numero.length !== 13) {
    return {
      valido: false,
      tipo: null,
      mensaje: "La cédula tiene 10 dígitos y el RUC 13.",
    };
  }

  const tercerDigito = Number(numero[2]);

  // --- Cédula (10 dígitos) ---
  if (numero.length === 10) {
    // El tercer dígito de una cédula es 0-5; 6 y 9 son exclusivos de RUC
    if (tercerDigito > 5 || !digitoCedulaValido(numero)) {
      return { valido: false, tipo: "cedula", mensaje: "El número de cédula no es válido." };
    }
    return { valido: true, tipo: "cedula", mensaje: "Cédula válida." };
  }

  // --- RUC (13 dígitos) ---
  if (numero === "9999999999999") {
    return {
      valido: false,
      tipo: null,
      mensaje: "No se acepta el RUC de Consumidor Final.",
    };
  }

  // Persona natural: los primeros 10 dígitos son su cédula + establecimiento (001, 002...)
  if (tercerDigito <= 5) {
    const valido = digitoCedulaValido(numero.slice(0, 10)) && numero.slice(10) !== "000";
    return resultadoRuc("ruc-natural", valido);
  }

  // Sociedad privada: módulo 11 sobre 9 dígitos, verificador en la posición 10,
  // establecimiento en los últimos 3
  if (tercerDigito === 9) {
    const valido =
      digitoModulo11Valido(numero, [4, 3, 2, 7, 6, 5, 4, 3, 2], numero[9]) &&
      numero.slice(10) !== "000";
    return resultadoRuc("ruc-sociedad", valido);
  }

  // Entidad pública: módulo 11 sobre 8 dígitos, verificador en la posición 9,
  // establecimiento de 4 dígitos (0001, 0002...) en los últimos 4, que
  // siempre empieza en "0"
  if (tercerDigito === 6) {
    const valido =
      digitoModulo11Valido(numero, [3, 2, 7, 6, 5, 4, 3, 2], numero[8]) &&
      numero[9] === "0" &&
      numero.slice(9) !== "0000";
    return resultadoRuc("ruc-publico", valido);
  }

  // Tercer dígito 7 u 8: no corresponde a ningún tipo de RUC
  return { valido: false, tipo: null, mensaje: "El número de RUC no es válido." };
}

function resultadoRuc(tipo: TipoIdentificacion, valido: boolean): ResultadoIdentificacion {
  return valido
    ? { valido: true, tipo, mensaje: `${NOMBRE_TIPO[tipo]} válido.` }
    : { valido: false, tipo, mensaje: `El número de ${NOMBRE_TIPO[tipo]} no es válido.` };
}
