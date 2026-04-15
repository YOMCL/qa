import type ProductCalculator from '../../../types/calculator/product-calculator';
import type { PromotedProduct } from '../../../types/product';
import handleFloating from '../../utils/handle-floating';

export class TotalPromotedPriceCalculator implements ProductCalculator {
  calculate(products: Array<PromotedProduct>): number {
    return handleFloating(products.reduce((total, product) => total + ( product.promotedPrice * product.amount) , 0));
  }
}

export default new TotalPromotedPriceCalculator();
