function normalizarDados(dados = {}, parcial = false) {
  const entrada = dados && typeof dados === 'object' && !Array.isArray(dados) ? dados : {};
  const resultado = {};
  for (const campo of ['nome', 'email']) {
    if (!parcial || Object.hasOwn(entrada, campo)) {
      resultado[campo] = typeof entrada[campo] === 'string' ? entrada[campo].trim() : '';
    }
  }
  return resultado;
}

function validarDados(dados, parcial = false) {
  const erros = [];
  if (parcial && Object.keys(dados).length === 0) erros.push('Informe ao menos um campo para atualizar.');
  if (!parcial || Object.hasOwn(dados, 'nome')) {
    if (!dados.nome) erros.push('O nome é obrigatório.');
    else if (dados.nome.length > 120) erros.push('O nome deve ter no máximo 120 caracteres.');
  }
  if (!parcial || Object.hasOwn(dados, 'email')) {
    if (!dados.email) erros.push('O e-mail é obrigatório.');
    else if (dados.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dados.email)) {
      erros.push('Informe um endereço de e-mail válido.');
    }
  }
  return erros;
}

function criarClienteController(model) {
  return {
    pagina: (req, res) => res.render('clientes'),

    listar: async (req, res) => {
      const clientes = await model.listar();
      res.json(clientes);
    },

    consultar: async (req, res) => {
      const cliente = await model.buscarPorId(req.params.id);
      if (!cliente) return res.status(404).json({ erro: 'Cliente não encontrado.' });
      return res.json(cliente);
    },

    cadastrar: async (req, res) => {
      const dados = normalizarDados(req.body);
      const erros = validarDados(dados);
      if (erros.length) return res.status(400).json({ erro: 'Dados inválidos.', detalhes: erros });
      const cliente = await model.criar(dados);
      return res.status(201).json(cliente);
    },

    alterar: async (req, res) => {
      const parcial = req.method === 'PATCH';
      const dados = normalizarDados(req.body, parcial);
      const erros = validarDados(dados, parcial);
      if (erros.length) return res.status(400).json({ erro: 'Dados inválidos.', detalhes: erros });
      const cliente = await model.atualizar(req.params.id, dados);
      if (!cliente) return res.status(404).json({ erro: 'Cliente não encontrado.' });
      return res.json(cliente);
    },

    excluir: async (req, res) => {
      const cliente = await model.excluir(req.params.id);
      if (!cliente) return res.status(404).json({ erro: 'Cliente não encontrado.' });
      return res.status(200).json({ mensagem: 'Cliente excluído com sucesso.', cliente });
    },
  };
}

module.exports = criarClienteController;
