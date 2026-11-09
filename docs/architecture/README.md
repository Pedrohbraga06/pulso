# Arquitetura

## Visão geral

O PULSO utiliza um monorepo com apps e packages focados em uma base compartilhada para múltiplos segmentos. A primeira implementação está direcionada a restaurantes e lanchonetes.

## Estrutura

- `apps/api`: backend NestJS
- `apps/web`: frontend React/Vite
- `packages/contracts`: contratos e tipos compartilhados
- `infrastructure/docker`: infraestrutura local e serviços complementares

## Decisões principais

- Arquitetura modular em monorepo
- Backend como fonte de verdade para regras de negócio e métricas
- Prisma como camada de persistência com PostgreSQL
- Redis para serviços auxiliares e futuras filas / cache
- Swagger para documentação da API
- Isolamento por tenant em nível de aplicação e banco de dados

## Sprint 0

A fundação técnica inclui:

- workspace do pnpm
- scaffolding das aplicações
- containers de infraestrutura local
- conexão Prisma e schema inicial
- health check e documentação da API
- validações de build e testes
