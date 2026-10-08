// src/context/CartContext.tsx
//
// Este archivo crea un "Context" de React - una forma de compartir estado
// (en este caso, el carrito de compras) entre componentes que no están
// directamente conectados entre sí (ej: el botón "Agregar al pedido" en
// el detalle de producto, y el ícono del carrito en el Header).
//
// IMPORTANTE: esto vive solo en memoria del navegador. Si recargas la
// página, el carrito se vacía. Eso es aceptable para este boceto -
// cuando pasemos a la versión con base de datos, esto se reemplaza
// por persistencia real (o al menos localStorage).

"use client"; // todo este archivo corre en el navegador, ya que maneja estado interactivo

import { createContext, useContext, useState, ReactNode } from "react";

// Forma de un producto YA AGREGADO al carrito (distinto del tipo Product completo,
// aquí solo guardamos lo mínimo necesario para mostrar el carrito y calcular el total)
export type CartItem = {
  id: string; // id del producto, para poder identificarlo/quitarlo después
  name: string;
  image: string;
  price: number | null; // precio público del ERP (IVA incluido) - null si no hay precio cargado
  quantity: number; // cuántas unidades de este producto están en el carrito
  sinStock?: boolean; // true si se agregó estando agotado: el asesor debe confirmar la disponibilidad
};

// Forma de todo lo que el Context va a exponer a quien lo use
type CartContextType = {
  items: CartItem[]; // el arreglo de productos en el carrito
  addItem: (item: Omit<CartItem, "quantity">) => void; // agrega un producto (o suma 1 si ya existe)
  removeItem: (id: string) => void; // quita un producto completamente
  updateQuantity: (id: string, quantity: number) => void; // cambia la cantidad de un producto específico
  totalItems: number; // cantidad total de productos (para el badge del carrito)
  totalPrice: number; // suma de todos los precios (ignorando los que son null)
};

// Creamos el Context - empieza en "undefined" porque su valor real se define en el Provider de abajo
const CartContext = createContext<CartContextType | undefined>(undefined);

// El Provider es el componente que "envuelve" toda la app (lo ponemos en layout.tsx)
// y es quien realmente guarda el estado y las funciones para modificarlo
export function CartProvider({ children }: { children: ReactNode }) {
  // Estado principal: el arreglo de productos en el carrito, empieza vacío
  const [items, setItems] = useState<CartItem[]>([]);

  // Agrega un producto al carrito. Si ya existía, solo le suma 1 a la cantidad
  // en vez de crear una fila duplicada.
  function addItem(newItem: Omit<CartItem, "quantity">) {
    setItems((currentItems) => {
      // Buscamos si el producto ya está en el carrito
      const existing = currentItems.find((item) => item.id === newItem.id);

      if (existing) {
        // Si ya existe, devolvemos el arreglo con ESE producto actualizado (+1 cantidad)
        return currentItems.map((item) =>
          item.id === newItem.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }

      // Si no existía, lo agregamos como nuevo con cantidad 1
      return [...currentItems, { ...newItem, quantity: 1 }];
    });
  }

  // Quita un producto completamente del carrito, sin importar su cantidad
  function removeItem(id: string) {
    setItems((currentItems) => currentItems.filter((item) => item.id !== id));
  }

  // Cambia la cantidad de un producto específico (usado por los botones +/- en el carrito)
  function updateQuantity(id: string, quantity: number) {
    if (quantity < 1) {
      // Si la cantidad llega a 0 o menos, mejor quitamos el producto directamente
      removeItem(id);
      return;
    }
    setItems((currentItems) =>
      currentItems.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  }

  // Calculamos el total de unidades sumando las cantidades de todos los productos
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  // Calculamos el precio total - solo sumamos productos que SÍ tienen precio definido (no null)
  const totalPrice = items.reduce((sum, item) => {
    if (item.price === null) return sum; // ignoramos productos sin precio confirmado
    return sum + item.price * item.quantity;
  }, 0);

  return (
    // Proveemos todo el estado y funciones a quien esté "adentro" de este Provider
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, totalItems, totalPrice }}
    >
      {children}
    </CartContext.Provider>
  );
}

// Hook personalizado para usar el carrito fácilmente desde cualquier componente,
// ej: const { items, addItem } = useCart();
export function useCart() {
  const context = useContext(CartContext);

  // Si alguien usa este hook FUERA del CartProvider, lanzamos un error claro
  // en vez de dejar que falle de forma confusa más adelante
  if (context === undefined) {
    throw new Error("useCart debe usarse dentro de un CartProvider");
  }

  return context;
}
