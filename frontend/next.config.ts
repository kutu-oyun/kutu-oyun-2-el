import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Production için optimize edilmiş build
  output: 'standalone',
  
  // Vercel'de otomatik olarak ayarlanır, ama açıkça belirtmek iyi
  reactStrictMode: true,
};

export default nextConfig;
