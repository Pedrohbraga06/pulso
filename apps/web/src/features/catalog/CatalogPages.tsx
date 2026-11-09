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

function ProductTable({ search }: { search: string }) {
  const rows = demoProducts.filter((item) => `${item.name} ${item.category} ${item.code}`.toLowerCase().includes(search.toLowerCase()));
  if (rows.length === 0) return <EmptyState description="Tente outro termo ou limpe a busca." icon="search" title="Nenhum produto encontrado" />;
  return (
    <div className="table-scroll">
      <table className="data-table">
        <thead><tr><th>Produto</th><th>Categoria</th><th>Código</th><th>Preço demonstrativo</th><th>Status</th><th><span className="sr-only">Ações</span></th></tr></thead>
        <tbody>
          {rows.map((item) => (
            <tr key={item.code}>
              <td><span className="table-primary">{item.name}</span><span className="table-secondary">Item de catálogo</span></td>
              <td>{item.category}</td><td className="table-code">{item.code}</td><td>{item.price}</td>
              <td><Badge tone={item.status === 'Ativo' ? 'success' : 'neutral'}>{item.status}</Badge></td>
              <td><button className="icon-button table-action" aria-label={`Ver demonstração de ${item.name}`} type="button"><Icon name="arrow" size={16} /></button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ProductsPage() {
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  return (
    <>
      <DemoBanner />
      <PageHeader
        description="Organize o catálogo que representa a sua operação."
        eyebrow="CATÁLOGO"
        title="Produtos"
        action={<Button icon="plus" onClick={() => setDialogOpen(true)} type="button">Novo produto</Button>}
      />
      <section className="mini-stats"><span><strong>42</strong> produtos demonstrativos</span><span><strong>4</strong> categorias</span><span><strong>3</strong> ativos no período</span></section>
      <Panel className="catalog-panel">
        <div className="table-toolbar">
          <SearchBox label="Buscar produto" onChange={setSearch} value={search} />
          <button className="button button--secondary" type="button"><Icon name="filter" size={16} /> Filtros <span className="toolbar-caret">⌄</span></button>
        </div>
        <ProductTable search={search} />
        <div className="table-pagination"><span>Exibindo 1–{demoProducts.length} de 42 itens demonstrativos</span><div><button aria-label="Página anterior" className="icon-button" disabled type="button"><Icon name="arrow" size={15} /></button><span className="page-number">1</span><button aria-label="Próxima página demonstrativa" className="icon-button" type="button"><Icon name="arrow" size={15} /></button></div></div>
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
            <div className="category-card__top"><Badge tone={category.type === 'Produtos' ? 'info' : 'success'}>{category.type}</Badge><button className="icon-button" aria-label={`Mais opções demonstrativas para ${category.name}`} type="button"><Icon name="chevron" size={16} /></button></div>
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
  const [dialogOpen, setDialogOpen] = useState(false);
  const rows = useMemo(
    () => demoIngredients.filter((item) => `${item.name} ${item.category}`.toLowerCase().includes(search.toLowerCase())),
    [search],
  );
  return (
    <>
      <DemoBanner />
      <PageHeader description="Acompanhe insumos e ingredientes usados nas fichas técnicas." eyebrow="CATÁLOGO" title="Ingredientes e insumos" action={<Button icon="plus" onClick={() => setDialogOpen(true)} type="button">Novo ingrediente</Button>} />
      <section className="mini-stats"><span><strong>76</strong> ingredientes demonstrativos</span><span><strong>8</strong> categorias</span><span><strong>4</strong> unidades ilustrativas</span></section>
      <Panel className="catalog-panel">
        <div className="table-toolbar"><SearchBox label="Buscar ingrediente" onChange={setSearch} value={search} /><button className="button button--secondary" type="button"><Icon name="filter" size={16} /> Filtros <span className="toolbar-caret">⌄</span></button></div>
        {rows.length === 0 ? <EmptyState description="Tente outro termo ou limpe a busca." icon="search" title="Nenhum ingrediente encontrado" /> : (
          <div className="table-scroll"><table className="data-table"><thead><tr><th>Ingrediente</th><th>Categoria</th><th>Unidade demonstrativa</th><th>Saldo demonstrativo</th><th>Status</th><th><span className="sr-only">Ações</span></th></tr></thead><tbody>
            {rows.map((item) => <tr key={item.name}><td><span className="table-primary">{item.name}</span><span className="table-secondary">Insumo de cozinha</span></td><td>{item.category}</td><td><span className="unit-pill">{item.unit}</span></td><td>{item.stock}</td><td><Badge tone={item.status === 'Em estoque' ? 'success' : 'warning'}>{item.status}</Badge></td><td><button className="icon-button table-action" aria-label={`Ver demonstração de ${item.name}`} type="button"><Icon name="arrow" size={16} /></button></td></tr>)}
          </tbody></table></div>
        )}
      </Panel>
      <DemoDialog onClose={() => setDialogOpen(false)} open={dialogOpen} title="Cadastro de ingrediente" />
    </>
  );
}
