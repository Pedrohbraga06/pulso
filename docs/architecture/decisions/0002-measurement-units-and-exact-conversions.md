# ADR-0002: Unidades de medida e conversões exatas

- **Status:** Proposed
- **Date:** 2026-11-09
- **Decision owner:** Responsável humano do projeto, com revisão técnica e aprovação de produto para unidades e precisão

## Context

Receitas e estoque exigem comparação de quantidades. Conversões aproximadas ou entre dimensões incompatíveis podem produzir consumo e custo incorretos.

## Decision

Propor catálogo controlado de unidades com dimensão, fator racional numerador/denominador e unidade canônica por dimensão. Converter somente unidades da mesma dimensão no MVP; armazenar quantidades como `NUMERIC`/Prisma `Decimal`, nunca ponto flutuante. Massa-volume requer dado explícito por ingrediente e fica fora do escopo proposto.

## Alternatives considered

- Valores livres de unidade: flexíveis, mas não permitem validação/conversão determinística.
- Conversões em ponto flutuante: comuns em interfaces, mas não apropriadas para saldos e custos precisos.
- Conversão universal entre massa e volume: depende de densidade específica e pode ser imprecisa.

## Consequences

O catálogo inicial, precisão, arredondamento e unidade-base devem ser aprovados. Contratos de API devem transportar decimais em string e a conversão deve ocorrer no backend. Unidades globais precisam de gestão/versionamento compatível com dados existentes.

## Approval

Pendente. Manter `Proposed` até aprovação explícita; não implementado.
