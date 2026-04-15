import FixedOrPercentageDiscountCategoryError from '../../../errors/type/discount/fixed-or-percentage-discount-category-error';
import NumberDiscountError from '../../../errors/type/discount/number-discount-error';
import type { IPromotionRule } from '../../../types/promotion-rule';
import { DiscountCategoryKeys } from '../../../types/discount-category';
import { Product } from '../../product';
import discountCalculator from '../../product/calculators/discount-calculator';
import totalPriceCalculator from '../../product/calculators/total-price-calculator';
import PromotionRuleApplier from './promotion-rule-applier';

class CouponPromotionRuleApplier extends PromotionRuleApplier {
  #maxDiscountLimit?: number;
  #isAssociatedWithOneProduct?: boolean;

  constructor(maxDiscountLimit?: number, isAssociatedWithOneProduct?: boolean) {
    super();
    this.#maxDiscountLimit = maxDiscountLimit;
    this.#isAssociatedWithOneProduct = isAssociatedWithOneProduct;
  }

  get maxDiscountLimit(): number | undefined {
    return this.#maxDiscountLimit;
  }

  get isAssociatedWithOneProduct(): boolean | undefined {
    return this.#isAssociatedWithOneProduct;
  }

  override apply(products: Array<Product>, promotionRule: IPromotionRule): Array<Product> {
    if(typeof promotionRule.discountValue !== 'number') {
      throw new NumberDiscountError();
    }

    if(promotionRule.discountCategory === DiscountCategoryKeys.Gift) {
      throw new FixedOrPercentageDiscountCategoryError();
    }
    
    const discountCriteria = { 
      discountCategory: promotionRule.discountCategory, 
      discountValue: promotionRule.discountValue,
      maxDiscountLimit: this.maxDiscountLimit,
      isAssociatedWithOneProduct: this.isAssociatedWithOneProduct,
    };
    const totalCouponDiscount = discountCalculator.calculate(
      products, 
      discountCriteria
    );    

    const couponDiscountPercentage = totalCouponDiscount / totalPriceCalculator.calculate(products); 

    return this.applyDiscount(products, { ...promotionRule, discountValue: couponDiscountPercentage }, discountCalculator.calculatePercentagePrice); 
  }

}   

export default CouponPromotionRuleApplier;
