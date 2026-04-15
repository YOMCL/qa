import type { IPromotionRule } from '../promotion-rule';
import type PromotedProduct from './promoted-product';

type Step = 
  Pick<PromotedProduct, 'promotedPrice'> & 
  Pick<IPromotionRule, 'amountMinValue'>;

export default Step;
