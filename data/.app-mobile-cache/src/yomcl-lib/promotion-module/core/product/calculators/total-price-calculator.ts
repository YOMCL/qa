import type ProductCalculator from '../../../types/calculator/product-calculator';
import type { IProduct } from '../../../types/product';

export class TotalPriceCalculator implements ProductCalculator {
  calculate(products: Array<IProduct>): number {
    return products.reduce((total, product) => total + (product.price * product.amount), 0);
  }
}

export default new TotalPriceCalculator();
