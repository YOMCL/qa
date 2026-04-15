import type IDiscountBase from '../../../types/discount-base';
import { Product } from '../../product';
import PromotionApplier from '../../promotions/appliers/promotion-applier';
import type { FetchValidValuesResponse } from '../../promotions/appliers/promotion-applier';


class CouponApplier extends PromotionApplier {
  override fetchValidValues(products: Array<Product>, discount: IDiscountBase): FetchValidValuesResponse {
    const validProducts = this.productValidator.fetchValidValues(products, discount);
    const validPromotionRules = this.promotionRuleValidator.fetchValidValues(discount.promotionRules, products);
    return { validProducts, validPromotionRules };
  }
}

export default CouponApplier;
