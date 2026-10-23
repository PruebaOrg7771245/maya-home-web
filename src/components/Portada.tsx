// src/components/Portada.tsx
//
// Portada (hero) de la página de inicio: imagen a ancho completo, sin texto ni
// botón encima (el texto ya viene dentro de la imagen). Server component.
//
// Dirección de arte con <picture> + getImageProps de Next: el navegador elige
// UNA sola versión según el ancho (escritorio desde md = 768 px, móvil por
// debajo) y nunca descarga las dos. El contenedor reserva el alto con
// aspect-ratio (4:5 en móvil, 8:3 desde md): no hay saltos de diseño al cargar.
//
// Con una sola portada se dibuja fija (sin JS). Con 2 o más pasa a
// CarruselPortada (cliente), que agrega la flecha y el avance automático.

import { getImageProps } from "next/image";
import { PORTADAS, type Portada as DatosPortada } from "@/data/portada";
import CarruselPortada from "@/components/CarruselPortada";

// Tiene que coincidir con el breakpoint md de Tailwind (y con md:aspect-[8/3] de abajo)
const MEDIA_ESCRITORIO = "(min-width: 768px)";
// Tiene que estar en images.qualities de next.config.ts
const CALIDAD_PORTADA = 90;

function ImagenPortada({ portada, prioridad }: { portada: DatosPortada; prioridad: boolean }) {
  // priority = carga inmediata y fetchpriority alta (es lo primero que se ve);
  // las portadas siguientes del carrusel cargan diferidas cuando se muestran
  // quality 90 (no la 75 por defecto): la imagen lleva texto y logo, y a 75 la
  // recompresión de Next deja halos visibles en el logo
  const comunes = { alt: portada.alt, sizes: "100vw", priority: prioridad, quality: CALIDAD_PORTADA };
  const {
    props: { srcSet: srcSetEscritorio },
  } = getImageProps({ ...comunes, ...portada.desktop });
  const { props: propsMovil } = getImageProps({ ...comunes, ...portada.movil });

  return (
    <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#EFEDE7] md:aspect-[8/3]">
      <picture>
        <source media={MEDIA_ESCRITORIO} srcSet={srcSetEscritorio} sizes="100vw" />
        {/* El <img> lleva la versión móvil; en escritorio gana el <source> de arriba */}
        <img {...propsMovil} alt={portada.alt} className="absolute inset-0 h-full w-full object-cover" />
      </picture>
    </div>
  );
}

export default function Portada() {
  if (PORTADAS.length === 0) return null;

  const imagenes = PORTADAS.map((portada, i) => (
    <ImagenPortada key={portada.id} portada={portada} prioridad={i === 0} />
  ));

  // Una sola portada: estática, sin flecha, sin puntos, sin movimiento
  if (imagenes.length === 1) {
    return <section aria-label="Portada">{imagenes[0]}</section>;
  }

  return <CarruselPortada>{imagenes}</CarruselPortada>;
}
