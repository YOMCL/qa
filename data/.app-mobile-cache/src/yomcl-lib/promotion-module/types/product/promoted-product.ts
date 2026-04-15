import type IProduct from './product';

type PromotedProduct = IProduct & {
  promotedPrice: IProduct['price'];
};

export default PromotedProduct;
