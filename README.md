# Productivity App

Aplicação web de gerenciamento de tarefas construída com **Next.js 15** e **tRPC**. O backend mantém as tarefas em memória (sem banco de dados) e expõe operações de CRUD com validação via Zod e tratamento de erros. A listagem usa paginação por cursor, pensada para scroll infinito.

## Funcionalidades

- Criar, listar (paginado), buscar por id, atualizar e deletar tarefas
- Validação de dados com Zod (`BAD_REQUEST` para dados inválidos, `NOT_FOUND` para IDs inexistentes)
- Armazenamento em memória: os dados são perdidos ao reiniciar o servidor
- Em desenvolvimento, o servidor inicia com 50 tarefas de exemplo

## Pré-requisitos

- [Node.js](https://nodejs.org/) na versão LTS indicada em `.nvmrc` (`lts/krypton`)
- npm (já vem com o Node.js)
- (Opcional) [nvm](https://github.com/nvm-sh/nvm) para instalar a versão correta do Node
- (Opcional) Extensão [REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client) do VS Code, para executar o arquivo `request.http`

## Instalação

```bash
# Clone o repositório e entre na pasta
git clone https://github.com/julia-gabgomes/productivity-app.git
cd productivity-app

# (Opcional) use a versão do Node definida no projeto
nvm use

# Instale as dependências
npm install
```

## Uso

```bash
npm run dev      # servidor de desenvolvimento em http://localhost:3000
npm run build    # build de produção
npm run start    # servidor de produção (após o build)
```

Outros comandos:

```bash
npm run lint         # linter do Next.js
npm run lint:check   # verifica a formatação com Prettier
npm run lint:fix     # corrige a formatação com Prettier
```

## Testando a API com `request.http`

O arquivo `request.http` na raiz do projeto contém requisições de exemplo para todas as rotas de tarefas.

1. Instale a extensão **REST Client** (`humao.rest-client`) no VS Code.
2. Inicie o servidor com `npm run dev`.
3. Abra o `request.http` no VS Code.
4. Clique em **Send Request**, que aparece acima de cada requisição (separadas por `###`).

Sugestão de ordem de execução:

1. **Listar tarefas (primeira página)**: retorna `{ items, nextCursor }`.
2. **Listar tarefas (próxima página)**: usa automaticamente o `nextCursor` da requisição anterior, então execute a primeira antes.
3. **Criar tarefa**: cria uma tarefa e guarda o `id` retornado.
4. **Atualizar tarefa** e **Deletar tarefa**: usam o `id` da tarefa criada no passo anterior, então execute a criação antes.
5. Requisições de erro (título vazio, IDs inexistentes): retornam `400 BAD_REQUEST` e `404 NOT_FOUND`.

> Por usar o transformer SuperJSON, nas chamadas HTTP diretas o input vai dentro de `{"json": ...}` e a resposta vem em `result.data.json`.

## Endpoints (`tasks.*`)

| Procedure      | Tipo     | Input                         | Retorno                            |
| -------------- | -------- | ----------------------------- | ---------------------------------- |
| `tasks.list`   | query    | `{ cursor?, limit? }`         | `{ items, nextCursor }`            |
| `tasks.byId`   | query    | `{ id }`                      | `Task` (ou `NOT_FOUND`)            |
| `tasks.create` | mutation | `{ titulo, descricao? }`      | `Task`                             |
| `tasks.update` | mutation | `{ id, titulo?, descricao? }` | `Task` (ou `NOT_FOUND`)            |
| `tasks.delete` | mutation | `{ id }`                      | `{ success, id }` (ou `NOT_FOUND`) |

## Stack

Next.js 15, React 19, TypeScript, tRPC 11, TanStack React Query, Zod, SuperJSON e Prettier.
