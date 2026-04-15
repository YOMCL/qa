import InvalidResource from './invalid-resource';

class InvalidCoupon extends InvalidResource {
  constructor(id: string, reason: string, code = 'INVALID_COUPON') {
    super('Coupon', id, reason, code);
  }
}

export default InvalidCoupon;
