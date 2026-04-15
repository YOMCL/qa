import type Id from '../id';
import type IPromotionRule from './promotion-rule';

interface BundlePromotionRule extends IPromotionRule {
  productId: Id;
}

export default BundlePromotionRule;
