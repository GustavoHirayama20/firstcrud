const criarApp = require('./app');

const PORT = Number(process.env.PORT) || 3000;
const app = criarApp();

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor de clientes ativo em http://localhost:${PORT}`);
});
