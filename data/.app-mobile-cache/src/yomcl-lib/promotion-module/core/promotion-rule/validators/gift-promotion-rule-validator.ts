import type PromotionRuleBase from '../../../types/promotion-rule/promotion-rule-base';
import type { IProduct } from '../../../types/product';
import PromotionRuleValidator from './promotion-rule-validator';

class GiftPromotionRuleValidator extends PromotionRuleValidator {
  override isValid(promotionRule: PromotionRuleBase, products: Array<IProduct>): boolean {
    if(!promotionRule.gift) {
      return false;
    }

    return super.isValid(promotionRule, products);
  }
}

export default GiftPromotionRuleValidator;
