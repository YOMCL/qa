import type PromotionRuleBase from '../../../types/promotion-rule/promotion-rule-base';
import type { IProduct } from '../../../types/product';
import ValidatorBase from '../../validator-base';
abstract class PromotionRuleValidatorBase<TPromotionRule extends PromotionRuleBase = PromotionRuleBase> extends ValidatorBase<TPromotionRule, Array<IProduct>> {
  fetchValidValues(promotionRules: Array<TPromotionRule>, products: Array<IProduct>): Array<TPromotionRule> {
    const sortedPromotionRules = [...promotionRules].sort((ruleA, ruleB) => ruleA.amountMinValue - ruleB.amountMinValue);
    
    return super.fetchValidValues(
      sortedPromotionRules.map((promotionRule, index) => ({
        ...promotionRule,
        nextAmountMinValue: sortedPromotionRules[index + 1]?.amountMinValue || Infinity
      })),
      products
    );
  }
}

export default PromotionRuleValidatorBase;
