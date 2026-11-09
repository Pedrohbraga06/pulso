# Desenvolvimento

## Requisitos locais

- Node.js >= 22
- pnpm >= 11
- Docker + Docker Compose
- Git

## Instalação

```bash
cp apps/api/.env.example apps/api/.env
pnpm install
openssl rand -hex 32
```

Set the generated value as `JWT_SECRET` in `apps/api/.env`. Keep it private and
use a different value in each deployed environment.

## Infraestrutura local

```bash
docker compose --env-file apps/api/.env -f infrastructure/docker/docker-compose.yml up -d --wait
```

### Serviços locais

- PostgreSQL: `localhost:5433`
- Redis: `localhost:6380`

## Execução

### API

```bash
pnpm --dir apps/api run start:dev
```

A API estará disponível em:

- `http://localhost:3001`
- `http://localhost:3001/docs` (Swagger)
- `http://localhost:3001/health` (health check)

### Identidade e autenticação

- `POST /auth/register` cria o usuário e a primeira empresa atomicamente; o usuário recebe a associação `OWNER`.
- `POST /auth/login` autentica por e-mail e senha.
- `GET /auth/me` exige `Authorization: Bearer <access-token>` e retorna apenas o perfil autenticado e suas associações.
- Senhas são armazenadas com Argon2id; access tokens JWT expiram em 15 minutos.
- O JWT contém a identidade do usuário, não um `tenantId` escolhido pelo cliente. Campos não permitidos no cadastro são rejeitados.

O cadastro exige `name`, `email`, `password` (mínimo de 12 caracteres) e `companyName`.

### Identidade e autenticação

- `POST /auth/register` cria o usuário e a primeira empresa atomicamente; o usuário recebe a associação `OWNER`.
- `POST /auth/login` autentica por e-mail e senha.
- `GET /auth/me` exige `Authorization: Bearer <access-token>` e retorna apenas o perfil autenticado e suas associações.
- Senhas são armazenadas com Argon2id; access tokens JWT expiram em 15 minutos.
- O JWT contém a identidade do usuário, não um `tenantId` escolhido pelo cliente. Campos não permitidos no cadastro são rejeitados.

### Identidade e autenticação

- `POST /auth/register` cria o usuário e a primeira empresa atomicamente; o usuário recebe a associação `OWNER`.
- `POST /auth/login` autentica por e-mail e senha.
- `GET /auth/me` exige `Authorization: Bearer <access-token>` e retorna apenas o perfil autenticado e suas associações.
- Senhas são armazenadas com Argon2id; access tokens JWT expiram em 15 minutos.
- O JWT contém a identidade do usuário, não um `tenantId` escolhido pelo cliente. Campos não permitidos no cadastro são rejeitados.

O cadastro exige `name`, `email`, `password` (mínimo de 12 caracteres) e `companyName`.

### Empresas, 
O cadastro exige `name`, `email`, `password` (mínimo de 12 caracteres) e `companyName`.

### Empresas, 
### Empresas, Memberships e convites

- `GET /companies` lista as empresas associadas ao usuário autenticado.
- `GET /companies/:companyId/members` e `GET /companies/:companyId/members/:membershipId` exigem Membership na empresa.
- `POST /companies/:companyId/members` associa um usuário existente; `DELETE /companies/:companyId/members/:membershipId` remove uma associação.
- `PATCH /compadon't ask again for file operations when in this repo (~/pulso)
  3. No, and tell Copilot what to do differently (Esc to stop)nies/:companyId/members/:membershipId/role` altera um papel autorizado.
- `POST /companies/:companyId/invitations` cria um convite; `GET /companies/:companyId/invitations` lista convites e `DELETE /companies/:companyId/invitations/:invitationId` revoga um convite pendente.
- `POST /invitations/accept` aceita convite com o usuário autenticado.
- OWNER e ADMIN podem gerenciar membros e convites. Somente OWNER pode conceder, alterar ou remover OWNER. ADMIN não pode alterar/remover OWNER. Uma empresa sempre mantém ao menos um OWNER.
- Convites duram 7 dias. O token aleatório é retornado uma única vez na criação; apenas seu hash SHA-256 é armazenado. Se o convite tiver e-mail associado, ele deve corresponder ao e-mail do usuário autenticado.
- Não há envio de e-mail nesta etapa. O contrato `InvitationDeliveryPort` isola a futura integração; por enquanto, o responsável pelo convite deve entregar o token por um canal externo seguro.
- Rotas de empresa resolvem o usuário pelo JWT e verificam a Membership persistida em cada requisição; o `companyId` da URL não concede acesso.

Os endpoints de membros e convites exigem access token. A listagem de membros é permitida a qualquer membro da empresa; alterações e gestão de convites exigem OWNER ou ADMIN.

### Web

```bash
pnpm --dir apps/web run dev
```

## Prisma

```bash
pnpm --filter api db:generate
pnpm --filter api db:migrate
```

`db:migrate` cria migrations versionadas durante o desenvolvimento. Para aplicar
migrations já versionadas em outro ambiente, use `pnpm --filter api db:deploy`.
Não use `prisma db push --accept-data-loss` em bancos com dados.

A migration `20261106180600_company_invitations` adiciona a tabela de convites,
sem recriar `User`, `Company` ou `Membership`. Confirme o estado antes e depois
com `pnpm --filter api db:status`; nunca use reset para sincronizar o banco.

Se o banco local já tiver o schema inicial aplicado por `db push`, confirme que
ele corresponde a `prisma/migrations/20261106170000_init/migration.sql` antes de
marcá-lo como baseline:

```bash
pnpm --filter api exec prisma migrate resolve --applied 20261106170000_init
```

Esse baseline registra a migration sem recriar tabelas nem apagar dados. Não o
execute em um banco cujo schema não tenha sido verificado.

## Validação

```bash
pnpm install --frozen-lockfile
pnpm typecheck
pnpm test
pnpm test:e2e
pnpm build
pnpm lint
```

## Observações de segurança

- `.env` e arquivos sensíveis devem ficar localmente e nunca versionados.
- A API deve validar o tenant autenticado e não aceitar `tenant_id` arbitrário do cliente.
- As consultas e cálculos financeiros devem acontecer no backend.
