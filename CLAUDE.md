# CLAUDE.md - Productivity App (Sistema de Gerenciamento de Tarefas)

## 🎯 Objetivo do Projeto

Desenvolver uma aplicação web de gerenciamento de tarefas simples e funcional utilizando **Next.js 15** e **tRPC**. O backend mantém as tarefas armazenadas em memória (sem persistência em banco de dados) e expõe endpoints via tRPC com suporte a validação de dados e tratamento de erros. A interface suporta renderização Server-Side (SSR) para a listagem inicial, scroll infinito (bônus) e formulários para criação e edição de tarefas com validação.

---

## 🛠️ Stacks

- **Framework**: Next.js (v15.5.26)
- **Linguagem**: TypeScript (v6.0.3)
- **Biblioteca de UI**: React (v19.3.0) & React DOM (v19.3.0)
- **API & Estado Assíncrono**:
  - tRPC (`@trpc/client`, `@trpc/server`, `@trpc/tanstack-react-query` v11.19.0)
  - TanStack React Query (v5.103.2)
- **Validação de Esquemas**: Zod (v4.6.5)
- **Serialização**: SuperJSON (v2.2.6) — transformer do tRPC que preserva tipos como `Date` entre servidor e cliente
- **Fronteira servidor/cliente**: `server-only` / `client-only` — impedem a importação de módulos no ambiente errado
- **Estilização**: Tailwind CSS (v4.3.3) via `@tailwindcss/postcss`
- **Formatação de Código**: Prettier (v3.9.9)

---

## ⚡ Comandos

### Desenvolvimento e Build

- `npm run dev`: Inicia o servidor de desenvolvimento do Next.js
- `npm run build`: Compila a aplicação para produção
- `npm run start`: Inicia o servidor em modo de produção

### Linting e Formatação

- `npm run lint`: Executa o linter padrão do Next.js (`next lint`)
- `npm run lint:check`: Verifica se o código atende às regras do Prettier
- `npm run lint:fix`: Corrige automaticamente os problemas de formatação via Prettier

---

## 🏗️ Arquitetura do Projeto

```
productivity-app/
├── src/
│   ├── app/                              # App Router do Next.js
│   │   ├── api/trpc/[trpc]/
│   │   │   └── route.ts                  # Endpoint HTTP do tRPC (Route Handler)
│   │   ├── tasks/
│   │   │   ├── page.tsx                  # Listagem (Server Component): prefetch da 1ª página + HydrationBoundary (SSR)
│   │   │   ├── task-list.tsx             # Client Component: infinite scroll (IntersectionObserver) e exclusão com toast
│   │   │   ├── new/
│   │   │   │   └── page.tsx              # Página de criação de tarefa (usa TaskForm)
│   │   │   └── [id]/edit/
│   │   │       └── page.tsx              # Página de edição (busca via tasks.byId; NOT_FOUND/BAD_REQUEST → notFound())
│   │   ├── layout.tsx                    # Layout raiz (TRPCReactProvider > ToastProvider > Header + children), importa input.css
│   │   └── page.tsx                      # Página inicial: redireciona para /tasks
│   ├── components/                       # Componentes de UI
│   │   ├── icons/                        # Ícones SVG (Close, Logo, Pencil, Plus, Trash)
│   │   ├── Box.tsx                       # Contêiner visual (borda, fundo branco, sombra)
│   │   ├── Card.tsx                      # Card de tarefa (título, descrição, data, links/botões de editar e excluir)
│   │   ├── Header.tsx                    # Cabeçalho com logo e botão "Criar nova tarefa"
│   │   ├── TaskForm.tsx                  # Formulário de criar/editar (validação Zod no cliente + erros do backend)
│   │   └── Toast.tsx                     # ToastProvider, componente Toast e hook useToast (success/warning/error)
│   ├── server/                           # Camada de domínio/dados (independente do tRPC)
│   │   └── tasks/
│   │       ├── task.schema.ts            # Schemas Zod e tipos (Task, inputs de create/update/delete/list)
│   │       ├── task.repository.ts        # Interface TaskRepository (contrato de acesso aos dados)
│   │       ├── task.memory-repository.ts # Implementação em memória (Map singleton em globalThis)
│   │       └── task.errors.ts            # Erros de domínio (TaskNotFoundError)
│   ├── trpc/                             # Configuração e routers do tRPC
│   │   ├── routers/
│   │   │   ├── _app.ts                   # Router raiz (combina os sub-routers)
│   │   │   └── tasks.ts                  # Router de tarefas: list, byId, create, update, delete
│   │   ├── client.tsx                    # Cliente tRPC / Provider no frontend (superjson)
│   │   ├── init.ts                       # Inicialização do tRPC: contexto (injeta taskRepository) e procedures
│   │   ├── query-client.ts               # TanStack Query Client (dehydrate/hydrate com superjson)
│   │   └── server.tsx                    # Proxy de opções tRPC para Server Components (SSR)
│   ├── input.css                         # Entrada do Tailwind CSS (importa tailwindcss e theme.css)
│   ├── theme.css                         # Tema do Tailwind v4 (@theme: cores primary, secondary, success, error, warning, info)
│   └── css.d.ts                          # Declaração de tipos para imports de arquivos .css
├── request.http                          # Requisições de exemplo às rotas de tasks (REST Client do VS Code)
├── postcss.config.mjs                    # Configuração do PostCSS (plugin @tailwindcss/postcss)
├── .editorconfig                         # Configurações do editor
├── .nvmrc                                # Versão do Node
├── package.json                          # Dependências e scripts do projeto
└── tsconfig.json                         # Configurações do TypeScript (modo `strict` ativado)
```

**Planejado (ainda não implementado)**: `src/helpers/` (funções utilitárias).

### Fluxo de uma requisição

```
Cliente (useTRPC) ──HTTP──► app/api/trpc/[trpc]/route.ts ─┐
Server Component (server.tsx) ────────────────────────────┤
                                                          ▼
                     trpc/routers/tasks.ts  (validação Zod + TaskNotFoundError → TRPCError NOT_FOUND)
                                                          ▼
                     ctx.taskRepository  (injetado em trpc/init.ts)
                                                          ▼
                     server/tasks/task.memory-repository.ts
```

### Fluxo do Frontend

- **Listagem (SSR)**: `tasks/page.tsx` (Server Component, `force-dynamic`) faz `prefetchInfiniteQuery` de `tasks.list` e entrega o estado desidratado via `HydrationBoundary`. `task-list.tsx` consome os dados já hidratados com `useSuspenseInfiniteQuery` e busca as próximas páginas com um sentinela observado por `IntersectionObserver`.
- **Mutações**: `TaskForm` (criar/editar) e `task-list.tsx` (excluir) usam `useMutation` com `trpc.tasks.*.mutationOptions`. Após o sucesso/erro invalidam `trpc.tasks.list.pathKey()` (ou `trpc.tasks.pathKey()`) para recarregar a lista, e exibem feedback via `useToast`.
- **Validação do formulário**: `TaskForm` valida com o `createTaskInput` (compartilhado de `task.schema.ts`) antes de enviar, bloqueando o envio sem título; falhas do backend aparecem como toast.
- **Estilos**: Tailwind CSS v4 (via `@tailwindcss/postcss`). As cores da marca e semânticas ficam em `theme.css` e geram utilities como `bg-primary` e `text-error`.

### Convenções do Backend

- **Repository pattern**: os routers acessam os dados apenas via `ctx.taskRepository` (interface `TaskRepository`). Trocar a memória por um banco exige só uma nova implementação registrada em `init.ts`.
- **Schemas compartilhados**: `task.schema.ts` não usa `server-only`, para que os mesmos schemas Zod possam validar os formulários no cliente.
- **Erros**: o repositório lança erros de domínio (`TaskNotFoundError`); o router os converte em `TRPCError` com o código HTTP adequado (`NOT_FOUND`). Falhas de validação Zod resultam em `BAD_REQUEST`.
- **Armazenamento**: o `Map` fica em `globalThis` para sobreviver ao HMR e ser compartilhado entre o route handler e o SSR. Em `development`, é populado com 50 tarefas de exemplo. O repositório sempre retorna cópias (inclusive do `Date`).
- **Paginação**: por cursor (`id` do último item da página anterior), ordenada por `dataCriacao` decrescente. `limit` entre 1 e 50 (padrão 10); a resposta é `{ items, nextCursor }`, com `nextCursor: null` quando não há mais páginas.
- **SuperJSON**: configurado em `init.ts`, `client.tsx` e `query-client.ts`. Em chamadas HTTP diretas, o input vai em `{"json": ...}` e a resposta vem em `result.data.json` (ver `request.http`).

### Endpoints (`tasks.*`)

| Procedure      | Tipo     | Input                         | Retorno                            |
| -------------- | -------- | ----------------------------- | ---------------------------------- |
| `tasks.list`   | query    | `{ cursor?, limit? }`         | `{ items, nextCursor }`            |
| `tasks.byId`   | query    | `{ id }`                      | `Task` (ou `NOT_FOUND`)            |
| `tasks.create` | mutation | `{ titulo, descricao? }`      | `Task`                             |
| `tasks.update` | mutation | `{ id, titulo?, descricao? }` | `Task` (ou `NOT_FOUND`)            |
| `tasks.delete` | mutation | `{ id }`                      | `{ success, id }` (ou `NOT_FOUND`) |

---

## 📋 Funcionalidades

### 1. Backend & Operações CRUD (tRPC)

- **Modelo de Tarefa**:
  - `id`: Identificador único (UUID)
  - `titulo`: String (obrigatório)
  - `descricao`: String (opcional)
  - `dataCriacao`: `Date` (gerada no servidor)
- **Armazenamento**: Em memória durante a execução da aplicação.
- **Endpoints**:
  - `Criar Tarefa`: Validação do campo obrigatório `titulo` via Zod.
  - `Listar Tarefas`: Suporte a paginação para infinite scroll.
  - `Atualizar Tarefa`: Edição de tarefas existentes com tratamento para IDs inexistentes.
  - `Deletar Tarefa`: Remoção direta de itens com retorno de status/erro.

### 2. Frontend & UX (Next.js & React)

- **Listagem de Tarefas**:
  - Renderização via **SSR** (Server-Side Rendering) para pré-carregamento das tarefas.
  - Remoção de tarefas diretamente na interface com feedback visual (mensagens de sucesso/erro).
  - **Infinite Scroll** para carregamento incremental conforme rolagem da página.
- **Criação / Edição de Tarefas**:
  - Formulário funcional com gerenciamento de estado via React Hooks.
  - Validação no lado do cliente (bloqueio de envio sem título) e exibição de erros retornados pelo backend.
- **Tratamento de Estados**: Feedback visual apropriado para estados de _carregamento_ (loading), _sucesso_ e _falha_.
