import NumberDiscountError from '../../../errors/type/discount/number-discount-error';
import type { IPromotionRule } from '../../../types/promotion-rule';
import { Product } from '../../product';
import discountCalculator from '../../product/calculators/discount-calculator';
import PromotionRuleApplierBase from './promotion-rule-applier-base';

export type CalculatePriceFunction = (price: number, discountValue: number) => number;
class PromotionRuleApplier<TPromotionRule extends IPromotionRule = IPromotionRule> extends PromotionRuleApplierBase<TPromotionRule> {
  override apply(products: Array<Product>, promotionRule: TPromotionRule): Array<Product> {
    if(typeof promotionRule.discountValue !== 'number') {
      throw new NumberDiscountError();
    }

    const calculateFunction = discountCalculator.fetchDiscountCalculateFunctionByDiscountCategory(promotionRule.discountCategory);
    return this.applyDiscount(products, promotionRule, calculateFunction);
  }

  protected fetchFactor(promotionRule: TPromotionRule): number {
    let factor = 1;
    if(promotionRule.exceededAmount && promotionRule.amountMaxValue) {
      factor = promotionRule.amountMaxValue / promotionRule.exceededAmount;
    }
    
    return factor;
  }

  protected applyDiscount(products: Array<Product>, promotionRule: TPromotionRule, calculatePriceFunction: CalculatePriceFunction): Array<Product> {
    return products.map(product => {
      product.setPromotedPrice(this.fetchPrice(product.promotedPrice, promotionRule, calculatePriceFunction));
      return product;
    });
  }

  protected fetchPrice(price: number, promotionRule: TPromotionRule, calculatePriceFunction: CalculatePriceFunction): number {
    return calculatePriceFunction(price, promotionRule.discountValue * this.fetchFactor(promotionRule));
  }
}

export default PromotionRuleApplier;
