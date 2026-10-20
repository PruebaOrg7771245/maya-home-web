// src/lib/origenCatalogo.ts
//
// Recuerda desde qué URL del catálogo (con su ?categoria= y ?q=) se abrió una
// ficha, para que "← Volver al catálogo" regrese al MISMO filtro y no a
// /catalogo a secas. Vive solo en la memoria de la página (una variable del
// módulo): no se guarda en el navegador ni se envía a ningún sitio. Una carga
// directa, una recarga o una pestaña nueva empiezan sin origen, y entonces el
// enlace usa su destino por defecto.

export type OrigenCatalogo = {
  url: string; // URL del catálogo de la que se salió, con filtro y búsqueda
  destino: string; // ruta de la ficha que se abrió (/productos/x o /combos/x)
};

let origen: OrigenCatalogo | null = null;

export function guardarOrigen(nuevo: OrigenCatalogo): void {
  origen = nuevo;
}

export function leerOrigen(): OrigenCatalogo | null {
  return origen;
}

// Lógica pura: ¿"volver" debe hacer "atrás" del historial? Solo si la ficha
// actual es la que se abrió desde el catálogo (si la persona pasó a otra ficha
// por otro camino, no hay un "atrás" que lleve al catálogo).
export function debeVolverAtras(origen: OrigenCatalogo | null, rutaActual: string): boolean {
  return origen !== null && origen.destino === rutaActual;
}
