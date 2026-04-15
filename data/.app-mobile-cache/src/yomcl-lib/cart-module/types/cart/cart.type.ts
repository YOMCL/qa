import type { Pricing } from '@yomcl/types';
import type { CartProduct } from './cart-product.type';

export type Cart = {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
  commerceId?: string;
  customerId?: string;
  guestId?: string;
  domain: string;
  cartProducts: CartProduct[];
  pricing: Pricing;
  sellerDiscount?: number;
};
