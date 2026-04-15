import { ProductSegmentedData } from '../product.types';

export type SearchProductsResult = {
  success: boolean;
  products: ProductSegmentedData[];
  totalCount: number;
  returnedCount: number;
  error?: string;
};
