import NotFoundError from './not-found-error';

class CouponNotFoundError extends NotFoundError {
  constructor(id: string, field = 'id', code = 'COUPON_NOT_FOUND') {
    super('Coupon', id, field, code);
  }
}

export default CouponNotFoundError;
