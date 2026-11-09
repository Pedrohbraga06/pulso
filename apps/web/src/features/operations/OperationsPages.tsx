import { useMemo, useState } from 'react';
import { demoInventory, demoMovements, demoRecipes } from '../../demo/data';
import { Icon } from '../../components/Icon';
import {
  Badge,
  Button,
  DemoBanner,
  DemoDialog,
  EmptyState,
  PageHeader,
  Panel,
} from '../../components/ui';

function SearchInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange(value: string): void;
  placeholder: string;
}) {
  return (
    <label className="search-box">
      <Icon name="search" size={17} />
      <span className="sr-only">{placeholder}</span>
      <input onChange={(event) => onChange(event.target.value)} placeholder={placeholder} value={value} />
    </label>
  );
}

export function InventoryPage() {
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const rows = demoInventory.filter((item) => `${item.name} ${item.category}`.toLowerCase().includes(search.toLowerCase()));
  return (
    <>
      <DemoBanner />
      <PageHeader description="Tenha uma leitura clara dos itens acompanhados pela operação." eyebrow="OPERAÇÃO" title="Estoque" action={<Button icon="plus" onClick={() => setDialogOpen(true)} type="button">Registrar movimento</Button>} />
      <div className="inventory-summary">
        <div><span className="inventory-summary__label">Itens acompanhados</span><strong>38</strong><small>dados demonstrativos</small></div>
        <div><span className="inventory-summary__label">Estoque saudável</span><strong className="text-teal">31</strong><small>81,5% da amostra</small></div>
        <div><span className="inventory-summary__label">Precisam de atenção</span><strong className="text-amber">7</strong><small>2 abaixo do mínimo</small></div>
        <div className="inventory-summary__spark"><span>Visão ilustrativa do saldo</span><svg role="img" aria-label="Tendência demonstrativa do saldo de estoque" viewBox="0 0 180 56"><path d="M2 42 C22 38 25 27 44 31 S68 17 86 23 S111 38 130 21 S154 19 178 8" /><path d="M2 42 C22 38 25 27 44 31 S68 17 86 23 S111 38 130 21 S154 19 178 8 L178 55 L2 55Z" className="spark-fill" /></svg></div>
      </div>
      <Panel className="catalog-panel" title="Itens de estoque" subtitle="Saldos e mínimos em um cenário demonstrativo">
        <div className="table-toolbar"><SearchInput onChange={setSearch} placeholder="Buscar item..." value={search} /><button className="button button--secondary" type="button"><Icon name="filter" size={16} /> Filtros <span className="toolbar-caret">⌄</span></button></div>
        {rows.length === 0 ? <EmptyState description="Tente outro termo de busca." icon="search" title="Nenhum item encontrado" /> : (
          <div className="table-scroll"><table className="data-table"><thead><tr><th>Item</th><th>Categoria</th><th>Saldo atual</th><th>Estoque mínimo</th><th>Situação</th><th><span className="sr-only">Ações</span></th></tr></thead><tbody>
            {rows.map((item) => <tr key={item.name}><td><span className="table-primary">{item.name}</span><span className="table-secondary">Ingrediente controlado · demonstração</span></td><td>{item.category}</td><td className="table-primary">{item.quantity}</td><td>{item.minimum}</td><td><Badge tone={item.status === 'Saudável' ? 'success' : item.status === 'Atenção' ? 'warning' : 'danger'}>{item.status}</Badge></td><td><button className="icon-button table-action" aria-label={`Ver demonstração do estoque de ${item.name}`} type="button"><Icon name="arrow" size={16} /></button></td></tr>)}
          </tbody></table></div>
        )}
      </Panel>
      <DemoDialog onClose={() => setDialogOpen(false)} open={dialogOpen} title="Registrar movimentação de estoque" />
    </>
  );
}

export function MovementsPage() {
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const rows = useMemo(() => demoMovements.filter((item) => `${item.item} ${item.type} ${item.reason}`.toLowerCase().includes(search.toLowerCase())), [search]);
  return (
    <>
      <DemoBanner />
      <PageHeader description="Histórico ilustrativo de entradas, saídas e ajustes." eyebrow="OPERAÇÃO" title="Movimentações" action={<Button icon="plus" onClick={() => setDialogOpen(true)} type="button">Nova movimentação</Button>} />
      <div className="movement-metrics"><span><Icon name="movement" /><strong>126</strong><small>movimentos no mês</small></span><span><Icon name="arrow" /><strong>74</strong><small>entradas</small></span><span><Icon name="arrow" /><strong>52</strong><small>saídas e ajustes</small></span></div>
      <Panel className="catalog-panel">
        <div className="table-toolbar"><SearchInput onChange={setSearch} placeholder="Buscar item ou motivo..." value={search} /><button className="button button--secondary" type="button"><Icon name="calendar" size={16} /> Este mês <span className="toolbar-caret">⌄</span></button></div>
        {rows.length === 0 ? <EmptyState description="Tente outro termo de busca." icon="search" title="Nenhum movimento encontrado" /> : (
          <div className="table-scroll"><table className="data-table"><thead><tr><th>Item</th><th>Tipo</th><th>Quantidade</th><th>Motivo</th><th>Responsável</th><th>Data</th></tr></thead><tbody>
            {rows.map((item) => <tr key={`${item.item}-${item.time}`}><td><span className="table-primary">{item.item}</span><span className="table-secondary">Registro demonstrativo</span></td><td><Badge tone={item.type === 'Entrada' ? 'success' : item.type === 'Saída' ? 'info' : 'warning'}>{item.type}</Badge></td><td className={item.type === 'Entrada' ? 'movement-positive' : 'movement-negative'}>{item.amount}</td><td>{item.reason}</td><td>{item.actor}</td><td className="table-secondary">{item.time}</td></tr>)}
          </tbody></table></div>
        )}
      </Panel>
      <DemoDialog onClose={() => setDialogOpen(false)} open={dialogOpen} title="Nova movimentação" />
    </>
  );
}

export function RecipesPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  return (
    <>
      <DemoBanner />
      <PageHeader description="Fichas técnicas ilustrativas para padronizar o preparo." eyebrow="OPERAÇÃO" title="Receitas e fichas técnicas" action={<Button icon="plus" onClick={() => setDialogOpen(true)} type="button">Nova ficha técnica</Button>} />
      <Panel className="catalog-panel" title="Fichas técnicas" subtitle="Dados fictícios, sem versionamento conectado">
        <div className="table-toolbar"><label className="search-box"><Icon name="search" size={17} /><span className="sr-only">Buscar receita</span><input placeholder="Buscar receita..." /></label><button className="button button--secondary" type="button"><Icon name="filter" size={16} /> Todas <span className="toolbar-caret">⌄</span></button></div>
        <div className="table-scroll"><table className="data-table"><thead><tr><th>Ficha técnica</th><th>Vinculada a</th><th>Componentes</th><th>Rendimento</th><th>Atualização</th><th>Status demonstrativo</th></tr></thead><tbody>
          {demoRecipes.map((item) => <tr key={item.name}><td><span className="table-primary">{item.name}</span><span className="table-secondary">Composição ilustrativa</span></td><td>{item.product}</td><td>{item.items} ingredientes</td><td>{item.yield}</td><td className="table-secondary">{item.updated}</td><td><Badge tone={item.status === 'Publicada' ? 'success' : 'neutral'}>{item.status}</Badge></td></tr>)}
        </tbody></table></div>
      </Panel>
      <div className="recipe-note"><Icon name="alert" size={17} /><span>Versionamento, rendimento e cálculo de custo ainda dependem de aprovação. Estes exemplos não definem regras de negócio.</span></div>
      <DemoDialog onClose={() => setDialogOpen(false)} open={dialogOpen} title="Criar ficha técnica" />
    </>
  );
}

export function AlertsPage() {
  const [filter, setFilter] = useState('Todos');
  const rows = useMemo(() => demoInventory.filter((item) => item.status !== 'Saudável' && (filter === 'Todos' || item.status === filter)), [filter]);
  const [dialogOpen, setDialogOpen] = useState(false);
  return (
    <>
      <DemoBanner />
      <PageHeader description="Itens demonstrativos próximos ou abaixo do mínimo." eyebrow="OPERAÇÃO" title="Alertas de estoque" action={<Button icon="refresh" onClick={() => setDialogOpen(true)} variant="secondary" type="button">Atualizar visão</Button>} />
      <div className="alert-overview"><div className="alert-overview__icon"><Icon name="alert" size={21} /></div><div><strong>3 itens precisam de atenção</strong><p>Resumo fictício. O limite e o comportamento dos alertas ainda dependem de definição.</p></div><Badge tone="warning">Visão demonstrativa</Badge></div>
      <div className="category-tabs">
        {['Todos', 'Abaixo do mínimo', 'Atenção'].map((item) => <button key={item} className={`category-tab${filter === item ? ' category-tab--active' : ''}`} onClick={() => setFilter(item)} type="button">{item}</button>)}
      </div>
      <Panel className="catalog-panel" title="Itens em atenção" subtitle="Limiares apenas ilustrativos">
        {rows.length === 0 ? <EmptyState description="Nenhum item corresponde a este filtro na amostra." icon="check" title="Tudo em ordem" /> : (
          <div className="alert-cards">{rows.map((item) => <article className="alert-card" key={item.name}><span className="alert-card__icon"><Icon name="alert" size={18} /></span><div className="alert-card__main"><div><h3>{item.name}</h3><span>{item.category}</span></div><Badge tone={item.status === 'Atenção' ? 'warning' : 'danger'}>{item.status}</Badge><div className="alert-card__quantities"><span>Saldo <strong>{item.quantity}</strong></span><span>Mínimo <strong>{item.minimum}</strong></span></div><div className="alert-card__bar"><span style={{ width: item.status === 'Abaixo do mínimo' ? '34%' : '82%' }} /></div><button className="text-button" onClick={() => setDialogOpen(true)} type="button">Ver item <Icon name="arrow" size={15} /></button></div></article>)}</div>
        )}
      </Panel>
      <DemoDialog onClose={() => setDialogOpen(false)} open={dialogOpen} title="Detalhe do alerta" />
    </>
  );
}
