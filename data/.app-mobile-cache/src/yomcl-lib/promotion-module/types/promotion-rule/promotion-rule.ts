import type PromotionRuleBase from './promotion-rule-base';

interface IPromotionRule extends PromotionRuleBase {
  discountValue: number;
};

export default IPromotionRule;
