// src/lib/combos.ts
//
// Lógica PURA de combos (sin red ni Supabase): genera las combinaciones, arma y
// valida sus ids y calcula precio/stock a partir de un mapa ya consultado.
// El mapa se obtiene fuera, con UNA sola llamada a getStockPorSkus() usando
// skusDeCombinaciones() (así este archivo se puede probar sin base de datos).

// Solo tipos de stock.ts (se borran al compilar: no arrastra Supabase)
import type { StockInfo } from "./stock.ts";
// Umbral y clasificación de existencia, compartidos con stock.ts
import { clasificarExistencia } from "./umbralStock.ts";
// Datos de las familias
import { FAMILIAS_COMBO, FOTOS_COMBINACION } from "../data/combos.ts";
import type { FamiliaCombo, PiezaCombo } from "../data/combos.ts";

// Una combinación concreta: una familia + un lavamanos + un mueble
export type Combinacion = {
  id: string; // ver idCombinacion()
  familia: FamiliaCombo;
  lavamanos: PiezaCombo;
  mueble: PiezaCombo;
};

// Estado del combo: los mismos de los productos, más "no_vendible" (sin precio)
export type ComboStatus = "in_stock" | "low_stock" | "out_of_stock" | "no_vendible";

export type ComboInfo = {
  precio: number | null; // suma con IVA; null si no se puede vender
  stock: number | null; // menor existencia de las dos piezas; null si no se vende
  status: ComboStatus;
};

// Separador del id; ningún sku ni slug de familia contiene "__"
const SEPARADOR_ID = "__";

// ¿El id "parece" de combo? (contiene el separador). Un producto normal nunca lo contiene
export function pareceIdCombo(id: string): boolean {
  return typeof id === "string" && id.includes(SEPARADOR_ID);
}

// Nombre para mostrar de un combo (las piezas concretas se listan aparte)
export function nombreCombinacion(familia: FamiliaCombo): string {
  return `Combo ${familia.nombre}`;
}

// Id estable y apto para URL: "<familia>__<sku lavamanos>__<sku mueble>"
export function idCombinacion(
  familia: FamiliaCombo,
  lavamanos: PiezaCombo,
  mueble: PiezaCombo
): string {
  return [familia.id, lavamanos.sku, mueble.sku].join(SEPARADOR_ID);
}

// Todas las parejas lavamanos × mueble de UNA familia (nunca mezcla familias)
export function generarCombinaciones(familia: FamiliaCombo): Combinacion[] {
  const combinaciones: Combinacion[] = [];
  for (const lavamanos of familia.lavamanos) {
    for (const mueble of familia.muebles) {
      combinaciones.push({
        id: idCombinacion(familia, lavamanos, mueble),
        familia,
        lavamanos,
        mueble,
      });
    }
  }
  return combinaciones;
}

// Todas las combinaciones de todas las familias (o de las que se pasen)
export function generarTodasLasCombinaciones(
  familias: FamiliaCombo[] = FAMILIAS_COMBO
): Combinacion[] {
  return familias.flatMap(generarCombinaciones);
}

// Skus únicos de un grupo de combinaciones, para UNA sola consulta a getStockPorSkus
export function skusDeCombinaciones(combinaciones: Combinacion[]): string[] {
  const skus = new Set<string>();
  for (const c of combinaciones) {
    skus.add(c.lavamanos.sku);
    skus.add(c.mueble.sku);
  }
  return [...skus];
}

// Id -> combinación, o null si el id es inválido o una pieza no es de la familia
export function parsearIdCombinacion(
  id: string,
  familias: FamiliaCombo[] = FAMILIAS_COMBO
): { familia: FamiliaCombo; lavamanos: PiezaCombo; mueble: PiezaCombo } | null {
  // el id manipulado puede no ser texto: lo rechazamos sin romper
  if (typeof id !== "string") return null;
  const partes = id.split(SEPARADOR_ID);
  if (partes.length !== 3) return null; // formato incorrecto
  const [idFamilia, skuLav, skuMueble] = partes;

  const familia = familias.find((f) => f.id === idFamilia);
  if (!familia) return null; // familia inexistente

  // cada pieza debe pertenecer a ESTA familia (así LUX-600 no se mezcla con otra)
  const lavamanos = familia.lavamanos.find((p) => p.sku === skuLav);
  const mueble = familia.muebles.find((p) => p.sku === skuMueble);
  if (!lavamanos || !mueble) return null;

  return { familia, lavamanos, mueble };
}

// Precio y stock del combo a partir del mapa devuelto por getStockPorSkus()
export function calcularCombo(
  combinacion: Pick<Combinacion, "lavamanos" | "mueble">,
  mapaStock: Record<string, StockInfo>
): ComboInfo {
  const lav = mapaStock[combinacion.lavamanos.sku];
  const mue = mapaStock[combinacion.mueble.sku];

  // falta una pieza o alguna no tiene precio (null = sin fila o precio 0): no se vende
  if (!lav || !mue || !lav.precio || !mue.precio) {
    return { precio: null, stock: null, status: "no_vendible" };
  }

  // suma de los precios con IVA, redondeada a 2 decimales UNA sola vez al final
  const precio = Math.round((lav.precio + mue.precio) * 100) / 100;

  // el combo tiene la existencia de su pieza más escasa
  const stock = Math.min(lav.quantity ?? 0, mue.quantity ?? 0);

  // mismos umbrales que los productos (una sola definición en umbralStock.ts)
  const status: ComboStatus = clasificarExistencia(stock);

  return { precio, stock, status };
}

// --- Vistas para la interfaz (datos simples, se pueden pasar a componentes cliente) ---

// Foto de una combinación: la propia (mapa FOTOS_COMBINACION en src/data/combos.ts) o,
// si no tiene, la de su familia marcada como referencial (el color puede variar)
export function fotoCombinacion(
  familia: FamiliaCombo,
  lavamanos: PiezaCombo,
  mueble: PiezaCombo
): { imagen: string; referencial: boolean } {
  const propia = FOTOS_COMBINACION[idCombinacion(familia, lavamanos, mueble)];
  return propia
    ? { imagen: propia, referencial: false }
    : { imagen: familia.imagen, referencial: true };
}

// Una combinación ya calculada (precio, stock y estado) lista para mostrar
export type CombinacionVista = ComboInfo & {
  id: string;
  lavamanosSku: string;
  muebleSku: string;
  imagen: string;
  imagenReferencial: boolean; // true: es la foto de la familia, el color puede variar
};

// Calcula todas las combinaciones de UNA familia con el mapa de stock ya consultado
export function vistaCombinaciones(
  familia: FamiliaCombo,
  mapaStock: Record<string, StockInfo>
): CombinacionVista[] {
  return generarCombinaciones(familia).map((c) => ({
    ...calcularCombo(c, mapaStock),
    id: c.id,
    lavamanosSku: c.lavamanos.sku,
    muebleSku: c.mueble.sku,
    imagen: fotoCombinacion(c.familia, c.lavamanos, c.mueble).imagen,
    imagenReferencial: fotoCombinacion(c.familia, c.lavamanos, c.mueble).referencial,
  }));
}

// Menor precio entre las combinaciones vendibles ("Desde $X"); null si ninguna se vende
export function precioDesde(vistas: CombinacionVista[]): number | null {
  const precios = vistas.flatMap((v) => (v.precio !== null ? [v.precio] : []));
  return precios.length > 0 ? Math.min(...precios) : null;
}
