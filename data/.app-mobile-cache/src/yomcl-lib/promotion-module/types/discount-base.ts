import type BaseData from './base-data';
import type Id from './id';
import type PromotionRuleBase from './promotion-rule/promotion-rule-base';

interface IDiscountBase extends BaseData {
  _id?: Id;
  appliedDiscountId?: Id;
  brand?: string;
  category?: string;
  categories?: string[];
  commerceSegments?: string[];
  customerId: Id;
  domain: string;
  endDate?: Date;
  externalId?: string;
  inactiveAt?: Date;
  legacyId?: Id;
  line?: string;
  matrix?: string;
  name: string;
  productIds?: Id[];
  promotionRules: PromotionRuleBase[];
  segmentIds?: Id[];
  startDate?: Date;
  stock?: number;
  type: string;
}

export default IDiscountBase;
