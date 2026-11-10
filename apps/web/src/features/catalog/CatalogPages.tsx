import { useMemo, useState } from 'react';
import { demoCategories, demoIngredients, demoProducts } from '../../demo/data';
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

function SearchBox({ value, onChange, label = 'Buscar' }: { value: string; onChange(value: string): void; label?: string }) {
  return (
    <label className="search-box">
      <Icon name="search" size={17} />
      <span className="sr-only">{label}</span>
      <input onChange={(event) => onChange(event.target.value)} placeholder={`${label}...`} value={value} />
    </label>
  );
}

function ProductTable({ rows }: { rows: typeof demoProducts }) {
  if (rows.length === 0) return <EmptyState description="Tente outro termo ou limpe a busca." icon="search" title="Nenhum produto encontrado" />;
  return (
    <div aria-label="Tabela de produtos demonstrativa" className="table-scroll" role="region" tabIndex={0}>
      <table className="data-table">
        <thead><tr><th>Produto</th><th>Categoria</th><th>Código</th><th>Preço demonstrativo</th><th>Status</th></tr></thead>
        <tbody>
          {rows.map((item) => (
            <tr key={item.code}>
              <td><span className="table-primary">{item.name}</span><span className="table-secondary">Item de catálogo</span></td>
              <td>{item.category}</td><td className="table-code">{item.code}</td><td>{item.price}</td>
              <td><Badge tone={item.status === 'Ativo' ? 'success' : 'neutral'}>{item.status}</Badge></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ProductsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [dialogOpen, setDialogOpen] = useState(false);
  const rows = demoProducts.filter((item) => (
    `${item.name} ${item.category} ${item.code}`.toLowerCase().includes(search.toLowerCase())
    && (statusFilter === 'Todos' || item.status === statusFilter)
  ));
  const categoryCount = new Set(demoProducts.map((item) => item.category)).size;
  const activeCount = demoProducts.filter((item) => item.status === 'Ativo').length;
  return (
    <>
      <DemoBanner />
      <PageHeader
        description="Organize o catálogo que representa a sua operação."
        eyebrow="CATÁLOGO"
        title="Produtos"
        action={<Button icon="plus" onClick={() => setDialogOpen(true)} type="button">Novo produto</Button>}
      />
      <section className="mini-stats"><span><strong>{demoProducts.length}</strong> produtos na amostra</span><span><strong>{categoryCount}</strong> categorias na amostra</span><span><strong>{activeCount}</strong> ativos na amostra</span></section>
      <Panel className="catalog-panel">
        <div className="table-toolbar">
          <SearchBox label="Buscar produto" onChange={setSearch} value={search} />
          <label className="sr-only" htmlFor="product-status-filter">Filtrar produtos por status</label>
          <select className="demo-filter" id="product-status-filter" onChange={(event) => setStatusFilter(event.target.value)} value={statusFilter}>
            <option>Todos</option><option>Ativo</option><option>Rascunho</option>
          </select>
        </div>
        <ProductTable rows={rows} />
        <div className="table-pagination"><span>{rows.length} de {demoProducts.length} produtos na amostra demonstrativa</span></div>
      </Panel>
      <DemoDialog onClose={() => setDialogOpen(false)} open={dialogOpen} title="Cadastro de produto" />
    </>
  );
}

export function CategoriesPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<'Todas' | 'Produtos' | 'Ingredientes'>('Todas');
  const categories = demoCategories.filter(
    (category) => categoryFilter === 'Todas' || category.type === categoryFilter,
  );
  return (
    <>
      <DemoBanner />
      <PageHeader description="Agrupe o catálogo em categorias fáceis de reconhecer." eyebrow="CATÁLOGO" title="Categorias" action={<Button icon="plus" onClick={() => setDialogOpen(true)} type="button">Nova categoria</Button>} />
      <div aria-label="Filtrar categorias" className="category-tabs" role="group">
        {(['Todas', 'Produtos', 'Ingredientes'] as const).map((filter) => (
          <button
            aria-pressed={categoryFilter === filter}
            className={`category-tab${categoryFilter === filter ? ' category-tab--active' : ''}`}
            key={filter}
            onClick={() => setCategoryFilter(filter)}
            type="button"
          >
            {filter}
            <span>{filter === 'Todas' ? demoCategories.length : demoCategories.filter((category) => category.type === filter).length}</span>
          </button>
        ))}
      </div>
      <section className="category-grid">
        {categories.map((category) => (
          <article className="category-card" key={category.name}>
            <div className={`category-card__icon category-card__icon--${category.tone}`}><Icon name={category.type === 'Produtos' ? 'tag' : 'leaf'} size={19} /></div>
            <div className="category-card__top"><Badge tone={category.type === 'Produtos' ? 'info' : 'success'}>{category.type}</Badge></div>
            <h2>{category.name}</h2><p>{category.items} itens demonstrativos</p>
            <div className="category-card__bottom"><span>Atualizada recentemente</span><Icon name="arrow" size={16} /></div>
          </article>
        ))}
      </section>
      <DemoDialog onClose={() => setDialogOpen(false)} open={dialogOpen} title="Cadastro de categoria" />
    </>
  );
}

export function IngredientsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [dialogOpen, setDialogOpen] = useState(false);
  const rows = useMemo(
    () => demoIngredients.filter((item) => (
      `${item.name} ${item.category}`.toLowerCase().includes(search.toLowerCase())
      && (statusFilter === 'Todos' || item.status === statusFilter)
    )),
    [search, statusFilter],
  );
  const categoryCount = new Set(demoIngredients.map((item) => item.category)).size;
  const unitCount = new Set(demoIngredients.map((item) => item.unit)).size;
  return (
    <>
      <DemoBanner />
      <PageHeader description="Acompanhe insumos e ingredientes usados nas fichas técnicas." eyebrow="CATÁLOGO" title="Ingredientes e insumos" action={<Button icon="plus" onClick={() => setDialogOpen(true)} type="button">Novo ingrediente</Button>} />
      <section className="mini-stats"><span><strong>{demoIngredients.length}</strong> ingredientes na amostra</span><span><strong>{categoryCount}</strong> categorias na amostra</span><span><strong>{unitCount}</strong> unidades ilustrativas</span></section>
      <Panel className="catalog-panel">
        <div className="table-toolbar"><SearchBox label="Buscar ingrediente" onChange={setSearch} value={search} /><label className="sr-only" htmlFor="ingredient-status-filter">Filtrar ingredientes por status</label><select className="demo-filter" id="ingredient-status-filter" onChange={(event) => setStatusFilter(event.target.value)} value={statusFilter}><option>Todos</option><option>Em estoque</option><option>Estoque baixo</option></select></div>
        {rows.length === 0 ? <EmptyState description="Tente outro termo ou limpe a busca." icon="search" title="Nenhum ingrediente encontrado" /> : (
          <div aria-label="Tabela de ingredientes demonstrativa" className="table-scroll" role="region" tabIndex={0}><table className="data-table"><thead><tr><th>Ingrediente</th><th>Categoria</th><th>Unidade demonstrativa</th><th>Saldo demonstrativo</th><th>Status</th></tr></thead><tbody>
            {rows.map((item) => <tr key={item.name}><td><span className="table-primary">{item.name}</span><span className="table-secondary">Insumo de cozinha</span></td><td>{item.category}</td><td><span className="unit-pill">{item.unit}</span></td><td>{item.stock}</td><td><Badge tone={item.status === 'Em estoque' ? 'success' : 'warning'}>{item.status}</Badge></td></tr>)}
          </tbody></table></div>
        )}
      </Panel>
      <DemoDialog onClose={() => setDialogOpen(false)} open={dialogOpen} title="Cadastro de ingrediente" />
    </>
  );
}
