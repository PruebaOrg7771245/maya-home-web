// src/components/IconosSitio.tsx
//
// Iconos SVG inline del sitio (redes y ubicación), sin librerías. Todos usan
// el mismo estilo de trazo (línea de 1.8, sin relleno) que el icono del carrito
// y toman el color del texto con currentColor. Son decorativos (aria-hidden):
// el nombre accesible lo pone el enlace que los contiene (aria-label).

type IconoProps = { className?: string };

// Atributos comunes a todos los iconos
function Icono({ className, children }: IconoProps & { children: React.ReactNode }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      {children}
    </svg>
  );
}

export function IconoFacebook(props: IconoProps) {
  return (
    <Icono {...props}>
      <path d="M7 10v4h3v7h4v-7h3l1-4h-4V8a1 1 0 0 1 1-1h3V3h-3a5 5 0 0 0-5 5v2H7" />
    </Icono>
  );
}

export function IconoInstagram(props: IconoProps) {
  return (
    <Icono {...props}>
      <rect x="4" y="4" width="16" height="16" rx="4" />
      <circle cx="12" cy="12" r="3" />
      <path d="M16.5 7.5v.01" />
    </Icono>
  );
}

export function IconoTikTok(props: IconoProps) {
  return (
    <Icono {...props}>
      <path d="M21 7.917v4.034a9.948 9.948 0 0 1-5-1.951v4.5a6.5 6.5 0 1 1-8-6.326v4.326a2.5 2.5 0 1 0 4 2v-11.5h4.083a6.005 6.005 0 0 0 4.917 4.917z" />
    </Icono>
  );
}

export function IconoWhatsApp(props: IconoProps) {
  return (
    <Icono {...props}>
      <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
      <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1" />
    </Icono>
  );
}

export function IconoUbicacion(props: IconoProps) {
  return (
    <Icono {...props}>
      <circle cx="12" cy="11" r="3" />
      <path d="M17.657 16.657l-4.243 4.243a2 2 0 0 1-2.827 0l-4.244-4.243a8 8 0 1 1 11.314 0z" />
    </Icono>
  );
}
