// src/lib/busqueda.ts
//
// Lógica PURA del buscador del catálogo (sin React, sin red, sin alias "@/"):
// se usa en el navegador sobre los productos y combos ya cargados, y se prueba
// con scripts/test-busqueda.ts. Lo que escribe la persona nunca sale de aquí:
// no se guarda ni se envía a ningún sitio (solo viaja en la URL, ?q=).
//
// Reglas:
// - No distingue mayúsculas ni tildes ("Sanitário" = "sanitario").
// - Varias palabras: TODAS deben aparecer (en cualquier orden).
// - Una palabra coincide si está contenida en el texto ("sanit" encuentra
//   "sanitario"). Una palabra en plural también prueba su singular
//   ("sanitarios" encuentra "Sanitario SD-1001").
// - Sinónimos de uso común (ver SINONIMOS).

// Palabras que la gente usa como sinónimo de un término del catálogo.
// Clave y valores sin tildes ni mayúsculas.
const SINONIMOS: Record<string, string[]> = {
  lavabo: ["lavamanos"],
};

// Largo máximo de la consulta (campo y URL): evita consultas absurdas
export const LARGO_MAXIMO_CONSULTA = 80;

// Minúsculas y sin tildes (NFD separa la letra de su tilde y luego se quita la
// tilde). Efecto secundario aceptado: "ñ" también pasa a "n" ("baño" = "bano").
export function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

// Una palabra de la consulta con sus alternativas: basta que coincida UNA de ellas
export type GrupoBusqueda = string[];

// Convierte lo escrito en grupos de alternativas, una por palabra.
// Devuelve [] si no hay nada que buscar (vacío o solo espacios).
export function prepararConsulta(consulta: string): GrupoBusqueda[] {
  return normalizar(consulta)
    .split(/\s+/)
    .filter(Boolean)
    .map((palabra) => {
      const singular = palabra.length > 3 && palabra.endsWith("s") ? palabra.slice(0, -1) : null;
      const alternativas = [palabra];
      if (singular) alternativas.push(singular);
      for (const base of alternativas.slice()) {
        alternativas.push(...(SINONIMOS[base] ?? []));
      }
      return alternativas;
    });
}

// ¿El texto (ya normalizado) cumple TODAS las palabras de la consulta?
// Sin palabras no hay filtro: todo coincide.
export function coincide(textoNormalizado: string, grupos: GrupoBusqueda[]): boolean {
  return grupos.every((alternativas) =>
    alternativas.some((alternativa) => textoNormalizado.includes(alternativa))
  );
}

// Texto buscable de un producto: nombre, categoría, descripción y sku
export function textoBusquedaProducto(producto: {
  name: string;
  category: string;
  description: string;
  sku?: string;
}): string {
  return normalizar([producto.name, producto.category, producto.description, producto.sku ?? ""].join(" "));
}

// Texto buscable de una familia de combos: su nombre y el nombre y la etiqueta
// de cada pieza (lavamanos y muebles). Incluye la palabra "combo".
export function textoBusquedaCombo(familia: {
  nombre: string;
  lavamanos: { nombre: string; etiqueta: string }[];
  muebles: { nombre: string; etiqueta: string }[];
}): string {
  const piezas = [...familia.lavamanos, ...familia.muebles].map((p) => `${p.nombre} ${p.etiqueta}`);
  return normalizar(["combo", familia.nombre, ...piezas].join(" "));
}
