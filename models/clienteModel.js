const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { randomUUID } = require('node:crypto');

class ClienteModel {
  // Na Vercel o disco é somente leitura, exceto /tmp (dados temporários, não permanentes).
  constructor(filePath = process.env.VERCEL
    ? path.join(os.tmpdir(), 'clientes.json')
    : path.join(__dirname, '..', 'data', 'clientes.json')) {
    this.filePath = filePath;
    this.queue = Promise.resolve();
  }

  // Serializa leituras e escritas para evitar colisões entre requisições simultâneas.
  executarEmFila(operacao) {
    const resultado = this.queue.then(operacao);
    this.queue = resultado.catch(() => {});
    return resultado;
  }

  async lerArquivo() {
    try {
      const conteudo = await fs.readFile(this.filePath, 'utf8');
      const clientes = JSON.parse(conteudo);
      if (!Array.isArray(clientes)) throw new Error('O arquivo de clientes deve conter uma lista.');
      return clientes;
    } catch (erro) {
      if (erro.code !== 'ENOENT') throw erro;
      await fs.mkdir(path.dirname(this.filePath), { recursive: true });
      await fs.writeFile(this.filePath, '[]\n', 'utf8');
      return [];
    }
  }

  async gravarArquivo(clientes) {
    await fs.mkdir(path.dirname(this.filePath), { recursive: true });
    const temporario = `${this.filePath}.${process.pid}.${randomUUID()}.tmp`;
    await fs.writeFile(temporario, `${JSON.stringify(clientes, null, 2)}\n`, 'utf8');
    await fs.rename(temporario, this.filePath);
  }

  listar() {
    return this.executarEmFila(() => this.lerArquivo());
  }

  buscarPorId(id) {
    return this.executarEmFila(async () => {
      const clientes = await this.lerArquivo();
      return clientes.find((cliente) => cliente.id === id) || null;
    });
  }

  criar(dados) {
    return this.executarEmFila(async () => {
      const clientes = await this.lerArquivo();
      const cliente = { id: randomUUID(), nome: dados.nome, email: dados.email };
      clientes.push(cliente);
      await this.gravarArquivo(clientes);
      return cliente;
    });
  }

  atualizar(id, dados) {
    return this.executarEmFila(async () => {
      const clientes = await this.lerArquivo();
      const indice = clientes.findIndex((cliente) => cliente.id === id);
      if (indice === -1) return null;
      clientes[indice] = { ...clientes[indice], ...dados, id };
      await this.gravarArquivo(clientes);
      return clientes[indice];
    });
  }

  excluir(id) {
    return this.executarEmFila(async () => {
      const clientes = await this.lerArquivo();
      const indice = clientes.findIndex((cliente) => cliente.id === id);
      if (indice === -1) return null;
      const [removido] = clientes.splice(indice, 1);
      await this.gravarArquivo(clientes);
      return removido;
    });
  }
}

module.exports = ClienteModel;
