import type DiscountCategory from '../discount-category';
import type IGift from '../gift';

interface PromotionRuleBase {
  amountMaxValue?: number;
  amountMinValue: number;
  amountType: string;
  discountCategory: DiscountCategory;
  discountValue?: number;
  exceededAmount?: number;
  gift?: IGift;
  nextAmountMinValue?: number;
  priority: number;
}

export default PromotionRuleBase;
