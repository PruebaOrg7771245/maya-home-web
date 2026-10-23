// src/components/CatalogoConFiltro.tsx
//
// Parte interactiva de la página /catalogo. Es un "client component" porque
// depende del navegador: la categoría elegida y la búsqueda viajan en la URL
// (?categoria=...&q=...), así se pueden compartir y el botón "atrás" las
// recupera. El filtrado se hace AQUÍ, en el navegador, sobre los productos y
// combos que ya llegaron: no hay consultas nuevas y lo que se escribe no se
// guarda ni se envía a ningún sitio. El stock y el precio llegan YA resueltos
// por props desde src/app/catalogo/page.tsx (server component) - este archivo
// nunca consulta el stock por su cuenta (ADR-1).

"use client"; // le dice a Next.js que este archivo se ejecuta en el navegador, no en el servidor

import { Suspense, useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { useSearchParams } from "next/navigation"; // lee ?categoria= y ?q= de la URL
import { products } from "@/data/products"; // nuestros datos del catálogo
import { FAMILIAS_COMBO } from "@/data/combos"; // solo para armar el texto buscable de los combos
import ProductCard from "@/components/ProductCard"; // tarjeta individual de producto
import CintaCategorias, { type ElementoCinta } from "@/components/CintaCategorias"; // cinta horizontal de categorías
import { IconoLupa } from "@/components/BuscadorCabecera"; // lupa del campo
import ComboCard, { type ComboCardData } from "@/components/ComboCard"; // tarjeta de una familia de combos
import type { StockInfo } from "@/lib/stock"; // solo el TIPO: no arrastra el cliente de servidor al navegador
import { PESTANA_COMBOS, PESTANA_TODOS, urlCatalogo } from "@/lib/catalogoUrl"; // nombres de categorías y URL del catálogo
import { categoriasCatalogo } from "@/lib/categorias";
import { guardarOrigen } from "@/lib/origenCatalogo"; // recuerda el filtro al abrir una ficha
import {
  LARGO_MAXIMO_CONSULTA,
  coincide,
  prepararConsulta,
  textoBusquedaCombo,
  textoBusquedaProducto,
} from "@/lib/busqueda";

type CatalogoConFiltroProps = {
  // stock y precio del ERP de cada producto, indexados por product.id
  stockPorId: Record<string, StockInfo>;
  // una entrada por familia de combos, ya con su "Desde $X" calculado en el servidor
  combos: ComboCardData[];
};

// Respaldo por si algún producto no llegara en el mapa (no debería pasar:
// page.tsx arma una entrada por producto). Sin precio = no se puede vender.
const STOCK_DESCONOCIDO: StockInfo = { status: "unknown", quantity: null, precio: null };

// Opciones de la cinta, en orden (datos estáticos, se calculan una vez)
const CATEGORIAS = categoriasCatalogo();

// Textos buscables, calculados una sola vez (id → texto sin tildes ni mayúsculas)
const TEXTO_PRODUCTO = new Map(products.map((p) => [p.id, textoBusquedaProducto(p)]));
const TEXTO_COMBO = new Map(FAMILIAS_COMBO.map((f) => [f.id, textoBusquedaCombo(f)]));

// Espera tras la última tecla antes de reflejar la búsqueda en la URL
const ESPERA_URL_MS = 250;

type CatalogoProps = CatalogoConFiltroProps & {
  categoria: string; // categoría activa ("Todos", una de los productos o "Combos lavamanos")
  texto: string; // lo escrito en el buscador
  alEscribir: (valor: string) => void;
  alLimpiar: () => void; // quita categoría y búsqueda
  inputRef: RefObject<HTMLInputElement | null>;
};

// Parte visual del catálogo; no sabe de dónde salen la categoría y el texto
function Catalogo({ stockPorId, combos, categoria, texto, alEscribir, alLimpiar, inputRef }: CatalogoProps) {
  const verCombos = categoria === PESTANA_COMBOS; // categoría "Combos lavamanos": el grid muestra familias
  const grupos = useMemo(() => prepararConsulta(texto), [texto]);
  const hayConsulta = grupos.length > 0;
  const hayFiltros = hayConsulta || categoria !== PESTANA_TODOS;

  // Chips de la cinta: cambiar de categoría conserva la búsqueda escrita
  const chips = useMemo<ElementoCinta[]>(
    () =>
      CATEGORIAS.map((nombre) => ({
        etiqueta: nombre,
        href: urlCatalogo(nombre, texto),
        activo: nombre === categoria,
      })),
    [categoria, texto]
  );

  // Productos: por categoría y por búsqueda (nada si la categoría es "Combos lavamanos")
  const productosFiltrados = useMemo(() => {
    if (verCombos) return [];
    return products.filter(
      (p) =>
        (categoria === PESTANA_TODOS || p.category === categoria) &&
        coincide(TEXTO_PRODUCTO.get(p.id) ?? "", grupos)
    );
  }, [verCombos, categoria, grupos]);

  // Combos: en "Combos lavamanos" y en "Todos" (tras los productos, ADR-32); nunca en
  // otra categoría. La búsqueda los filtra igual que antes.
  const combosFiltrados = useMemo(() => {
    if (!verCombos && categoria !== PESTANA_TODOS) return [];
    return combos.filter((c) => coincide(TEXTO_COMBO.get(c.id) ?? "", grupos));
  }, [verCombos, categoria, combos, grupos]);

  const total = productosFiltrados.length + combosFiltrados.length;
  // Combos aparte bajo su propio título cuando se mezclan con productos ("Todos")
  const combosSeparados = !verCombos && combosFiltrados.length > 0;

  return (
    <main
      className="min-h-screen bg-[#EFEDE7]"
      // Al abrir una ficha (producto o combo) se anota desde qué filtro se salió,
      // para que "Volver al catálogo" de la ficha regrese al mismo filtro
      onClickCapture={(e) => {
        const enlace = (e.target as Element).closest<HTMLAnchorElement>('a[href^="/productos/"], a[href^="/combos/"]');
        if (enlace) guardarOrigen({ url: window.location.pathname + window.location.search, destino: enlace.pathname });
      }}
    >
      <div className="mx-auto max-w-7xl px-6 py-8">
        <h1 className="sr-only">Catálogo</h1>

        {/* Cinta de categorías y, debajo, el buscador. Alturas fijas (h-11): nada cambia
            de tamaño al escribir ni al cambiar de categoría. */}
        <CintaCategorias elementos={chips} etiqueta="Categorías del catálogo" />

        <div className="relative mt-3">
          <label htmlFor="buscar-catalogo" className="sr-only">
            Buscar en el catálogo
          </label>
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#6B6862]">
            <IconoLupa tamano={18} />
          </span>
          <input
            ref={inputRef}
            id="buscar-catalogo"
            type="search"
            value={texto}
            onChange={(e) => alEscribir(e.target.value)}
            maxLength={LARGO_MAXIMO_CONSULTA}
            placeholder="Buscar por nombre, categoría o código"
            autoComplete="off"
            enterKeyHint="search"
            className="h-11 w-full border border-[#D8D4CC] bg-white pl-10 pr-3 text-base text-[#232320] placeholder:text-[#6B6862] focus:border-[#A8562E] sm:text-sm [&::-webkit-search-cancel-button]:hidden"
          />
        </div>

        {/* Número de resultados (anunciado por lectores de pantalla) y "Limpiar filtros".
            min-h-11: la fila no cambia de alto aunque el botón aparezca o desaparezca. */}
        <div className="mt-2 flex min-h-11 items-center justify-between gap-4 text-sm text-[#6B6862]">
          <p role="status" aria-live="polite">
            {total} {total === 1 ? "resultado" : "resultados"}
          </p>
          {hayFiltros && (
            <button
              type="button"
              onClick={alLimpiar}
              className="min-h-11 px-1 text-[#A8562E] underline transition-colors hover:text-[#232320]"
            >
              Limpiar filtros
            </button>
          )}
        </div>

        {/* Mismo grid para productos y para combos */}
        {!verCombos && productosFiltrados.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {productosFiltrados.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                stock={stockPorId[product.id] ?? STOCK_DESCONOCIDO}
              />
            ))}
          </div>
        )}

        {combosFiltrados.length > 0 && (
          <section className={combosSeparados ? "mt-10" : "mt-4"}>
            {combosSeparados && (
              <h2 className="mb-4 font-[var(--font-heading)] text-xl font-semibold text-[#232320]">
                {PESTANA_COMBOS}
              </h2>
            )}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {combosFiltrados.map((combo) => (
                <ComboCard key={combo.id} combo={combo} />
              ))}
            </div>
          </section>
        )}

        {/* Estado vacío: con búsqueda, dice qué se buscó y ofrece ver todo el catálogo */}
        {total === 0 && hayConsulta && (
          <div className="mt-12 text-center">
            <p className="break-words text-[#232320]">
              No encontramos resultados para &ldquo;{texto.trim()}&rdquo;.
            </p>
            <p className="mt-2 text-sm text-[#6B6862]">
              Revisa la ortografía, prueba con otra palabra o ve todo el catálogo.
            </p>
            <button
              type="button"
              onClick={alLimpiar}
              className="mt-4 inline-flex min-h-11 items-center bg-[#232320] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#A8562E]"
            >
              Ver todo el catálogo
            </button>
          </div>
        )}

        {total === 0 && !hayConsulta && (
          <p className="mt-12 text-center text-[#6B6862]">
            {verCombos
              ? "Todavía no hay combos lavamanos disponibles. Vuelve pronto o consulta con tu asesor."
              : "No hay productos en esta categoría todavía."}
          </p>
        )}
      </div>
    </main>
  );
}

// Lee categoría y búsqueda de la URL y las actualiza SIN recargar ni navegar:
// history.replaceState cambia la dirección (Next.js la sincroniza con useSearchParams)
// y no llena el historial con cada tecla. Una categoría desconocida cae en "Todos".
// (Elegir categoría en el menú es un enlace normal: sí queda en el historial.)
function CatalogoConUrl(props: CatalogoConFiltroProps) {
  const searchParams = useSearchParams();
  const pedida = searchParams.get("categoria");
  const categoria =
    pedida !== null && CATEGORIAS.includes(pedida) ? pedida : PESTANA_TODOS;
  const qUrl = (searchParams.get("q") ?? "").slice(0, LARGO_MAXIMO_CONSULTA);

  // Lo escrito vive en estado local (respuesta inmediata) y se copia a la URL con una pequeña espera
  const [texto, setTexto] = useState(qUrl);
  const inputRef = useRef<HTMLInputElement>(null);
  const espera = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Si la URL cambia desde fuera (buscador de la cabecera, botón atrás, un enlace),
  // se refleja en el campo; mientras se escribe en él, la URL no pisa lo tecleado.
  useEffect(() => {
    setTexto((actual) => (document.activeElement === inputRef.current ? actual : qUrl));
  }, [qUrl]);

  // Al salir de la página se cancela la copia pendiente a la URL
  useEffect(() => () => clearTimeout(espera.current), []);

  function alEscribir(valor: string) {
    setTexto(valor);
    clearTimeout(espera.current);
    espera.current = setTimeout(() => {
      // La categoría se lee de la URL en este momento (no de la variable): si cambió
      // mientras se esperaba, no se pisa con la anterior.
      const categoriaActual = new URLSearchParams(window.location.search).get("categoria") ?? PESTANA_TODOS;
      window.history.replaceState(null, "", urlCatalogo(categoriaActual, valor));
    }, ESPERA_URL_MS);
  }

  function alLimpiar() {
    clearTimeout(espera.current);
    setTexto("");
    window.history.replaceState(null, "", urlCatalogo());
    inputRef.current?.focus(); // el botón desaparece: el foco pasa al campo en vez de perderse
  }

  return (
    <Catalogo
      {...props}
      categoria={categoria}
      texto={texto}
      alEscribir={alEscribir}
      alLimpiar={alLimpiar}
      inputRef={inputRef}
    />
  );
}

export default function CatalogoConFiltro(props: CatalogoConFiltroProps) {
  // Mientras se lee la URL (y en el HTML estático) se ve el catálogo completo en "Todos"
  return (
    <Suspense
      fallback={
        <Catalogo
          {...props}
          categoria={PESTANA_TODOS}
          texto=""
          alEscribir={() => {}}
          alLimpiar={() => {}}
          inputRef={{ current: null }}
        />
      }
    >
      <CatalogoConUrl {...props} />
    </Suspense>
  );
}
