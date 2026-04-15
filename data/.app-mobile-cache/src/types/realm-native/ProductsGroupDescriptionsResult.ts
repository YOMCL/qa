import { ProductsGroupDescription } from './ProductsGroupDescription';

export type ProductsGroupDescriptionsResult = {
  success: boolean;
  descriptions: ProductsGroupDescription[];
  error?: string;
};
