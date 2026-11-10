# Desenvolvimento

## Requisitos

- Node.js >= 22
- pnpm >= 11
- Docker e Docker Compose
- Git

## Preparar o ambiente local

```bash
cp apps/api/.env.example apps/api/.env
openssl rand -hex 32
```

Defina o valor gerado como `JWT_SECRET` em `apps/api/.env`. Os demais valores
do arquivo de exemplo são destinados ao desenvolvimento local. Se alterar as
credenciais do PostgreSQL ou Redis, mantenha as URLs correspondentes
(`DATABASE_URL` e `REDIS_URL`) consistentes. Não versione arquivos `.env`.

Instale as dependências e inicie PostgreSQL e Redis:

```bash
pnpm install --frozen-lockfile
docker compose --env-file apps/api/.env -f infrastructure/docker/docker-compose.yml up -d --wait
```

- PostgreSQL: `localhost:5433`
- Redis: `localhost:6380`

A API usa PostgreSQL. Redis está disponível na infraestrutura local, mas não é
necessário para os fluxos atualmente implementados.

## Banco de dados

Gere o cliente Prisma e aplique as migrations no banco local:

```bash
pnpm --filter api db:generate
pnpm --filter api db:migrate
```

Use `pnpm --filter api db:status` para conferir o estado. `db:deploy` aplica
migrations já versionadas em outros ambientes; `db:migrate` é destinado ao
desenvolvimento. Não use `prisma db push --accept-data-loss` nem redefina um
banco com dados para sincronizar o schema.

Se um banco local já tiver o schema inicial criado por `db push`, só marque a
migration inicial como aplicada depois de verificar que o schema corresponde a
`apps/api/prisma/migrations/20261106170000_init/migration.sql`:

```bash
pnpm --filter api exec prisma migrate resolve --applied 20261106170000_init
```

Esse comando registra um baseline; não recria tabelas. Não o execute sem
verificar o schema existente.

## Executar

Inicie API e web em terminais separados:

```bash
pnpm --filter api start:dev
pnpm --filter web dev
```

- Web: `http://localhost:5173`
- API: `http://localhost:3001`
- Swagger: `http://localhost:3001/docs`
- Health check da API e conexão com o banco: `http://localhost:3001/health`

## Funcionalidades atualmente implementadas

### Autenticação

- `POST /auth/register` cria usuário, empresa e associação `OWNER`.
- `POST /auth/login` autentica com e-mail e senha.
- `GET /auth/me` exige `Authorization: Bearer <access-token>` e retorna o
  perfil autenticado e suas associações.
- As senhas são armazenadas com Argon2id; o access token JWT expira em 15
  minutos.
- O cadastro exige `name`, `email`, `password` (mínimo de 12 caracteres) e
  `companyName`. Campos não permitidos, incluindo identificador de tenant,
  são rejeitados.

### Empresas, membros e convites

- `GET /companies` lista as empresas associadas ao usuário autenticado.
- Rotas `/companies/:companyId/members` permitem consultar e gerenciar membros;
  membros e papéis são verificados pela associação persistida no servidor.
- Rotas `/companies/:companyId/invitations` permitem criar, listar e revogar
  convites. `POST /invitations/accept` aceita um convite com usuário
  autenticado.
- `OWNER` e `ADMIN` podem gerenciar membros e convites, com restrições para
  proteger o papel `OWNER`; a empresa deve manter pelo menos um `OWNER`.
- O token de convite é exibido apenas na criação e seu hash SHA-256 é
  armazenado. Convites expiram em sete dias; não há envio de e-mail integrado.

### Frontend

O frontend integra autenticação, perfil, empresas, membros e convites com a
API. As páginas de catálogo, receitas, estoque, movimentos e alertas usam
dados de demonstração em memória: não são persistidas e não representam regras
de produto aprovadas. O token de acesso fica em memória; após recarregar a
página, é necessário autenticar novamente.

## Verificações

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm test:e2e
pnpm build
pnpm test:governance
```

Os testes E2E da API requerem uma instância PostgreSQL acessível com o schema
atualizado. Consulte os scripts da raiz e de cada workspace para executar
verificações isoladas.

## Segurança

- Não versione credenciais, tokens ou arquivos `.env`.
- A API deriva a identidade do usuário do JWT e verifica a associação com a
  empresa; um `companyId` fornecido pelo cliente não concede acesso.
- Mantenha autorização e cálculos operacionais no backend. O frontend não é
  uma fronteira de segurança.
