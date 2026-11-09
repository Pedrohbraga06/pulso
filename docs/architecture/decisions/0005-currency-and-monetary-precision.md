# ADR-0005: Moeda e precisão monetária

- **Status:** Proposed
- **Date:** 2026-11-09
- **Decision owner:** Responsável humano do projeto, com revisão técnica e aprovação de produto/financeiro

## Context

O schema atual de `Company` não declara moeda-base. Eventual custo de receita exige aritmética decimal exata, política de arredondamento e moeda compatível entre ingredientes.

## Decision

Propor `NUMERIC`/Prisma `Decimal` para valores monetários e impedir ponto flutuante. Transportar decimais como strings e acompanhar valores por moeda ISO 4217. Precisão intermediária deve ser preservada; arredondar somente em escala e ponto aprovados. Não calcular totais entre moedas diferentes sem política explícita.

## Alternatives considered

- `float`/JavaScript `number`: não oferece representação decimal exata.
- Inteiro em subunidade monetária: pode funcionar para valores já arredondados, mas não é adequado a quantidades e custos unitários fracionários antes do arredondamento.
- Assumir uma moeda global: simplifica MVP, mas não foi estabelecido por requisito.

## Consequences

Responsável pelo produto deve aprovar moeda por empresa, escala e arredondamento antes de custo. Tornar moeda obrigatória em empresas existentes requer backfill e migration expand-contract; não pode ser assumido nem executado sem plano aprovado.

## Approval

Pendente. Manter `Proposed` até aprovação explícita; não implementado.
