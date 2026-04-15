import type { IPromotionRule } from '../../../types/promotion-rule';
import { Product } from '../../product';
import type { CalculatePriceFunction } from './promotion-rule-applier';
import PromotionRuleApplier from './promotion-rule-applier';

class StepPromotionRuleApplier extends PromotionRuleApplier {
  protected override applyDiscount(
    products: Array<Product>, 
    promotionRule: IPromotionRule, 
    calculatePriceFunction: CalculatePriceFunction
  ): Array<Product> {
    return products.map(product => {
      const promotedPrice = calculatePriceFunction(product.promotedPrice, promotionRule.discountValue);
      product.steps.push({
        amountMinValue: promotionRule.amountMinValue,
        promotedPrice
      });

      if(promotionRule.amountMinValue <= 0) {
        product.setPromotedPrice(promotedPrice);
      }

      product.promotionRules.push(promotionRule);
      return product;
    });
  }  
}

export default StepPromotionRuleApplier;
