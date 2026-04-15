import BaseData from '../base-data';
import Id from '../id';

interface ICouponUsage extends BaseData {
  customerId: Id;
  domain: string;
  couponId: Id;
  commerceId: Id;
  legacyId?: Id;
  orderId: Id;
}

export default ICouponUsage;
