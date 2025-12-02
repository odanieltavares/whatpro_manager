/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuração customizada
  typescript: {
    // Permite build mesmo com erros de TypeScript (não recomendado para produção)
    ignoreBuildErrors: false,
  },
  eslint: {
    // Permite build mesmo com erros de ESLint (não recomendado para produção)
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;
