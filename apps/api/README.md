# PULSO API

API REST do PULSO construída com NestJS, Prisma e PostgreSQL. Os fluxos
atualmente implementados cobrem health check, autenticação, empresas,
associações de membros e convites. A documentação OpenAPI fica disponível em
`/docs` durante a execução local.

## Desenvolvimento local

Siga o guia da raiz para configurar variáveis de ambiente, iniciar PostgreSQL
e aplicar migrations: [`docs/development/README.md`](../../docs/development/README.md).

Com as dependências instaladas e o banco local preparado:

```bash
pnpm --filter api start:dev
```

Endpoints locais:

- API: `http://localhost:3001`
- Swagger: `http://localhost:3001/docs`
- Health check: `http://localhost:3001/health`

## Comandos

```bash
pnpm --filter api build
pnpm --filter api lint
pnpm --filter api typecheck
pnpm --filter api test
pnpm --filter api test:e2e
pnpm --filter api db:status
```

Para gerar o cliente Prisma e gerenciar migrations, consulte o guia de
[desenvolvimento e banco de dados](../../docs/development/README.md). Não use
operações de reset ou sincronização destrutiva em bancos com dados.
