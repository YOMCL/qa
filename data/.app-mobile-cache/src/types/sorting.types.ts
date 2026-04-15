export type SortOption = 
  | 'name'
  | '-name'
  | 'brand'
  | '-brand'
  | 'sku'
  | '-sku'
  | 'category'
  | '-category'
  | 'price'
  | '-price'
  | 'discount'
  | 'shoppingList';

export type SortOptionConfig = {
  value: SortOption;
  label: string;
};

export const SORT_OPTIONS: SortOptionConfig[] = [
  { value: 'name', label: 'Nombre A-Z' },
  { value: '-name', label: 'Nombre Z-A' },
  { value: 'brand', label: 'Marca A-Z' },
  { value: '-brand', label: 'Marca Z-A' },
  { value: 'sku', label: 'SKU A-Z' },
  { value: '-sku', label: 'SKU Z-A' },
  { value: 'category', label: 'Categorías A-Z' },
  { value: '-category', label: 'Categorías Z-A' },
  { value: 'discount', label: 'Mayor descuento' },
  { value: 'price', label: 'Mayor precio' },
  { value: '-price', label: 'Menor precio' },
  { value: 'shoppingList', label: 'Lista de compras' },
];

export type ProductForSorting = Pick<
  import('./product.types').ProductSearchResult,
  'id' | 'name' | 'brand' | 'sku' | 'category' | 'price' | 'discount' | 'tag' | 'shoppingListOrder'
>;
