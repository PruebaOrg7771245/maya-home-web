// src/components/CategoryFilter.tsx
//
// Muestra las categorías como pestañas horizontales clickeables.
// No maneja el estado internamente - recibe la categoría activa y una función
// para cambiarla, así el componente padre (page.tsx) controla el filtrado real.

type CategoryFilterProps = {
  categories: string[]; // lista de categorías disponibles, ej: ["Porcelanatos", "Pisos SPC"]
  active: string; // la categoría actualmente seleccionada
  onChange: (category: string) => void; // función que se llama cuando el usuario elige otra categoría
};

export default function CategoryFilter({
  categories,
  active,
  onChange,
}: CategoryFilterProps) {
  // Agregamos "Todos" al inicio de la lista para poder ver el catálogo completo
  const allOptions = ["Todos", ...categories];

  return (
    // Con 8 pestañas (nombres largos como "Dispensadores de jabón") no caben en
    // un celular: la fila se desplaza horizontalmente. "-mx-6 px-6" hace que el
    // desplazamiento llegue hasta el borde de la pantalla (en vez de cortarse
    // dentro del margen de la página), lo que deja ver que hay más pestañas.
    <div
      role="group"
      aria-label="Filtrar por categoría"
      className="-mx-6 flex gap-6 overflow-x-auto border-b border-[#D8D4CC] px-6 pb-0"
    >
      {allOptions.map((category) => {
        const isActive = category === active; // comparamos si esta es la pestaña seleccionada

        return (
          <button
            key={category} // key única requerida por React al renderizar listas
            type="button"
            aria-pressed={isActive} // lectores de pantalla: cuál categoría está seleccionada
            onClick={(e) => {
              onChange(category); // avisa al padre qué categoría se eligió
              // Si la pestaña quedó cortada en el borde, la traemos a la vista.
              // block "nearest" evita mover la página en vertical; sin animación
              // si la persona pidió reducir el movimiento.
              const reducirMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
              e.currentTarget.scrollIntoView({
                inline: "nearest",
                block: "nearest",
                behavior: reducirMovimiento ? "auto" : "smooth",
              });
            }}
            className={`
              shrink-0 whitespace-nowrap border-b-2 pb-3 pt-2 text-sm font-medium transition-colors
              focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#A8562E]
              ${
                isActive
                  ? "border-[#A8562E] text-[#232320]" // estilo cuando está activa: línea inferior color acento
                  : "border-transparent text-[#6B6862] hover:text-[#232320]" // estilo inactivo
              }
            `}
          >
            {category}
          </button>
        );
      })}
    </div>
  );
}
