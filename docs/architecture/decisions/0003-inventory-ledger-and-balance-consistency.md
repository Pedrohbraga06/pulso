# ADR-0003: Ledger de estoque e consistência do saldo

- **Status:** Proposed
- **Date:** 2026-11-09
- **Decision owner:** Responsável humano do projeto, com revisão técnica e aprovação de produto para movimentos/saldo

## Context

O estoque mínimo e os saldos precisam ser explicáveis e resistentes a falhas, retries e operações concorrentes. Movimentos registrados são histórico operacional e não devem ser apagados.

## Decision

Propor ledger append-only de movimentos e projeção `InventoryBalance`, atualizados na mesma transação. Não permitir endpoint para editar/apagar movimentos; correções geram reversão e novo evento. Serializar alterações por item, adicionar idempotência tenant-scoped e validar saldo antes do commit. Se saldo negativo for proibido, garantir a regra atomicamente e por constraint.

## Alternatives considered

- Saldo mutável sem ledger: simples, mas não preserva trilha de auditoria.
- Saldo calculado sempre por soma do ledger: consistente em princípio, porém potencialmente caro; manter projeção transacional facilita leitura.
- Correção por edição do movimento: perde auditabilidade.

## Consequences

É necessário testar concorrência com PostgreSQL real, transações/rollback, idempotência e reconciliação da projeção. Tipo de movimento, política de estoque negativo, reversão parcial, retenção e mecanismo de imutabilidade no banco dependem de aprovação. Locks e constraints devem ser avaliados em migration aditiva.

## Approval

Pendente. Manter `Proposed` até aprovação explícita; não implementado.
