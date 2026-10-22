# CRUD de Clientes — Node.js, Express e MVC

Aplicação didática para cadastro de clientes com **id**, **nome** e **email**. Inclui uma interface web, uma API REST em JSON e armazenamento persistente em ficheiro local.

## Requisitos

- Node.js 18.11 ou superior (testado com Node.js 22)
- npm

## Executar localmente

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) para usar a interface. O comando `npm start` inicia o servidor sem o recarregamento automático.

Os dados são mantidos em `data/clientes.json`, criado automaticamente quando necessário. Não é preciso criar conta ou configurar Firebase para testar este projeto.

## API REST

A base é `http://localhost:3000/api/clientes`. Todos os pedidos e respostas da API utilizam JSON.

| Operação | Método e rota | Resultado |
| --- | --- | --- |
| Listar | `GET /api/clientes` | Lista de clientes (HTTP 200) |
| Cadastrar | `POST /api/clientes` | Novo cliente, com ID gerado (HTTP 201) |
| Consultar | `GET /api/clientes/:id` | Cliente ou HTTP 404 |
| Alterar | `PUT /api/clientes/:id` ou `PATCH /api/clientes/:id` | Cliente atualizado ou HTTP 404 |
| Excluir | `DELETE /api/clientes/:id` | Confirmação de exclusão ou HTTP 404 |

A página HTML está em `GET /clientes`. Para compatibilidade com o tutorial de referência, `GET /clientes/api` também retorna a lista JSON. `GET /api` apresenta um índice dos endpoints e `GET /health` verifica o estado do servidor.

### Cadastrar cliente

```bash
curl -X POST http://localhost:3000/api/clientes \
  -H 'Content-Type: application/json' \
  -d '{"nome":"Ana Costa","email":"ana@example.com"}'
```

Resposta (o `id` é gerado automaticamente):

```json
{
  "id": "f94c1af0-01f1-4a7e-9d29-b35742b61c1e",
  "nome": "Ana Costa",
  "email": "ana@example.com"
}
```

### Consultar, alterar e excluir

Substitua `<id>` pelo identificador recebido no cadastro:

```bash
curl http://localhost:3000/api/clientes/<id>

curl -X PUT http://localhost:3000/api/clientes/<id> \
  -H 'Content-Type: application/json' \
  -d '{"nome":"Ana Costa Silva","email":"ana.silva@example.com"}'

curl -X PATCH http://localhost:3000/api/clientes/<id> \
  -H 'Content-Type: application/json' \
  -d '{"nome":"Ana Costa Silva"}'

curl -X DELETE http://localhost:3000/api/clientes/<id>
```

`PUT` exige nome e e-mail. `PATCH` altera apenas os campos enviados, nome e/ou e-mail. O nome e o e-mail são obrigatórios no cadastro; o e-mail deve ter formato válido. Respostas de validação usam HTTP 400, e clientes inexistentes usam HTTP 404.

### React Native / Expo

O servidor habilita CORS e aceita pedidos JSON. Para usar no Expo, defina a URL base da API como o endereço acessível pelo dispositivo/emulador (não use `localhost` no telemóvel físico). Por exemplo:

```js
const API_URL = 'http://<endereco-do-servidor>:3000/api/clientes';
const resposta = await fetch(API_URL);
const clientes = await resposta.json();
```

## Estrutura MVC

```text
app.js
server.js
models/clienteModel.js            # leitura e gravação dos dados JSON
controllers/clienteController.js  # validação e respostas HTTP
routes/clienteRoutes.js           # mapeamento das rotas REST
views/clientes.ejs                # interface de gestão
public/styles.css                  # estilos responsivos
data/clientes.json                # dados locais (criado automaticamente)
tests/api.test.js                  # testes HTTP integrados
```

- **Model:** lê e grava clientes no ficheiro JSON, serializando operações de escrita/leitura.
- **Controller:** valida os campos e coordena as ações do model.
- **Routes:** associa métodos e URLs do HTTP às ações do controller.
- **View:** interface web que consome a mesma API com `fetch()`.

## Testes

```bash
npm test
```

O teste integrado inicia um servidor temporário e verifica as operações CRUD, validação e respostas para IDs inexistentes.
