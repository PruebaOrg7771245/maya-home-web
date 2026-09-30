// src/lib/supabase.ts
//
// Cliente de Supabase para USO EXCLUSIVO DEL SERVIDOR (rutas dentro de
// src/app/api/...). Usa la llave "service role", que puede leer y escribir
// sin restricciones - por eso este archivo NUNCA debe importarse desde un
// componente de cliente ("use client") ni exponerse al navegador.

import { createClient } from "@supabase/supabase-js";

// Si alguna de las 2 variables falta, preferimos que la app falle fuerte
// y claro al arrancar, en vez de fallar en silencio más adelante cuando
// alguien intente guardar un pedido.
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error("Falta la variable de entorno NEXT_PUBLIC_SUPABASE_URL");
}
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Falta la variable de entorno SUPABASE_SERVICE_ROLE_KEY");
}

export const supabaseServidor = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
