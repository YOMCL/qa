import PromotionRuleValidatorBase from './promotion-rule-validator-base';

class StepPromotionRuleValidator extends PromotionRuleValidatorBase {
  override isValid(): boolean {
    return true;
  }
}

export default StepPromotionRuleValidator;
