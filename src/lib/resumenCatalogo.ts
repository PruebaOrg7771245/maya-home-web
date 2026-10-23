// src/lib/resumenCatalogo.ts
//
// Lógica PURA del catálogo resumido de la página de inicio (sin React ni red;
// se prueba con scripts/test-resumen.ts). Regla (ADR-31), por categoría:
//   - se saltan los productos sin precio (no se pueden vender, ADR-13);
//   - los disponibles van primero y los agotados después, cada grupo en el
//     orden normal del catálogo (products.ts);
//   - como máximo POR_CATEGORIA; una categoría sin ninguno vendible no sale.
// Los combos van en su propia fila (combosResumen, ADR-32), con la misma regla.

// Productos (o combos) por fila en el resumen
export const POR_CATEGORIA = 4;

// Lo único que se lee del producto y del stock (tipos estructurales)
type ProductoResumen = { id: string; category: string };
type StockResumen = { status: string; precio: number | null };

export type SeccionResumen<P> = {
  categoria: string;
  productos: P[];
};

export function seccionesResumen<P extends ProductoResumen>(
  productos: P[],
  stockPorId: Record<string, StockResumen | undefined>
): SeccionResumen<P>[] {
  // Una sola pasada: el Map conserva el orden en que aparece cada categoría
  // (orden del catálogo) y separa disponibles de agotados sin volver a filtrar.
  const grupos = new Map<string, { disponibles: P[]; agotados: P[] }>();
  for (const p of productos) {
    let grupo = grupos.get(p.category);
    if (!grupo) {
      grupo = { disponibles: [], agotados: [] };
      grupos.set(p.category, grupo);
    }
    const stock = stockPorId[p.id];
    if (!stock || stock.precio === null) continue; // sin precio: no se vende
    (stock.status === "out_of_stock" ? grupo.agotados : grupo.disponibles).push(p);
  }

  const secciones: SeccionResumen<P>[] = [];
  for (const [categoria, { disponibles, agotados }] of grupos) {
    const elegidos = [...disponibles, ...agotados].slice(0, POR_CATEGORIA);
    if (elegidos.length > 0) secciones.push({ categoria, productos: elegidos });
  }
  return secciones;
}

// Lo único que se lee de cada familia de combos (ver tarjetaFamilia en lib/combos.ts)
type ComboResumen = { desde: number | null; disponible: boolean };

// Fila de combos: se omiten las familias sin precio calculable (ninguna combinación
// tiene sus dos piezas con precio), las disponibles van antes que las agotadas (orden
// estable de data/combos.ts) y como máximo POR_CATEGORIA. Vacía = la fila no sale.
export function combosResumen<C extends ComboResumen>(combos: C[]): C[] {
  const disponibles: C[] = [];
  const agotados: C[] = [];
  for (const c of combos) {
    if (c.desde === null) continue; // sin precio: no se vende
    (c.disponible ? disponibles : agotados).push(c);
  }
  return [...disponibles, ...agotados].slice(0, POR_CATEGORIA);
}
