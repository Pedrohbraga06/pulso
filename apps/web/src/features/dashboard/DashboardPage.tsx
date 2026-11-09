import { useState } from 'react';
import { demoActivities, demoInventory, demoSales } from '../../demo/data';
import { Icon } from '../../components/Icon';
import {
  Badge,
  DemoBanner,
  PageHeader,
  Panel,
  StatCard,
} from '../../components/ui';

function RevenueChart() {
  const width = 680;
  const height = 220;
  const points = demoSales.map((item, index) => {
    const x = 26 + (index * (width - 52)) / (demoSales.length - 1);
    const y = height - 24 - (item.value / 100) * (height - 46);
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="chart-wrap">
      <div className="chart-legend"><span /><strong>Faturamento demonstrativo</strong><small>últimos 7 dias</small></div>
      <svg className="line-chart" role="img" aria-label="Gráfico demonstrativo de faturamento ao longo de sete dias" viewBox={`0 0 ${width} ${height}`}>
        <defs>
          <linearGradient id="sales-area" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#29b8a5" stopOpacity=".23" />
            <stop offset="100%" stopColor="#29b8a5" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 1, 2, 3].map((line) => {
          const y = 22 + line * 54;
          return <line key={line} className="chart-grid" x1="24" x2={width - 20} y1={y} y2={y} />;
        })}
        <polygon points={`26,${height - 20} ${points} ${width - 26},${height - 20}`} fill="url(#sales-area)" />
        <polyline className="chart-line" points={points} />
        {demoSales.map((item, index) => {
          const x = 26 + (index * (width - 52)) / (demoSales.length - 1);
          const y = height - 24 - (item.value / 100) * (height - 46);
          return <circle key={item.day} className="chart-point" cx={x} cy={y} r="4" />;
        })}
        {demoSales.map((item, index) => {
          const x = 26 + (index * (width - 52)) / (demoSales.length - 1);
          return <text key={item.day} className="chart-label" x={x} y={height - 2} textAnchor="middle">{item.day}</text>;
        })}
      </svg>
    </div>
  );
}

function InventoryBars() {
  const groups = [
    { label: 'Hortifruti', value: 82, color: 'teal' },
    { label: 'Mercearia', value: 66, color: 'blue' },
    { label: 'Laticínios', value: 38, color: 'amber' },
    { label: 'Bebidas', value: 91, color: 'violet' },
  ];
  return (
    <div className="inventory-bars">
      {groups.map((group) => (
        <div className="inventory-bar-row" key={group.label}>
          <div className="inventory-bar-row__label"><span>{group.label}</span><strong>{group.value}%</strong></div>
          <div className="inventory-bar-track"><span className={`inventory-bar-fill inventory-bar-fill--${group.color}`} style={{ width: `${group.value}%` }} /></div>
        </div>
      ))}
    </div>
  );
}

export function DashboardPage() {
  const [period, setPeriod] = useState('7 dias');
  return (
    <>
      <DemoBanner />
      <PageHeader
        description="Acompanhe os sinais mais importantes da sua operação."
        eyebrow="SEGUNDA-FEIRA, 16 DE JUNHO"
        title="O pulso da sua operação"
        action={
          <label className="period-select">
            <Icon name="calendar" size={16} />
            <select aria-label="Período demonstrativo" onChange={(event) => setPeriod(event.target.value)} value={period}>
              <option>7 dias</option>
              <option>30 dias</option>
              <option>90 dias</option>
            </select>
            <Icon name="chevron" size={14} />
          </label>
        }
      />
      <section className="stats-grid" aria-label="Indicadores demonstrativos">
        <StatCard change="+12,8%" icon="wallet" label="Vendas no período" tone="teal" value="R$ 48.320" />
        <StatCard change="+8,2%" icon="box" label="Pedidos" tone="blue" value="1.284" />
        <StatCard change="+2,4%" icon="trend" label="Ticket médio" tone="violet" value="R$ 37,63" />
        <StatCard footnote="3 precisam de atenção" icon="alert" label="Alertas de estoque" tone="amber" value="12" />
      </section>

      <section className="dashboard-grid">
        <Panel
          className="dashboard-grid__wide"
          title="Desempenho de vendas"
          subtitle="Uma visão ilustrativa do movimento semanal"
          action={<span className="panel-kicker">DADOS DEMONSTRATIVOS</span>}
        >
          <RevenueChart />
        </Panel>
        <Panel title="Nível de estoque" subtitle="Disponibilidade demonstrativa por categoria">
          <InventoryBars />
          <div className="panel-footnote"><span className="legend-dot legend-dot--teal" /> Estoque saudável <span className="legend-dot legend-dot--amber" /> Atenção</div>
        </Panel>
        <Panel title="Atenção operacional" subtitle="Itens de demonstração que pedem acompanhamento" action={<span className="count-pill">3</span>}>
          <div className="alert-list">
            {demoInventory.filter((item) => item.status !== 'Saudável').slice(0, 3).map((item) => (
              <div className="alert-row" key={item.name}>
                <span className="alert-row__icon"><Icon name="alert" size={17} /></span>
                <span className="alert-row__copy"><strong>{item.name}</strong><small>{item.quantity} · mínimo {item.minimum}</small></span>
                <Badge tone={item.status === 'Abaixo do mínimo' ? 'danger' : 'warning'}>{item.status === 'Atenção' ? 'Atenção' : 'Baixo'}</Badge>
              </div>
            ))}
          </div>
        </Panel>
        <Panel title="Atividade recente" subtitle="Movimentos ilustrativos" action={<span className="panel-kicker">DEMONSTRAÇÃO</span>}>
          <div className="activity-list">
            {demoActivities.map((activity) => (
              <div className="activity-item" key={activity.title}>
                <span className={`activity-item__icon activity-item__icon--${activity.tone}`}><Icon name={activity.icon} size={16} /></span>
                <span className="activity-item__copy"><strong>{activity.title}</strong><small>{activity.detail}</small></span>
                <time>{activity.time}</time>
              </div>
            ))}
          </div>
        </Panel>
      </section>
    </>
  );
}
