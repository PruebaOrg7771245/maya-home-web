import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // 75 = valor por defecto de next/image; 90 = portada (texto y logo en la imagen)
    qualities: [75, 90],
  },
};

export default nextConfig;
