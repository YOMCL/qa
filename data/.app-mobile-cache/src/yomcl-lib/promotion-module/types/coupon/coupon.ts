import type CouponTypes from './coupon-type';
import type DiscountMode from '../discount-modes';
import type Id from '../id';
import type IDiscountBase from '../discount-base';
import type ICouponRestriction from './coupon-restriction';

interface ICoupon extends IDiscountBase {
  code: string;
  manualCode: boolean;
  options?: Array<string>;
  commerceId?: Id;
  commerceIdsFilter?: Array<Id>;
  discountMode: DiscountMode;
  stockPerCommerce?: number;
  maxDiscountLimit?: number;
  restrictions?: Array<ICouponRestriction>;
  type: CouponTypes;
};

export default ICoupon;
