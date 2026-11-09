# ADR-0004: Versionamento e custo de receitas

- **Status:** Proposed
- **Date:** 2026-11-09
- **Decision owner:** Responsável humano do projeto, com revisão técnica e aprovação de produto

## Context

Uma ficha técnica pode mudar ao longo do tempo, enquanto saldos e análises futuras podem precisar da composição histórica. Custo de receita não foi definido como requisito de negócio e depende de política de custo dos ingredientes.

## Decision

Como proposta técnica, modelar `Recipe` associado a `Product` e linhas
`RecipeItem` associadas a `Ingredient` tenant-scoped. O modelo pode suportar
versões/drafts para preservar revisões, mas não define se publicação,
imutabilidade ou recálculo são regras de produto. Cálculo de custo fica fora do
MVP até aprovação. Se aprovado depois, avaliar soma de quantidade convertida ×
custo unitário dividida pelo rendimento, sem tratar o resultado como preço ou
custo contábil completo.

## Alternatives considered

- Uma única ficha mutável: mais simples, mas altera silenciosamente o histórico.
- Versionamento imutável: preserva histórico, mas exige fluxo de draft/publicação e regras de seleção da versão ativa.
- Custos médios ponderados ou FIFO: escolhas de política financeira com efeitos diferentes; não podem ser inferidas da implementação.

## Consequences

Product Owner/Founder-CTO precisam definir rendimento, estados, publicação,
edição de versões, componentes de custo e valor atual versus snapshot em um
requisito de produto aprovado. Este ADR não aceita essas regras. Se custo for
aprovado, ADR de moeda/precisão também precisa ser aceito. Não incluir custos de
mão de obra, perdas, embalagem ou margem por inferência.

## Approval

Pendente. Manter `Proposed` até aprovação explícita; não implementado.
