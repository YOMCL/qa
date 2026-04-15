import type { ProductCalculator } from '../../../types/calculator';
import type PromotionRuleBase from '../../../types/promotion-rule/promotion-rule-base';
import type AmountType from '../../../types/amount-type';
import { ReservedAmountTypes } from '../../../types/amount-type';
import type { IProduct } from '../../../types/product';
import packageCalculator from '../../product/calculators/package-calculator';
import totalPriceCalculator from '../../product/calculators/total-price-calculator';
import PromotionRuleValidatorBase from './promotion-rule-validator-base';

class PromotionRuleValidator<TPromotionRule extends PromotionRuleBase = PromotionRuleBase> extends PromotionRuleValidatorBase<TPromotionRule> {
  #productCalculatorsByAmountType?: Map<AmountType, ProductCalculator>;

  get productCalculatorsByAmountType(): Map<AmountType, ProductCalculator> {
    if(!this.#productCalculatorsByAmountType) {
      this.#productCalculatorsByAmountType = new Map<AmountType, ProductCalculator>([
        [ReservedAmountTypes.Money, totalPriceCalculator],
      ]);
    }

    return this.#productCalculatorsByAmountType;
  }

  fetchProductCalculator(amountType: AmountType): ProductCalculator {
    const mappedProductCalculator = this.productCalculatorsByAmountType.get(amountType);
    if(mappedProductCalculator) {
      return mappedProductCalculator;
    }

    return packageCalculator;
  }

  isValid(promotionRule: TPromotionRule, products: Array<IProduct>): boolean {
    const productCalculator = this.fetchProductCalculator(promotionRule.amountType);
    const totalAmount = productCalculator.calculate(products, promotionRule.amountType);

    const isAmountGreaterThanMin = totalAmount >= promotionRule.amountMinValue;

    if(!promotionRule.amountMaxValue) {
      return isAmountGreaterThanMin;
    }

    const isAmountExceeded = totalAmount >= promotionRule.amountMaxValue;
    const isNextPromotionRuleAppliable = promotionRule.nextAmountMinValue && totalAmount < promotionRule.nextAmountMinValue;

    if(isAmountExceeded && isNextPromotionRuleAppliable && isAmountGreaterThanMin) {
      Object.assign(promotionRule, {
        exceededAmount: totalAmount
      });

      return true;
    }

    return isAmountGreaterThanMin && !isAmountExceeded;
  }
}

export default PromotionRuleValidator;
