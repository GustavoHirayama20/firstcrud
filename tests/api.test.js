const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const criarApp = require('../app');
const ClienteModel = require('../models/clienteModel');

test('API de clientes executa o CRUD e valida entradas', async () => {
  const diretorio = await fs.mkdtemp(path.join(os.tmpdir(), 'clientes-api-'));
  const caminhoDados = path.join(diretorio, 'clientes.json');
  const app = criarApp({ model: new ClienteModel(caminhoDados) });
  const servidor = app.listen(0, '127.0.0.1');
  await new Promise((resolve, reject) => {
    servidor.once('listening', resolve);
    servidor.once('error', reject);
  });
  const baseUrl = `http://127.0.0.1:${servidor.address().port}`;

  try {
    let resposta = await fetch(`${baseUrl}/api/clientes`);
    assert.equal(resposta.status, 200);
    assert.deepEqual(await resposta.json(), []);

    resposta = await fetch(`${baseUrl}/api/clientes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome: '  Ana Costa  ', email: 'ana@example.com' }),
    });
    assert.equal(resposta.status, 201);
    const criado = await resposta.json();
    assert.ok(criado.id);
    assert.equal(criado.nome, 'Ana Costa');
    assert.equal(criado.email, 'ana@example.com');

    resposta = await fetch(`${baseUrl}/api/clientes/${criado.id}`);
    assert.equal(resposta.status, 200);
    assert.deepEqual(await resposta.json(), criado);

    resposta = await fetch(`${baseUrl}/api/clientes/${criado.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome: 'Ana Silva', email: 'ana.silva@example.com' }),
    });
    assert.equal(resposta.status, 200);
    const atualizado = await resposta.json();
    assert.equal(atualizado.id, criado.id);
    assert.equal(atualizado.nome, 'Ana Silva');

    resposta = await fetch(`${baseUrl}/api/clientes/${criado.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome: 'Ana Costa Silva' }),
    });
    assert.equal(resposta.status, 200);
    const parcial = await resposta.json();
    assert.equal(parcial.nome, 'Ana Costa Silva');
    assert.equal(parcial.email, 'ana.silva@example.com');

    resposta = await fetch(`${baseUrl}/api/clientes/${criado.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    assert.equal(resposta.status, 400);

    resposta = await fetch(`${baseUrl}/api/clientes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome: 'Nome sem e-mail' }),
    });
    assert.equal(resposta.status, 400);
    assert.ok((await resposta.json()).detalhes.length > 0);

    resposta = await fetch(`${baseUrl}/api/clientes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{json inválido',
    });
    assert.equal(resposta.status, 400);

    resposta = await fetch(`${baseUrl}/clientes/api`);
    assert.equal(resposta.status, 200);
    assert.equal((await resposta.json()).length, 1);

    const modeloReiniciado = new ClienteModel(caminhoDados);
    assert.equal((await modeloReiniciado.listar())[0].id, criado.id);

    resposta = await fetch(`${baseUrl}/api/clientes/${criado.id}`, { method: 'DELETE' });
    assert.equal(resposta.status, 200);
    assert.equal((await resposta.json()).cliente.id, criado.id);

    resposta = await fetch(`${baseUrl}/api/clientes/${criado.id}`);
    assert.equal(resposta.status, 404);

    resposta = await fetch(`${baseUrl}/api/clientes/id-que-nao-existe`, { method: 'DELETE' });
    assert.equal(resposta.status, 404);

    resposta = await fetch(`${baseUrl}/clientes`);
    assert.equal(resposta.status, 200);
    assert.match(await resposta.text(), /Gestão de clientes/);
  } finally {
    await new Promise((resolve, reject) => servidor.close((erro) => erro ? reject(erro) : resolve()));
    await fs.rm(diretorio, { recursive: true, force: true });
  }
});
