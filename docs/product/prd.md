# PULSO PRD — Camada operacional para restaurantes

- **Status:** Proposed — aguardando validação de processos e aprovação do Founder/CTO.
- **Revisão:** 0.1
- **Data:** 2026-11-09
- **Fonte de autorização:** pedido do Founder/CTO para planejar a Sprint 2 em 2026-11-09. A autorização é para planejamento, não para implementação.
- **Product owner:** a designar pelo Founder/CTO; o papel Product Owner prepara critérios, mas não aprova a estratégia.

## Problema e evidência

O objetivo autorizado para discovery é planejar uma camada operacional PULSO
para restaurantes que cubra categorias, produtos, ingredientes, receitas,
unidades de medida, estoque, movimentações e alertas de estoque mínimo.

**Evidência de problema/processo ainda não coletada:** não foram realizadas
entrevistas ou observações com restaurantes. Este PRD registra o objetivo
informado, não afirma que os fluxos de compra, recebimento, preparação,
desperdício ou contagem física foram validados.

## Usuários-alvo e trabalhos a realizar

**Hipótese a validar:** pessoas que mantêm catálogo e fichas técnicas e que
registram ou consultam estoque em uma empresa de restaurante. Não está decidido
se são proprietários, administradores, gestores de cozinha, estoquistas ou
outros cargos; esses papéis de negócio não devem ser confundidos com
`OWNER`/`ADMIN`/`MEMBER` da autenticação.

Trabalhos candidatos: organizar produtos/insumos; registrar composição de
produtos; acompanhar saldo dos itens controlados; registrar movimentos;
identificar itens no mínimo. Frequência, dispositivos, exceções e impacto
operacional dependem de discovery com usuários.

## Resultados desejados e medidas

**Resultados propostos, sem metas aprovadas:**

- Usuários conseguem cadastrar e consultar o catálogo autorizado da empresa.
- Fichas técnicas guardam composições com unidades compatíveis, se as regras
  forem aprovadas.
- Saldo consultado é consistente com o histórico de movimentos.
- Itens que atendem ao limiar aprovado aparecem na consulta de alertas.
- A API bloqueia acesso ou associação entre empresas sem revelar dados.

**Sinais a instrumentar/medir após validação:** conclusão de fluxos por etapa;
erros de validação/duplicidade; movimentos aceitos e recusados; discrepâncias
entre ledger e saldo; itens em alerta; tentativas de acesso cross-tenant
bloqueadas. Baseline, período, privacidade, retenção e metas dependem de
aprovação. Nenhum número-alvo é inventado neste PRD.

## Escopo

### Incluído na proposta de MVP

1. Categorias separadas para produtos e ingredientes.
2. Cadastro, consulta, edição e ciclo de vida de produtos comercializados e
   ingredientes/insumos.
3. Unidades controladas e conversões aprovadas para quantidades operacionais.
4. Receitas/fichas técnicas ligando produto a ingredientes e quantidades.
5. Estoque por item controlado, sem compartilhar saldo entre produto e
   ingrediente.
6. Movimentações manuais rastreáveis e consulta de alerta de estoque mínimo,
   sujeito a decisão sobre os casos de entrada, ajuste e contagem física.
7. Isolamento multi-tenant na API e no modelo de persistência.

O escopo acima ainda é proposto. Histórias, critérios, modelo, endpoints e
dependências detalhados estão no
[plano de discovery da Sprint 2](../planning/sprint-2-operational-layer.md).

### Exclusões propostas / dependentes de confirmação

- Integração POS/vendas, baixa automática por venda ou consumo, qualquer
  trabalho de Sprint 3 e IA operacional.
- Fluxo de compras/fornecedores, recebimento ligado a pedido/nota, lotes,
  múltiplos locais e transferências.
- Notificações externas, previsão de demanda, analytics avançado, perdas
  teóricas, custos de mão de obra e margem/preço sugerido.
- Cálculo/exibição de custo de receita no MVP, salvo aprovação explícita de
  política de negócio.
- Inventário físico, contagem cíclica e reconciliação automática ainda não
  estão definidos como escopo. O usuário pediu que o processo seja investigado;
  isso não os inclui automaticamente no MVP.

As exclusões sobre recebimento simples, perdas/desperdícios e contagem física
precisam de decisão após discovery. Não tratar uma entrada manual como
equivalente a um processo de compra/recebimento validado.

## Requisitos funcionais propostos

- **FR-01 Catálogo:** criar, listar, consultar e editar categorias, produtos e
  ingredientes por empresa, com ciclo de arquivamento definido antes da
  implementação.
- **FR-02 Unidades:** expor unidades aceitas e validar conversões somente
  segundo dimensões e fatores aprovados.
- **FR-03 Fichas:** associar ficha técnica a um produto e a ingredientes
  elegíveis, com quantidade e unidade compatível; preservar histórico conforme
  política aprovada.
- **FR-04 Estoque:** configurar quais produtos/ingredientes são controlados e
  consultar saldo por item, sem compartilhar saldo.
- **FR-05 Movimentos:** registrar eventos manuais conforme tipos e regras
  aprovados; consultar histórico sem editar ou apagar movimentos existentes.
- **FR-06 Alertas:** consultar itens conforme limite e semântica de mínimo
  aprovados; canal, resolução e deduplicação não estão definidos.
- **FR-07 Autorização:** validar Membership e autorização no servidor; impedir
  referências e acesso entre empresas.

Estes requisitos não resolvem campos obrigatórios, duplicidade, permissões,
estados de receita, saldo negativo, movimentos ou limiar de alertas. Consulte
as pendências abaixo e o plano vinculado.

## Requisitos não funcionais propostos

- Regras e autorização são aplicadas no backend; frontend nunca é barreira de
  segurança.
- Toda leitura e escrita é limitada à empresa cuja Membership autenticada foi
  validada; referências a outro tenant são rejeitadas também por integridade
  referencial onde viável.
- Inputs e enums são validados em limites de confiança; erros são explícitos e
  não revelam a existência de dados de outra empresa.
- Quantidades e valores monetários usam decimal exato (`NUMERIC` /
  `Prisma.Decimal`); REST representa decimais como strings. Escala,
  arredondamento e limites aguardam decisão.
- Ledger, saldo e movimentos preservam consistência transacional e trilha de
  histórico; concorrência e idempotência têm testes de integração PostgreSQL.
- Interface é acessível, responsiva, tem estados de carregamento/vazio/erro e
  substitui a experiência do template Vite antes do encerramento da Sprint.
- Migrations são versionadas, aditivas por padrão e revisadas; nenhuma
  migration destrutiva, reset ou deploy é autorizado por este PRD.

## Histórias e critérios de aceitação

As histórias completas H1–H4 e seus critérios preliminares estão em
[Histórias e critérios de aceitação](../planning/sprint-2-operational-layer.md#6-histórias-e-critérios-de-aceitação-propostos).
Elas cobrem catálogo, fichas, estoque/movimentos/alertas e isolamento de empresa.
Os critérios são propostas e não liberam implementação.

## Regras de negócio, estados e erros

**Propostas técnicas a confirmar:** quantidades positivas; unidade compatível;
referência tenant-scoped; movimentos imutáveis com correção por reversão;
saldo e ledger transacionais; erro sem estado parcial; alerta consultável.

**Não aprovados:** normalização/duplicidade; campos obrigatórios; arquivamento;
matriz de papéis; estados e publicação/versionamento de fichas; rendimento;
tipos/motivos/reversão de movimentos; saldo negativo; compra/recebimento;
perdas; contagem física; mínimo, igualdade e resolução de alerta; custo,
moeda e arredondamento.

Planejar respostas para não autenticado, membership/permissão insuficiente,
payload inválido, associação incompatível, entidade arquivada, duplicidade,
conflito concorrente, idempotência e saldo insuficiente, com códigos/payloads
finais definidos no contrato de API.

## Papéis, permissões e limites de tenant

Não presumir autorização operacional dos papéis `OWNER`, `ADMIN` e `MEMBER`.
Definir a matriz de leitura, criação, edição, arquivamento, publicação e
movimentação antes de iniciar as rotas. A API deve derivar a identidade do JWT,
validar Membership persistida e aplicar escopo de empresa em toda consulta e
mutação. `companyId` da URL/body não é prova de autorização.

## Dependências e restrições

- Decisões de produto e validação com operadores precedem o Ready gate das
  tarefas afetadas.
- Cadastros/unidades precedem receitas e configuração do estoque; receitas e
  estoque dependem das identidades e unidades aprovadas.
- API e schema precedem integração final da interface.
- Ledger/saldo dependem de decisões sobre movimentos, mínimos, saldo negativo,
  idempotência e concorrência.
- PostgreSQL deve estar disponível para testes de constraints, transações e
  concorrência. Nenhuma execução de migration está autorizada nesta fase.

## Riscos, pressupostos e perguntas em aberto

O [plano da Sprint 2](../planning/sprint-2-operational-layer.md) contém
matriz de risco, sequência, estimativas e checklist de aprovação. As principais
perguntas do discovery são:

1. O MVP cobre entrada manual simples ou um processo de recebimento? Há
   fornecedores, pedido, conferência, unidade de compra ou custo?
2. Perdas/desperdícios são eventos próprios? Como diferem de ajuste e saída?
3. O que constitui uma contagem física e como divergências devem ser
   reconciliadas?
4. Receita é só ficha técnica ou registra produção/preparação real? Deve
   baixar estoque?
5. Quais papéis empresariais realizam e aprovam cada ação?
6. Qual catálogo/unidade-base, conversões e precisão são usados na operação?
7. Que itens têm estoque, admite-se saldo negativo, e qual o ciclo de vida de
   um alerta de mínimo?
8. Há metas, baseline, volume e janela de medição que permitam fixar sucesso
   quantitativo?

## Aprovação

**Aguardando decisão do Founder/CTO.** A autorização de 2026-11-09 aprova
somente o trabalho de planejamento. O PRD, o escopo do MVP, as prioridades e
as regras de negócio permanecem Proposed. A implementação só começa após
aprovação explícita do PRD/plano, decisões bloqueadoras e ADRs aplicáveis.
