# ADR-0001: Catálogo tenant-scoped e identidade de estoque

- **Status:** Proposed
- **Date:** 2026-11-09
- **Decision owner:** Responsável humano do projeto, com revisão técnica e de produto

## Context

PULSO precisa modelar categorias, produtos comercializáveis, ingredientes e saldos para empresas isoladas. O schema atual não tem essas entidades. Uma abstração compartilhada pode evitar duplicar ledger e saldo, mas produtos vendáveis e ingredientes representam coisas distintas e não devem compartilhar saldo acidentalmente.

## Decision

Propor `Product` e `Ingredient` como entidades distintas, cada uma com categoria tenant-scoped. Propor um `InventoryItem` comum associado a exatamente um `Product` ou `Ingredient` (XOR), com saldo próprio por item. Todo registro operacional terá `companyId`; relações entre registros tenant-scoped usarão FK composta `(companyId, id)`, além de validação de Membership e filtro no serviço.

## Alternatives considered

- Tabelas e serviços de estoque distintos para produto e ingrediente: FKs mais simples, mas lógica de movimentos duplicada.
- Um estoque compartilhado para produto e ingrediente: pode representar uso comum, mas ambíguo para consumo e integração futura com venda; não recomendado para MVP.

## Consequences

Ledger e consultas podem compartilhar implementação sem fundir identidade de produto e insumo. Constraints XOR e FKs compostas podem exigir SQL manual em migrations. Regras sobre quais tipos têm estoque controlado e permissões ainda dependem do responsável pelo produto.

## Approval

Pendente. Manter `Proposed` até aprovação explícita; não implementado.
