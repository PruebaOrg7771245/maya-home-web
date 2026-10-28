import type { MetadataRoute } from "next";
import { URL_BASE } from "@/lib/site";
import { products } from "@/data/products";
import { FAMILIAS_COMBO } from "@/data/combos";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date(); // fecha del build
  const rutas = [
    "",
    "/catalogo",
    ...products.map((p) => `/productos/${p.id}`),
    ...FAMILIAS_COMBO.map((f) => `/combos/${f.id}`),
  ];
  return rutas.map((ruta) => ({ url: `${URL_BASE}${ruta}`, lastModified }));
}
