// src/data/portada.ts
//
// Imágenes de la portada (hero) de la página de inicio. Cada portada es UNA
// imagen con dos versiones: "desktop" (desde el breakpoint md, 768 px) y
// "movil" (por debajo). El texto ya viene dentro de la imagen: no se dibuja
// nada encima. width/height son los px reales del archivo (reservan el espacio).
//
// Con una sola portada se muestra fija; con 2 o más aparece el botón
// "Siguiente imagen" y el avance automático (ver ADR-31).

export type VersionPortada = {
  src: string; // ruta en public/
  width: number;
  height: number;
};

export type Portada = {
  id: string;
  desktop: VersionPortada; // 8:3
  movil: VersionPortada; // 4:5
  alt: string;
};

export const PORTADAS: Portada[] = [
  {
    id: "portada-1",
    desktop: { src: "/images/portada/portada-1-desktop.webp", width: 1920, height: 720 },
    movil: { src: "/images/portada/portada-1-movil.webp", width: 800, height: 1000 },
    alt: "Maya Home: todo para tu hogar, a un clic",
  },
];
