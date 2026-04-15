import type { Product, Steps } from '@yomcl/types';
import { IPromotionRule } from '../../../promotion-module';

export type CartProduct = {
  product: Product;
  quantity: number;
  multiplier: number;
  sellerDiscount: number;
  appliedDiscounts: IPromotionRule[];
  steps: Steps[];
};
