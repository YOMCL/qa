import { CouponTypesKeys, type ICoupon } from '../../../types/coupon';

import type Product from '../product';
import ProductValidator from './product-validator';

class CouponProductValidator extends ProductValidator<ICoupon> {
  isValid(product: Product, coupon: ICoupon): boolean {
    if (coupon.type === CouponTypesKeys.Order) {
      return true;
    }
    return super.isValid(product, coupon);
  }
}

export default CouponProductValidator;
