// src/app/layout.tsx
import type { Metadata } from "next";
import { Archivo, Inter } from "next/font/google"; // importamos las 2 fuentes que sí vamos a usar (quitamos Geist)
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
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

// Actualizado de "Comercial Maya" a "Maya Home"
export const metadata: Metadata = {
  // Lo que hay hoy en el catálogo; la misma descripción vive en sitio.descripcion
  title: "Maya Home | Sanitarios, pisos de bambú y acabados para el hogar",
  description:
    "Catálogo de lavamanos, sanitarios, pisos de bambú, piedras flexibles y acabados para el hogar.",
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