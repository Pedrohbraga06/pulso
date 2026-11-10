import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import type {
  InventoryItemResponse,
  InventoryItemStatus,
  InventoryMovementResponse,
  InventoryMovementType,
} from '@pulso/contracts';
import { useAuth } from '../../app/useAuth';
import { Icon } from '../../components/Icon';
import {
  Badge,
  Button,
  EmptyState,
  FormField,
  InlineNotice,
  LoadingState,
  PageHeader,
  Panel,
} from '../../components/ui';

function requestErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : 'Não foi possível concluir a solicitação.';
}

function useCompanyCollection<T>(resource: string) {
  const { activeCompanyId, request } = useAuth();
  const [result, setResult] = useState<{
    key: string;
    values: T[];
    error: string;
  } | null>(null);
  const [revision, setRevision] = useState(0);

  const reload = useCallback(() => setRevision((value) => value + 1), []);
  const requestKey = activeCompanyId
    ? `${activeCompanyId}:${resource}:${revision}`
    : '';

  useEffect(() => {
    let active = true;
    if (!activeCompanyId) return;
    void request<T[]>(
      `/companies/${encodeURIComponent(activeCompanyId)}/${resource}`,
    )
      .then((result) => {
        if (!active) return;
        setResult({ key: requestKey, values: result, error: '' });
      })
      .catch((requestError: unknown) => {
        if (!active) return;
        setResult({
          key: requestKey,
          values: [],
          error: requestErrorMessage(requestError),
        });
      });

    return () => {
      active = false;
    };
  }, [activeCompanyId, request, requestKey, resource]);

  const currentResult = result?.key === requestKey;

  return {
    activeCompanyId,
    values: currentResult ? result.values : [],
    loading: Boolean(activeCompanyId) && !currentResult,
    error: currentResult ? result.error : '',
    reload,
  };
}

function formatQuantity(value: string, unit: string): string {
  const [integer, fraction] = value.split('.');
  const normalizedFraction = fraction?.replace(/0+$/, '');
  const localized = normalizedFraction
    ? `${integer},${normalizedFraction}`
    : integer;
  return `${localized} ${unit}`;
}

function formatSignedQuantity(value: string, unit: string): string {
  if (/^-?0(?:\.0+)?$/.test(value)) return formatQuantity('0', unit);
  return value.startsWith('-')
    ? `− ${formatQuantity(value.slice(1), unit)}`
    : `+ ${formatQuantity(value, unit)}`;
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value));
}

function decimalInput(value: string): string {
  return value.trim().replace(',', '.');
}

function statusLabel(status: InventoryItemStatus): string {
  if (status === 'BELOW_MINIMUM') return 'Abaixo do mínimo';
  if (status === 'AT_MINIMUM') return 'Atenção';
  return 'Saudável';
}

function statusTone(
  status: InventoryItemStatus,
): 'success' | 'warning' | 'danger' {
  if (status === 'BELOW_MINIMUM') return 'danger';
  if (status === 'AT_MINIMUM') return 'warning';
  return 'success';
}

function canManageInventory(role: string | undefined): boolean {
  return role === 'OWNER' || role === 'ADMIN';
}

const quantityPattern = '(?:0|[1-9][0-9]{0,10})(?:[.,][0-9]{1,3})?';

export function InventoryPage() {
  const { memberships, request } = useAuth();
  const inventory = useCompanyCollection<InventoryItemResponse>('inventory-items');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ACTIVE');
  const [formOpen, setFormOpen] = useState(false);
  const [formCompanyId, setFormCompanyId] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<InventoryItemResponse | null>(null);
  const [name, setName] = useState('');
  const [unit, setUnit] = useState('');
  const [minimumQuantity, setMinimumQuantity] = useState('');
  const [saving, setSaving] = useState(false);
  const [busyItemId, setBusyItemId] = useState<string | null>(null);
  const [formError, setFormError] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const role = memberships.find(
    (membership) => membership.companyId === inventory.activeCompanyId,
  )?.role;
  const canManage = canManageInventory(role);
  const showForm =
    formOpen && formCompanyId === inventory.activeCompanyId;
  const activeItems = inventory.values.filter((item) => item.isActive);
  const belowMinimumCount = activeItems.filter(
    (item) => item.status === 'BELOW_MINIMUM',
  ).length;
  const atMinimumCount = activeItems.filter(
    (item) => item.status === 'AT_MINIMUM',
  ).length;

  const rows = useMemo(
    () =>
      inventory.values.filter((item) => {
        const matchesSearch = `${item.name} ${item.unit}`
          .toLowerCase()
          .includes(search.toLowerCase());
        const matchesFilter =
          (filter === 'ACTIVE' && item.isActive) ||
          (filter === 'ARCHIVED' && !item.isActive) ||
          (filter === item.status && item.isActive);
        return matchesSearch && matchesFilter;
      }),
    [filter, inventory.values, search],
  );

  function openCreateForm() {
    setFormCompanyId(inventory.activeCompanyId);
    setEditingItem(null);
    setName('');
    setUnit('');
    setMinimumQuantity('');
    setFormError('');
    setFormOpen(true);
  }

  function openEditForm(item: InventoryItemResponse) {
    setFormCompanyId(inventory.activeCompanyId);
    setEditingItem(item);
    setName(item.name);
    setMinimumQuantity(item.minimumQuantity);
    setFormError('');
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setFormCompanyId(null);
    setEditingItem(null);
    setFormError('');
  }

  async function submitItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (
      !inventory.activeCompanyId ||
      formCompanyId !== inventory.activeCompanyId
    ) return;
    setSaving(true);
    setFormError('');
    setError('');
    const companyPath = `/companies/${encodeURIComponent(inventory.activeCompanyId)}/inventory-items`;

    try {
      await request<InventoryItemResponse>(
        editingItem
          ? `${companyPath}/${encodeURIComponent(editingItem.id)}`
          : companyPath,
        {
          method: editingItem ? 'PATCH' : 'POST',
          body: {
            name: name.trim(),
            minimumQuantity: decimalInput(minimumQuantity),
            ...(editingItem ? {} : { unit: unit.trim() }),
          },
        },
      );
      closeForm();
      setNotice(editingItem ? 'Item atualizado.' : 'Item cadastrado.');
      inventory.reload();
    } catch (requestError: unknown) {
      setFormError(requestErrorMessage(requestError));
    } finally {
      setSaving(false);
    }
  }

  async function toggleArchive(item: InventoryItemResponse) {
    if (!inventory.activeCompanyId) return;
    setBusyItemId(item.id);
    setError('');
    setNotice('');
    try {
      await request<InventoryItemResponse>(
        `/companies/${encodeURIComponent(inventory.activeCompanyId)}/inventory-items/${encodeURIComponent(item.id)}`,
        { method: 'PATCH', body: { isActive: !item.isActive } },
      );
      setNotice(item.isActive ? 'Item arquivado; o histórico foi preservado.' : 'Item reativado.');
      inventory.reload();
    } catch (requestError: unknown) {
      setError(requestErrorMessage(requestError));
    } finally {
      setBusyItemId(null);
    }
  }

  return (
    <>
      <PageHeader
        description="Cadastre itens, acompanhe saldos e consulte os limites definidos para cada unidade."
        eyebrow="OPERAÇÃO"
        title="Estoque"
        action={
          canManage && (
            <Button icon="plus" onClick={openCreateForm} type="button">
              Novo item
            </Button>
          )
        }
      />

      {!inventory.activeCompanyId && (
        <InlineNotice tone="warning">Selecione uma empresa vinculada para consultar o estoque.</InlineNotice>
      )}
      {inventory.error && <InlineNotice tone="danger">{inventory.error}</InlineNotice>}
      {error && <InlineNotice tone="danger">{error}</InlineNotice>}
      {notice && <InlineNotice tone="success">{notice}</InlineNotice>}

      {showForm && (
        <Panel
          className="catalog-panel"
          title={editingItem ? 'Editar item' : 'Cadastrar item'}
          subtitle="O saldo inicial é zero. Registre uma entrada para adicionar estoque."
        >
          <form className="inventory-form" onSubmit={(event) => void submitItem(event)}>
            <div className="inventory-form__grid">
              <FormField
                autoComplete="off"
                id="inventory-item-name"
                label="Nome do item"
                maxLength={120}
                minLength={2}
                onChange={(event) => setName(event.target.value)}
                required
                value={name}
              />
              {!editingItem && (
                <FormField
                  autoComplete="off"
                  id="inventory-item-unit"
                  label="Unidade"
                  maxLength={24}
                  onChange={(event) => setUnit(event.target.value)}
                  placeholder="Ex.: kg, L, unidade"
                  required
                  value={unit}
                />
              )}
              <FormField
                id="inventory-item-minimum"
                inputMode="decimal"
                label="Estoque mínimo"
                onChange={(event) => setMinimumQuantity(event.target.value)}
                pattern={quantityPattern}
                required
                value={minimumQuantity}
              />
            </div>
            {editingItem && (
              <p className="inventory-form__note">
                A unidade não pode ser alterada após o cadastro para preservar a consistência do histórico.
              </p>
            )}
            {formError && <InlineNotice tone="danger">{formError}</InlineNotice>}
            <div className="inventory-form__actions">
              <Button onClick={closeForm} type="button" variant="secondary">
                Cancelar
              </Button>
              <Button disabled={saving} type="submit">
                {saving ? 'Salvando…' : editingItem ? 'Salvar alterações' : 'Cadastrar item'}
              </Button>
            </div>
          </form>
        </Panel>
      )}

      <div className="inventory-summary">
        <div>
          <span className="inventory-summary__label">Itens ativos</span>
          <strong>{inventory.loading ? '…' : activeItems.length}</strong>
          <small>nesta empresa</small>
        </div>
        <div>
          <span className="inventory-summary__label">Abaixo do mínimo</span>
          <strong className="text-amber">{inventory.loading ? '…' : belowMinimumCount}</strong>
          <small>saldo menor que o mínimo</small>
        </div>
        <div>
          <span className="inventory-summary__label">No limite</span>
          <strong>{inventory.loading ? '…' : atMinimumCount}</strong>
          <small>saldo igual ao mínimo</small>
        </div>
      </div>

      <Panel className="catalog-panel" title="Itens de estoque" subtitle="Saldos calculados e mantidos pela API">
        <div className="table-toolbar">
          <label className="search-box">
            <Icon name="search" size={17} />
            <span className="sr-only">Buscar item</span>
            <input
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar item..."
              value={search}
            />
          </label>
          <label className="sr-only" htmlFor="inventory-status-filter">
            Filtrar estoque por situação
          </label>
          <select
            className="demo-filter"
            id="inventory-status-filter"
            onChange={(event) => setFilter(event.target.value)}
            value={filter}
          >
            <option value="ACTIVE">Todos ativos</option>
            <option value="AT_MINIMUM">Atenção</option>
            <option value="BELOW_MINIMUM">Abaixo do mínimo</option>
            <option value="ARCHIVED">Arquivados</option>
          </select>
        </div>

        {!inventory.activeCompanyId ? (
          <EmptyState
            description="Selecione uma empresa vinculada na barra superior."
            icon="box"
            title="Empresa não selecionada"
          />
        ) : inventory.loading ? (
          <LoadingState label="Carregando estoque…" />
        ) : inventory.error ? (
          <EmptyState
            action={<Button onClick={inventory.reload} type="button" variant="secondary">Tentar novamente</Button>}
            description="Não foi possível consultar os itens desta empresa."
            icon="alert"
            title="Estoque indisponível"
          />
        ) : rows.length === 0 ? (
          <EmptyState
            description={
              inventory.values.length === 0
                ? 'Cadastre o primeiro item desta empresa.'
                : 'Nenhum item corresponde a esta busca ou filtro.'
            }
            icon="box"
            title={inventory.values.length === 0 ? 'Estoque vazio' : 'Nenhum item encontrado'}
            action={
              inventory.values.length === 0 && canManage ? (
                <Button onClick={openCreateForm} type="button">
                  Cadastrar item
                </Button>
              ) : undefined
            }
          />
        ) : (
          <div aria-label="Tabela de estoque" className="table-scroll" role="region" tabIndex={0}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Saldo atual</th>
                  <th>Estoque mínimo</th>
                  <th>Situação</th>
                  {canManage && <th>Ações</th>}
                </tr>
              </thead>
              <tbody>
                {rows.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <span className="table-primary">{item.name}</span>
                      <span className="table-secondary">{item.unit}{item.isActive ? '' : ' · arquivado'}</span>
                    </td>
                    <td className="table-primary">{formatQuantity(item.quantityOnHand, item.unit)}</td>
                    <td>{formatQuantity(item.minimumQuantity, item.unit)}</td>
                    <td>
                      {item.isActive ? (
                        <Badge tone={statusTone(item.status)}>{statusLabel(item.status)}</Badge>
                      ) : (
                        <Badge>Arquivado</Badge>
                      )}
                    </td>
                    {canManage && (
                      <td>
                        <div className="inventory-actions">
                          <Button
                            onClick={() => openEditForm(item)}
                            type="button"
                            variant="secondary"
                          >
                            Editar
                          </Button>
                          <Button
                            disabled={busyItemId === item.id}
                            onClick={() => void toggleArchive(item)}
                            type="button"
                            variant={item.isActive ? 'ghost' : 'secondary'}
                          >
                            {item.isActive ? 'Arquivar' : 'Reativar'}
                          </Button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </>
  );
}

function movementLabel(type: InventoryMovementType): string {
  if (type === 'ENTRY') return 'Entrada';
  if (type === 'EXIT') return 'Saída';
  return 'Ajuste';
}

function movementTone(
  type: InventoryMovementType,
): 'success' | 'info' | 'warning' {
  if (type === 'ENTRY') return 'success';
  if (type === 'EXIT') return 'info';
  return 'warning';
}

export function MovementsPage() {
  const { memberships, request } = useAuth();
  const inventory = useCompanyCollection<InventoryItemResponse>('inventory-items');
  const movements = useCompanyCollection<InventoryMovementResponse>('inventory-movements');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [formOpen, setFormOpen] = useState(false);
  const [formCompanyId, setFormCompanyId] = useState<string | null>(null);
  const [itemId, setItemId] = useState('');
  const [type, setType] = useState<InventoryMovementType>('ENTRY');
  const [quantity, setQuantity] = useState('');
  const [countedQuantity, setCountedQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [notice, setNotice] = useState('');

  const role = memberships.find(
    (membership) => membership.companyId === inventory.activeCompanyId,
  )?.role;
  const canAdjust = canManageInventory(role);
  const activeItems = inventory.values.filter((item) => item.isActive);
  const selectedItemId = activeItems.some((item) => item.id === itemId)
    ? itemId
    : activeItems[0]?.id ?? '';
  const showForm = formOpen && formCompanyId === inventory.activeCompanyId;
  const entries = movements.values.filter((movement) => movement.type === 'ENTRY').length;
  const exitsAndAdjustments = movements.values.length - entries;

  const rows = useMemo(
    () =>
      movements.values.filter((movement) => {
        const matchesType = typeFilter === 'ALL' || movement.type === typeFilter;
        const matchesSearch =
          `${movement.itemName} ${movement.reason} ${movement.actorName}`
            .toLowerCase()
            .includes(search.toLowerCase());
        return matchesType && matchesSearch;
      }),
    [movements.values, search, typeFilter],
  );

  function openForm() {
    setFormCompanyId(inventory.activeCompanyId);
    setType('ENTRY');
    setQuantity('');
    setCountedQuantity('');
    setReason('');
    setFormError('');
    setFormOpen(true);
  }

  async function submitMovement(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (
      !inventory.activeCompanyId ||
      formCompanyId !== inventory.activeCompanyId ||
      !selectedItemId
    ) return;
    setSaving(true);
    setFormError('');
    setError('');
    const body =
      type === 'ADJUSTMENT'
        ? {
            type,
            countedQuantity: decimalInput(countedQuantity),
            reason: reason.trim(),
          }
        : { type, quantity: decimalInput(quantity), reason: reason.trim() };

    try {
      await request<InventoryMovementResponse>(
        `/companies/${encodeURIComponent(inventory.activeCompanyId)}/inventory-items/${encodeURIComponent(selectedItemId)}/movements`,
        { method: 'POST', body },
      );
      setFormOpen(false);
      setNotice('Movimentação registrada.');
      movements.reload();
      inventory.reload();
    } catch (requestError: unknown) {
      setFormError(requestErrorMessage(requestError));
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <PageHeader
        description="Registre entradas, saídas e contagens físicas com motivo e responsável."
        eyebrow="OPERAÇÃO"
        title="Movimentações"
        action={
          <Button
            disabled={activeItems.length === 0}
            icon="plus"
            onClick={openForm}
            type="button"
          >
            Nova movimentação
          </Button>
        }
      />

      {!inventory.activeCompanyId && (
        <InlineNotice tone="warning">Selecione uma empresa vinculada para consultar as movimentações.</InlineNotice>
      )}
      {(inventory.error || movements.error) && (
        <InlineNotice tone="danger">{inventory.error || movements.error}</InlineNotice>
      )}
      {notice && <InlineNotice tone="success">{notice}</InlineNotice>}

      {showForm && (
        <Panel className="catalog-panel" title="Nova movimentação" subtitle="O estoque é atualizado pela API em uma transação.">
          {activeItems.length === 0 ? (
            <InlineNotice tone="warning">
              Cadastre um item ativo em <Link to="/app/inventory">Estoque</Link> antes de movimentar.
            </InlineNotice>
          ) : (
            <form className="inventory-form" onSubmit={(event) => void submitMovement(event)}>
              <div className="inventory-form__grid">
                <label className="form-field" htmlFor="movement-item">
                  <span className="form-field__label">Item</span>
                  <select
                    id="movement-item"
                    onChange={(event) => setItemId(event.target.value)}
                    required
                    value={selectedItemId}
                  >
                    {activeItems.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name} · {formatQuantity(item.quantityOnHand, item.unit)}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="form-field" htmlFor="movement-type">
                  <span className="form-field__label">Tipo</span>
                  <select
                    id="movement-type"
                    onChange={(event) => {
                      const nextType = event.target.value;
                      if (
                        nextType === 'ENTRY' ||
                        nextType === 'EXIT' ||
                        (nextType === 'ADJUSTMENT' && canAdjust)
                      ) {
                        setType(nextType);
                      }
                    }}
                    value={type}
                  >
                    <option value="ENTRY">Entrada</option>
                    <option value="EXIT">Saída</option>
                    {canAdjust && <option value="ADJUSTMENT">Ajuste por contagem</option>}
                  </select>
                </label>
                {type === 'ADJUSTMENT' ? (
                  <FormField
                    id="movement-counted-quantity"
                    inputMode="decimal"
                    label={`Saldo contado (${activeItems.find((item) => item.id === selectedItemId)?.unit ?? ''})`}
                    onChange={(event) => setCountedQuantity(event.target.value)}
                    pattern={quantityPattern}
                    required
                    value={countedQuantity}
                  />
                ) : (
                  <FormField
                    id="movement-quantity"
                    inputMode="decimal"
                    label={`Quantidade (${activeItems.find((item) => item.id === selectedItemId)?.unit ?? ''})`}
                    onChange={(event) => setQuantity(event.target.value)}
                    pattern={quantityPattern}
                    required
                    value={quantity}
                  />
                )}
                <FormField
                  autoComplete="off"
                  id="movement-reason"
                  label="Motivo"
                  maxLength={250}
                  onChange={(event) => setReason(event.target.value)}
                  placeholder="Ex.: recebimento de fornecedor"
                  required
                  value={reason}
                />
              </div>
              {type === 'ADJUSTMENT' && (
                <p className="inventory-form__note">
                  Informe a contagem física final; a API calcula e registra a diferença.
                </p>
              )}
              {!canAdjust && (
                <p className="inventory-form__note">
                  Ajustes por contagem ficam disponíveis apenas para OWNER e ADMIN.
                </p>
              )}
              {formError && <InlineNotice tone="danger">{formError}</InlineNotice>}
              <div className="inventory-form__actions">
                <Button onClick={() => setFormOpen(false)} type="button" variant="secondary">
                  Cancelar
                </Button>
                <Button disabled={saving} type="submit">
                  {saving ? 'Registrando…' : 'Registrar'}
                </Button>
              </div>
            </form>
          )}
        </Panel>
      )}

      <section className="movement-metrics">
        <span><Icon name="movement" /><strong>{movements.loading ? '…' : movements.values.length}</strong><small>registros</small></span>
        <span><Icon name="arrow" /><strong>{movements.loading ? '…' : entries}</strong><small>entradas</small></span>
        <span><Icon name="arrow" /><strong>{movements.loading ? '…' : exitsAndAdjustments}</strong><small>saídas e ajustes</small></span>
      </section>

      <Panel className="catalog-panel" title="Histórico de movimentações" subtitle="Registros preservados por item, motivo e responsável">
        <div className="table-toolbar">
          <label className="search-box">
            <Icon name="search" size={17} />
            <span className="sr-only">Buscar movimentação</span>
            <input
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar item ou motivo..."
              value={search}
            />
          </label>
          <label className="sr-only" htmlFor="movement-type-filter">
            Filtrar movimentações por tipo
          </label>
          <select
            className="demo-filter"
            id="movement-type-filter"
            onChange={(event) => setTypeFilter(event.target.value)}
            value={typeFilter}
          >
            <option value="ALL">Todos os tipos</option>
            <option value="ENTRY">Entradas</option>
            <option value="EXIT">Saídas</option>
            <option value="ADJUSTMENT">Ajustes</option>
          </select>
        </div>

        {!inventory.activeCompanyId ? (
          <EmptyState
            description="Selecione uma empresa vinculada na barra superior."
            icon="movement"
            title="Empresa não selecionada"
          />
        ) : inventory.loading || movements.loading ? (
          <LoadingState label="Carregando movimentações…" />
        ) : inventory.error || movements.error ? (
          <EmptyState
            action={<Button onClick={() => { inventory.reload(); movements.reload(); }} type="button" variant="secondary">Tentar novamente</Button>}
            description="Não foi possível consultar o histórico desta empresa."
            icon="alert"
            title="Movimentações indisponíveis"
          />
        ) : rows.length === 0 ? (
          <EmptyState
            description={
              movements.values.length === 0
                ? 'As entradas, saídas e contagens registradas aparecerão aqui.'
                : 'Nenhum registro corresponde a esta busca ou filtro.'
            }
            icon="movement"
            title={movements.values.length === 0 ? 'Nenhuma movimentação ainda' : 'Nenhum registro encontrado'}
          />
        ) : (
          <div aria-label="Tabela de movimentações" className="table-scroll" role="region" tabIndex={0}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Tipo</th>
                  <th>Quantidade / diferença</th>
                  <th>Motivo</th>
                  <th>Responsável</th>
                  <th>Data</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((movement) => (
                  <tr key={movement.id}>
                    <td><span className="table-primary">{movement.itemName}</span></td>
                    <td><Badge tone={movementTone(movement.type)}>{movementLabel(movement.type)}</Badge></td>
                    <td>
                      <span className={movement.delta.startsWith('-') ? 'movement-negative' : 'movement-positive'}>
                        {movement.type === 'ADJUSTMENT' && movement.countedQuantity !== null
                          ? `Contagem ${formatQuantity(movement.countedQuantity, movement.unit)}`
                          : formatSignedQuantity(movement.delta, movement.unit)}
                      </span>
                      <span className="table-secondary">
                        {movement.type === 'ADJUSTMENT'
                          ? `Variação ${formatSignedQuantity(movement.delta, movement.unit)}`
                          : `${formatQuantity(movement.beforeQuantity, movement.unit)} → ${formatQuantity(movement.afterQuantity, movement.unit)}`}
                      </span>
                    </td>
                    <td>{movement.reason}</td>
                    <td>{movement.actorName}</td>
                    <td className="table-secondary">{formatDate(movement.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </>
  );
}

export function AlertsPage() {
  const inventory = useCompanyCollection<InventoryItemResponse>('inventory-items');
  const [filter, setFilter] = useState<'ALL' | 'BELOW_MINIMUM' | 'AT_MINIMUM'>('ALL');
  const alertItems = inventory.values.filter(
    (item) =>
      item.isActive &&
      (item.status === 'BELOW_MINIMUM' || item.status === 'AT_MINIMUM'),
  );
  const rows = alertItems.filter(
    (item) => filter === 'ALL' || item.status === filter,
  );

  return (
    <>
      <PageHeader
        description="Acompanhe itens cujo saldo atingiu ou ficou abaixo do mínimo cadastrado."
        eyebrow="OPERAÇÃO"
        title="Alertas de estoque"
      />
      {!inventory.activeCompanyId && (
        <InlineNotice tone="warning">Selecione uma empresa vinculada para consultar os alertas.</InlineNotice>
      )}
      {inventory.error && <InlineNotice tone="danger">{inventory.error}</InlineNotice>}

      <div className="alert-overview">
        <div className="alert-overview__icon"><Icon name="alert" size={21} /></div>
        <div>
          <strong>
            {inventory.loading
              ? 'Verificando saldos…'
              : `${alertItems.length} ${alertItems.length === 1 ? 'item precisa' : 'itens precisam'} de atenção`}
          </strong>
          <p>Alertas calculados pela API com base no saldo atual e no estoque mínimo.</p>
        </div>
        <Badge tone={alertItems.length ? 'warning' : 'success'}>
          {inventory.loading ? 'Consultando' : alertItems.length ? 'Ação necessária' : 'Tudo em ordem'}
        </Badge>
      </div>

      <div aria-label="Filtrar alertas" className="category-tabs" role="group">
        {([
          ['ALL', 'Todos'],
          ['BELOW_MINIMUM', 'Abaixo do mínimo'],
          ['AT_MINIMUM', 'No limite'],
        ] as const).map(([value, label]) => (
          <button
            aria-pressed={filter === value}
            className={`category-tab${filter === value ? ' category-tab--active' : ''}`}
            key={value}
            onClick={() => setFilter(value)}
            type="button"
          >
            {label}
          </button>
        ))}
      </div>

      <Panel className="catalog-panel" title="Itens em atenção" subtitle="O saldo pode mudar após cada movimentação">
        {!inventory.activeCompanyId ? (
          <EmptyState
            description="Selecione uma empresa vinculada na barra superior."
            icon="alert"
            title="Empresa não selecionada"
          />
        ) : inventory.loading ? (
          <LoadingState label="Carregando alertas…" />
        ) : inventory.error ? (
          <EmptyState
            action={<Button onClick={inventory.reload} type="button" variant="secondary">Tentar novamente</Button>}
            description="Não foi possível consultar os saldos desta empresa."
            icon="alert"
            title="Alertas indisponíveis"
          />
        ) : rows.length === 0 ? (
          <EmptyState
            description={
              alertItems.length === 0
                ? 'Nenhum item ativo está no limite ou abaixo do mínimo.'
                : 'Nenhum alerta corresponde a este filtro.'
            }
            icon="check"
            title="Tudo em ordem"
          />
        ) : (
          <div className="alert-cards">
            {rows.map((item) => (
              <article className="alert-card" key={item.id}>
                <span className="alert-card__icon"><Icon name="alert" size={18} /></span>
                <div className="alert-card__main">
                  <div>
                    <h3>{item.name}</h3>
                    <span>{item.unit}</span>
                  </div>
                  <Badge tone={statusTone(item.status)}>{statusLabel(item.status)}</Badge>
                  <div className="alert-card__quantities">
                    <span>Saldo <strong>{formatQuantity(item.quantityOnHand, item.unit)}</strong></span>
                    <span>Mínimo <strong>{formatQuantity(item.minimumQuantity, item.unit)}</strong></span>
                  </div>
                  <Link className="text-button" to="/app/movements">
                    Ver movimentações <Icon name="arrow" size={15} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </Panel>
    </>
  );
}
