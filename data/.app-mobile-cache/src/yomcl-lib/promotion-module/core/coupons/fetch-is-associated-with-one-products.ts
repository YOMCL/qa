import type { ICoupon } from '../../types/coupon';

export default function fetchIsAssociatedWithOneProduct(coupon: ICoupon): boolean {
  return coupon.productIds?.length === 1;
};
