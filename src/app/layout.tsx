// src/app/layout.tsx
import type { Metadata } from "next";
import { Archivo, Inter } from "next/font/google"; // importamos las 2 fuentes que sí vamos a usar (quitamos Geist)
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { URL_BASE } from "@/lib/site";
import { CartProvider } from "@/context/CartContext"; // importamos el proveedor del carrito

// Fuente para títulos - Archivo, en pesos semi-bold y bold
const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-heading", // variable CSS que usamos en los componentes como var(--font-heading)
  weight: ["600", "700"],
});

// Fuente para texto de cuerpo - Inter
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500"],
});

const titulo = "Maya Home | Catálogo de Comercial Maya";
const descripcion =
  "Catálogo virtual de Comercial Maya: sanitarios, lavamanos, pisos de bambú, saunas y más. Arma tu pedido y un asesor te atiende.";

// La imagen de vista previa sale sola de src/app/opengraph-image.jpg
export const metadata: Metadata = {
  metadataBase: new URL(URL_BASE),
  title: titulo,
  description: descripcion,
  openGraph: {
    title: titulo,
    description: descripcion,
    siteName: "Maya Home",
    locale: "es_EC",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${archivo.variable} ${inter.variable} font-[var(--font-body)] antialiased`}>
        {/* CartProvider envuelve TODO (Header incluido) para que tanto el
            ícono del carrito como cualquier página puedan leer/modificar
            el estado del carrito */}
        <CartProvider>
          <Header />
          {children}
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}