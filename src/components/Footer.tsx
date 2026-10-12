// src/components/Footer.tsx
//
// Pie de página global. Es un server component (no necesita estado). Todo el
// contenido sale de src/data/sitio.ts y de las categorías del catálogo; si un
// dato de sitio.ts es null, esa parte simplemente no se dibuja.

import Link from "next/link";
import Image from "next/image";
import { sitio } from "@/data/sitio";
import { categories } from "@/data/products";
import { PESTANA_COMBOS, urlCatalogo } from "@/lib/catalogoUrl";
import {
  IconoFacebook,
  IconoInstagram,
  IconoTikTok,
  IconoUbicacion,
  IconoWhatsApp,
} from "@/components/IconosSitio";

// Títulos de columna: Archivo, pequeños, en el color de texto secundario
const tituloColumna = "font-[var(--font-heading)] text-sm font-semibold text-[#232320]";
// Enlaces de texto del pie: secundario → principal al pasar el cursor.
// El foco de teclado visible viene de la regla global :focus-visible (globals.css).
const enlaceTexto = "text-sm text-[#6B6862] transition-colors hover:text-[#232320]";
// Botón-icono de red social: círculo con borde de 1px, 44 px de área de toque (mínimo)
const botonRed =
  "flex h-11 w-11 items-center justify-center rounded-full border border-[#D8D4CC] text-[#232320] transition-colors hover:border-[#A8562E]";

export default function Footer() {
  const { redes } = sitio;

  // Redes con enlace real: las que valen null no se muestran
  const listaRedes = [
    { href: redes.facebook, etiqueta: `Facebook de ${sitio.nombre}`, Icono: IconoFacebook },
    { href: redes.instagram, etiqueta: `Instagram de ${sitio.nombre}`, Icono: IconoInstagram },
    { href: redes.tiktok, etiqueta: `TikTok de ${sitio.nombre}`, Icono: IconoTikTok },
    { href: redes.whatsapp, etiqueta: `WhatsApp de ${sitio.nombre}`, Icono: IconoWhatsApp },
  ].flatMap((red) => (red.href ? [{ ...red, href: red.href }] : []));

  return (
    <footer className="border-t border-[#D8D4CC] bg-white">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 py-12 sm:grid-cols-2 lg:grid-cols-4">
        {/* Marca y descripción */}
        <div>
          <Link href="/" className="inline-flex items-center gap-3">
            <Image
              src="/images/brand/logo-icon.png"
              alt=""
              width={36}
              height={34}
              className="shrink-0"
            />
            <span className="font-[var(--font-heading)] text-lg font-bold leading-none text-[#232320]">
              {sitio.nombre}
            </span>
            <span className="sr-only"> — ir al inicio</span>
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-[#6B6862]">{sitio.descripcion}</p>
        </div>

        {/* Catálogo por categoría (más la pestaña de combos) */}
        <nav aria-label="Catálogo por categoría">
          <h2 className={tituloColumna}>Catálogo</h2>
          <ul className="mt-4 space-y-3">
            {[...categories, PESTANA_COMBOS].map((categoria) => (
              <li key={categoria}>
                <Link href={urlCatalogo(categoria)} className={enlaceTexto}>
                  {categoria}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Contacto */}
        <div>
          <h2 className={tituloColumna}>Contacto</h2>
          <ul className="mt-4 space-y-3 text-sm text-[#6B6862]">
            <li className="flex items-center gap-2">
              <IconoUbicacion className="shrink-0 text-[#232320]" />
              <span>{sitio.ubicacion}</span>
            </li>
            <li>{sitio.envios}</li>
            <li>
              <a href={sitio.telefonoHref} className={enlaceTexto}>
                {sitio.telefono}
              </a>
            </li>
            <li>
              {/* break-all: el correo es largo y a 320 px no debe empujar el ancho de la página */}
              <a href={`mailto:${sitio.correo}`} className={`${enlaceTexto} break-all`}>
                {sitio.correo}
              </a>
            </li>
          </ul>
        </div>

        {/* Redes: solo iconos, con nombre accesible en aria-label */}
        {listaRedes.length > 0 && (
          <div>
            <h2 className={tituloColumna}>Síguenos</h2>
            <ul className="mt-4 flex flex-wrap gap-3">
              {listaRedes.map(({ href, etiqueta, Icono }) => (
                <li key={etiqueta}>
                  <a
                    href={href}
                    aria-label={etiqueta}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={botonRed}
                  >
                    <Icono />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Franja legal */}
      <div className="border-t border-[#D8D4CC]">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-6 py-4 text-xs text-[#6B6862]">
          <p>
            © {new Date().getFullYear()} {sitio.empresa}
          </p>
          {sitio.urlPrivacidad && (
            <Link href={sitio.urlPrivacidad} className="transition-colors hover:text-[#232320]">
              Política de privacidad
            </Link>
          )}
        </div>
      </div>
    </footer>
  );
}
