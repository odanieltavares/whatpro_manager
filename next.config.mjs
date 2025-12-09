/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuração customizada
  typescript: {
    // Permite build mesmo com erros de TypeScript (não recomendado para produção)
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
