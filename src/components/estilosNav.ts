// src/components/estilosNav.ts
//
// Clases de los enlaces de la navegación de la cabecera, para que se vean idénticos.
// Móvil: fila de 44 px con marca lateral. md: pestaña con línea inferior, igual
// que las pestañas que tenía el catálogo.

export function claseEnlaceNav(activo: boolean): string {
  return `flex min-h-11 items-center border-l-2 pl-3 text-sm transition-colors md:min-h-0 md:border-b-2 md:border-l-0 md:py-1 md:pl-0 ${
    activo
      ? "border-[#A8562E] font-medium text-[#232320]"
      : "border-transparent text-[#6B6862] hover:text-[#232320]"
  }`;
}
