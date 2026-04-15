import { ProductSegmentedData } from './product.types';

export type RealmSchemaField = {
  name: string;
  type: string;
  required: boolean;
};

export type RealmSchema = {
  name: string;
  count: number;
  fields: RealmSchemaField[];
};

export type RealmInfoResult = {
  success: boolean;
  schemas: RealmSchema[];
  error?: string;
};

export type OpenRealmResult = {
  success: boolean;
  message?: string;
  error?: string;
};

export type SearchProductsResult = {
  success: boolean;
  products: ProductSegmentedData[];
  totalCount: number;
  returnedCount: number;
  error?: string;
};

export type QueryObjectsResult = {
  success: boolean;
  objects: unknown[];
  totalCount: number;
  returnedCount: number;
  error?: string;
};

export type ShoppingListEntry = {
  productId: string;
  quantity: number;
  tag: string;
};

export type ShoppingListResult = {
  success: boolean;
  entries: ShoppingListEntry[];
  error?: string;
};

export type ProductsGroupDescription = {
  _id: string;
  customerId: string;
  name: string;
  description: string;
  mobileText: string;
  mobileColor: string;
  purposesLabel: string;
  priority: number;
};

export type ProductsGroupDescriptionsResult = {
  success: boolean;
  descriptions: ProductsGroupDescription[];
  error?: string;
};

export type CategoryData = {
  _id: string;
  name: string;
  parent: string | null;
  icon: string | null;
  tags: string[];
};

export type CategoriesResult = {
  success: boolean;
  categories: CategoryData[];
  error?: string;
};

export type SiteConfig = {
  disableCart: boolean;
  hidePrices: boolean;
  limitAddingByStock: boolean;
  hasStockEnabled: boolean;
  enableSellerDiscount: boolean;
  disableManualDiscount: boolean;
  enableNegativeDiscount: boolean;
  showTaxedPrice: boolean;
  maxItems: number;
  minOrderValue: number;
  maintenanceMode: boolean;
};

export type SiteConfigResult = {
  success: boolean;
  config: SiteConfig;
  error?: string;
};

