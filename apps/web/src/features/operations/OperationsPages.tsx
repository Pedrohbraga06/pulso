import { useMemo, useState } from 'react';
import { demoRecipes } from '../../demo/data';
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

export function RecipesPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todas');
  const [dialogOpen, setDialogOpen] = useState(false);
  const rows = useMemo(() => demoRecipes.filter((item) => (
    `${item.name} ${item.product}`.toLowerCase().includes(search.toLowerCase())
    && (statusFilter === 'Todas' || item.status === statusFilter)
  )), [search, statusFilter]);
  return (
    <>
      <DemoBanner />
      <PageHeader description="Fichas técnicas ilustrativas para padronizar o preparo." eyebrow="OPERAÇÃO" title="Receitas e fichas técnicas" action={<Button icon="plus" onClick={() => setDialogOpen(true)} type="button">Nova ficha técnica</Button>} />
      <Panel className="catalog-panel" title="Fichas técnicas" subtitle="Dados fictícios, sem versionamento conectado">
        <div className="table-toolbar"><label className="search-box"><Icon name="search" size={17} /><span className="sr-only">Buscar receita</span><input onChange={(event) => setSearch(event.target.value)} placeholder="Buscar receita..." value={search} /></label><label className="sr-only" htmlFor="recipe-status-filter">Filtrar fichas por status</label><select className="demo-filter" id="recipe-status-filter" onChange={(event) => setStatusFilter(event.target.value)} value={statusFilter}><option>Todas</option><option>Publicada</option><option>Rascunho</option></select></div>
        {rows.length === 0 ? <EmptyState description="Tente outro termo ou status na amostra." icon="search" title="Nenhuma ficha encontrada" /> : <div aria-label="Tabela de receitas demonstrativa" className="table-scroll" role="region" tabIndex={0}><table className="data-table"><thead><tr><th>Ficha técnica</th><th>Vinculada a</th><th>Componentes</th><th>Rendimento</th><th>Atualização</th><th>Status demonstrativo</th></tr></thead><tbody>
          {rows.map((item) => <tr key={item.name}><td><span className="table-primary">{item.name}</span><span className="table-secondary">Composição ilustrativa</span></td><td>{item.product}</td><td>{item.items} ingredientes</td><td>{item.yield}</td><td className="table-secondary">{item.updated}</td><td><Badge tone={item.status === 'Publicada' ? 'success' : 'neutral'}>{item.status}</Badge></td></tr>)}
        </tbody></table></div>}
      </Panel>
      <div className="recipe-note"><Icon name="alert" size={17} /><span>Versionamento, rendimento e cálculo de custo ainda dependem de aprovação. Estes exemplos não definem regras de negócio.</span></div>
      <DemoDialog onClose={() => setDialogOpen(false)} open={dialogOpen} title="Criar ficha técnica" />
    </>
  );
}
