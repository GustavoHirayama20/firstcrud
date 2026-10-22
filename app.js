const express = require('express');
const cors = require('cors');
const path = require('node:path');
const ClienteModel = require('./models/clienteModel');
const criarClienteController = require('./controllers/clienteController');
const criarRotasCliente = require('./routes/clienteRoutes');

function criarApp({ model = new ClienteModel() } = {}) {
  const app = express();
  const controller = criarClienteController(model);

  app.set('view engine', 'ejs');
  app.engine('ejs', require('ejs').__express); // referência explícita: faz a Vercel incluir o ejs no deploy
  app.set('views', path.join(__dirname, 'views'));
  app.use(cors());
  app.use(express.json({ limit: '20kb' }));
  app.use(express.urlencoded({ extended: false, limit: '20kb' }));
  app.use('/public', express.static(path.join(__dirname, 'public')));

  app.get('/', (req, res) => res.redirect('/clientes'));
  app.get('/health', (req, res) => res.json({ status: 'ok' }));
  app.get('/api', (req, res) => res.json({
    nome: 'API de Clientes',
    versao: '1.0.0',
    endpoints: {
      listar: 'GET /api/clientes',
      cadastrar: 'POST /api/clientes',
      consultar: 'GET /api/clientes/:id',
      alterar: 'PUT ou PATCH /api/clientes/:id',
      excluir: 'DELETE /api/clientes/:id',
    },
  }));

  app.get('/clientes', controller.pagina);
  // Alias compatível com o formato /recurso/api apresentado no material didático.
  app.get('/clientes/api', controller.listar);
  app.use('/api/clientes', criarRotasCliente(controller));

  app.use((req, res) => res.status(404).json({ erro: 'Rota não encontrada.' }));
  app.use((erro, req, res, next) => {
    if (res.headersSent) return next(erro);
    const status = erro.status === 400 || erro.type === 'entity.parse.failed' ? 400 : 500;
    if (status === 500) console.error(erro);
    const mensagem = status === 400 ? 'Corpo JSON inválido.' : 'Erro interno do servidor.';
    return res.status(status).json({ erro: mensagem });
  });

  return app;
}

module.exports = criarApp;
