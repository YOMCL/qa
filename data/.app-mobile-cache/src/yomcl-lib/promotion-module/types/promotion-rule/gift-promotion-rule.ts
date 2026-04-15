import type IGift from '../gift';
import type PromotionRuleBase from './promotion-rule-base';

interface GiftPromotionRule extends PromotionRuleBase {
  gift: IGift;
}

export default GiftPromotionRule;
