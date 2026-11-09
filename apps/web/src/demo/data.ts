export const demoSales = [
  { day: 'Seg', value: 42 },
  { day: 'Ter', value: 58 },
  { day: 'Qua', value: 51 },
  { day: 'Qui', value: 72 },
  { day: 'Sex', value: 66 },
  { day: 'Sáb', value: 88 },
  { day: 'Dom', value: 64 },
];

export const demoProducts = [
  { name: 'Bowl da casa', category: 'Pratos principais', code: 'PRD-014', price: 'R$ 38,00', status: 'Ativo' },
  { name: 'Suco verde', category: 'Bebidas', code: 'PRD-028', price: 'R$ 14,00', status: 'Ativo' },
  { name: 'Cookie de cacau', category: 'Sobremesas', code: 'PRD-041', price: 'R$ 12,00', status: 'Ativo' },
  { name: 'Menu executivo', category: 'Pratos principais', code: 'PRD-053', price: 'R$ 46,00', status: 'Rascunho' },
];

export const demoCategories = [
  { name: 'Pratos principais', type: 'Produtos', items: 18, tone: 'teal' },
  { name: 'Bebidas', type: 'Produtos', items: 12, tone: 'blue' },
  { name: 'Sobremesas', type: 'Produtos', items: 9, tone: 'violet' },
  { name: 'Hortifruti', type: 'Ingredientes', items: 24, tone: 'green' },
  { name: 'Mercearia', type: 'Ingredientes', items: 31, tone: 'amber' },
];

export const demoIngredients = [
  { name: 'Tomate italiano', category: 'Hortifruti', unit: 'kg', stock: '8,4 kg', status: 'Em estoque' },
  { name: 'Azeite extra virgem', category: 'Mercearia', unit: 'L', stock: '3,2 L', status: 'Em estoque' },
  { name: 'Farinha de trigo', category: 'Mercearia', unit: 'kg', stock: '2,1 kg', status: 'Estoque baixo' },
  { name: 'Manjericão fresco', category: 'Hortifruti', unit: 'kg', stock: '0,6 kg', status: 'Estoque baixo' },
];

export const demoInventory = [
  { name: 'Tomate italiano', category: 'Hortifruti', quantity: '8,4 kg', minimum: '4,0 kg', status: 'Saudável' },
  { name: 'Farinha de trigo', category: 'Mercearia', quantity: '2,1 kg', minimum: '5,0 kg', status: 'Abaixo do mínimo' },
  { name: 'Manjericão fresco', category: 'Hortifruti', quantity: '0,6 kg', minimum: '1,0 kg', status: 'Abaixo do mínimo' },
  { name: 'Azeite extra virgem', category: 'Mercearia', quantity: '3,2 L', minimum: '2,0 L', status: 'Saudável' },
  { name: 'Queijo parmesão', category: 'Laticínios', quantity: '1,8 kg', minimum: '2,0 kg', status: 'Atenção' },
];

export const demoMovements = [
  { item: 'Tomate italiano', type: 'Entrada', amount: '+ 4,0 kg', reason: 'Reposição de estoque', time: 'Hoje, 10:42', actor: 'Marina Costa' },
  { item: 'Farinha de trigo', type: 'Saída', amount: '− 1,5 kg', reason: 'Preparo da cozinha', time: 'Hoje, 09:18', actor: 'Lucas Almeida' },
  { item: 'Manjericão fresco', type: 'Ajuste', amount: '− 0,2 kg', reason: 'Contagem física', time: 'Ontem, 18:36', actor: 'Marina Costa' },
  { item: 'Azeite extra virgem', type: 'Entrada', amount: '+ 2,0 L', reason: 'Reposição de estoque', time: 'Ontem, 14:05', actor: 'Rafael Souza' },
];

export const demoRecipes = [
  { name: 'Bowl da casa', product: 'Produto · PRD-014', items: 7, yield: '1 porção', updated: 'Hoje, 11:24', status: 'Publicada' },
  { name: 'Molho de manjericão', product: 'Preparação base', items: 5, yield: '500 ml', updated: 'Ontem, 16:10', status: 'Rascunho' },
  { name: 'Cookie de cacau', product: 'Produto · PRD-041', items: 8, yield: '12 unidades', updated: '12 jun, 09:45', status: 'Publicada' },
];

export const demoActivities = [
  { icon: 'box' as const, title: 'Novo produto adicionado', detail: 'Bowl da casa · Catálogo', time: '10:42', tone: 'teal' },
  { icon: 'movement' as const, title: 'Entrada de estoque', detail: 'Tomate italiano · + 4,0 kg', time: '09:18', tone: 'blue' },
  { icon: 'chef' as const, title: 'Ficha técnica atualizada', detail: 'Molho de manjericão', time: 'Ontem', tone: 'violet' },
  { icon: 'alert' as const, title: 'Estoque abaixo do mínimo', detail: 'Farinha de trigo · 2,1 kg', time: 'Ontem', tone: 'amber' },
];
