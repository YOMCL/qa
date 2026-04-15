import type Id from './id';

type ProductOrder = {
  productId: Id;
};

type Order = {
  products: Array<ProductOrder>;
};

export default Order;
export type { ProductOrder };
