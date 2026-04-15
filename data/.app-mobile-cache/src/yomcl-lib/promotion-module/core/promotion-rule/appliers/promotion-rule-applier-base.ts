import type PromotionRuleBase from '../../../types/promotion-rule/promotion-rule-base';
import ApplierBase from '../../accumulative-applier';
import { Product } from '../../product';

abstract class PromotionRuleApplierBase<TPromotionRule extends PromotionRuleBase = PromotionRuleBase>
  extends ApplierBase<Array<Product>, TPromotionRule, Array<Product>> {
  sortPromotionRules(promotionRules: Array<TPromotionRule>): Array<TPromotionRule> {
    return promotionRules.sort((ruleA, ruleB) => ruleA.priority - ruleB.priority);
  }

  override applyAll(products: Array<Product>, promotionRules: Array<TPromotionRule>): Array<Product> {
    const sortedPromotionRules = this.sortPromotionRules(promotionRules);
    return super.applyAll(products, sortedPromotionRules);
  }
}

export default PromotionRuleApplierBase;
