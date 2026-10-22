const criarApp = require('./app');

const app = criarApp();

// Rodando localmente (node server.js): sobe o servidor na porta configurada.
// Na Vercel o arquivo é apenas importado, então o app é exportado e a plataforma cuida do resto.
if (require.main === module) {
  const PORT = Number(process.env.PORT) || 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor de clientes ativo em http://localhost:${PORT}`);
  });
}

module.exports = app;
