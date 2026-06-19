import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
  // Domínio próprio (aerisx.com.br) serve a partir da raiz — sem basePath.
};

export default nextConfig;
