export type FilterOption = {
  id: string;
  name: string;
  value: string;
  description?: string;
};

export type FilterCategory = {
  id: string;
  name: string;
  options: FilterOption[];
  selected: Set<string>;
};

export type CategoryFilterOption = {
  id: string;
  name: string;
  value: string;
  tags: string[];
  parent: string | null;
};

export type ProductFilters = {
  businessUnit: Set<string>;
  category: Set<string>;
  strategy: Set<string>;
  format: Set<string>;
  stock: Set<string>;
  promotion: Set<string>;
  noSales: Set<string>;
};

export type FilterDialogProps = {
  visible: boolean;
  onClose: () => void;
  onApplyFilters: (filters: ProductFilters) => void;
  onClearFilters: () => void;
  currentFilters: ProductFilters;
  commerceId: string;
  availableStrategies?: string[];
  getStrategyDisplayName?: (strategy: string) => string;
  availableCategories?: CategoryFilterOption[];
};

export const DEFAULT_FILTERS: ProductFilters = {
  businessUnit: new Set(),
  category: new Set(),
  strategy: new Set(),
  format: new Set(),
  stock: new Set(),
  promotion: new Set(),
  noSales: new Set(),
};
