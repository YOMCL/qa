import { FixedOrPercentageDiscountCategoryError } from '../../../errors';
import type { DiscountCriteria, IDiscountCalculator } from '../../../types/calculator';
import type DiscountCategory from '../../../types/discount-category';
import { DiscountCategoryKeys } from '../../../types/discount-category';
import type { IProduct } from '../../../types/product';
import fetchSafeNumber from '../../utils/fetch-safe-number';
import totalPriceCalculator from './total-price-calculator';

type DiscountCalculatorMethodsByDiscountType = Record<
  string,
  (products: Array<IProduct>, discountValue: number, isAssociatedWithOneProduct?: boolean) => number
>;
type DiscountCalculateFunction = (price: number, discountValue: number) => number;

type DiscountCalculateFunctionByDiscountCategory = Map<
  DiscountCategory,
  DiscountCalculateFunction
>;

class DiscountCalculator implements IDiscountCalculator {
  #totalDicountCalculatorByType: DiscountCalculatorMethodsByDiscountType = {
    [DiscountCategoryKeys.Fixed]: this.calculateTotalFixedDiscount.bind(this),
    [DiscountCategoryKeys.NewPrice]: this.calculateTotalNewPriceDiscount.bind(this),
    [DiscountCategoryKeys.Percentage]: this.calculateTotalPercentageDiscount.bind(this)
  };

  #priceCalculatorByType: DiscountCalculateFunctionByDiscountCategory = new Map([
    [DiscountCategoryKeys.Fixed, this.calculateFixedPrice.bind(this)],
    [DiscountCategoryKeys.NewPrice, this.calculateNewPrice.bind(this)],
    [DiscountCategoryKeys.Percentage, this.calculatePercentagePrice.bind(this)]
  ]);

  fetchDiscountCalculateFunctionByDiscountCategory(discountCategory: DiscountCategory): DiscountCalculateFunction {
    const discountCalculateFunction = this.#priceCalculatorByType.get(discountCategory);
    if(!discountCalculateFunction) {
      throw new FixedOrPercentageDiscountCategoryError();
    }

    return discountCalculateFunction;
  }

  calculateFixedPrice(price: number, discountValue: number): number {
    return fetchSafeNumber(price - discountValue);
  }

  calculatePercentagePrice(price: number, discountValue: number): number {
    let validatedDiscountValue = discountValue;
    while(validatedDiscountValue > 1) {
      validatedDiscountValue /= 100;
    }

    return fetchSafeNumber(price * (1 - validatedDiscountValue));
  }

  calculateNewPrice(price: number, discountValue: number): number {
    return fetchSafeNumber(discountValue);
  }

  calculateTotalFixedDiscount(products: Array<IProduct>, discountValue: number, isAssociatedWithOneProduct?: boolean): number {
    if (isAssociatedWithOneProduct) {
      const { amount, price } = products[0];
      return (price - this.calculateFixedPrice(price, discountValue)) * amount;
    }
    
    return discountValue;
  }

  calculateTotalPercentageDiscount(products: Array<IProduct>, discountValue: number): number {
    return products.reduce((total, product) => total + (product.amount * (product.price - this.calculatePercentagePrice(product.price, discountValue))), 0);
  }

  calculateTotalNewPriceDiscount(products: Array<IProduct>, discountValue: number, isAssociatedWithOneProduct?: boolean): number {
    if (isAssociatedWithOneProduct) {
      return products[0].amount * (products[0].price - this.calculateNewPrice(products[0].price, discountValue));
    }
    return totalPriceCalculator.calculate(products) - discountValue;
  }

  calculate(products: Array<IProduct>, discountCriteria: DiscountCriteria): number {
    const { discountCategory, discountValue, maxDiscountLimit, isAssociatedWithOneProduct } = discountCriteria;
    const totalDiscount = this.#totalDicountCalculatorByType[discountCategory](products, discountValue, isAssociatedWithOneProduct);
    if (maxDiscountLimit && totalDiscount > maxDiscountLimit) {
      return maxDiscountLimit;
    }
    return totalDiscount; 
  }
}

export default new DiscountCalculator();
