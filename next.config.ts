import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // No exponer el stack tecnológico en cabeceras
  poweredByHeader: false,

  images: {
    // Allowlist explícita de dominios externos para next/image.
    // Añadir aquí cuando se configuren CDN o Supabase Storage.
    remotePatterns: [
      // TODO: añadir dominio de Supabase Storage cuando se configure
      // { protocol: "https", hostname: "<proyecto>.supabase.co", pathname: "/storage/v1/object/public/**" },
    ],
  },

  // Las cabeceras de seguridad (CSP, HSTS, etc.) se gestionan en middleware.ts
  // para poder inyectar el nonce dinámico por request.
};

export default nextConfig;
