import type IDiscountBase from '../discount-base';
import type PromotionTypes from '../promotion-type';

type IPromotion = IDiscountBase & {
  bundleName?: string;
  description?: string;
  imagePath?: string;
  sku?: string;
  type: PromotionTypes;
};

export default IPromotion;
