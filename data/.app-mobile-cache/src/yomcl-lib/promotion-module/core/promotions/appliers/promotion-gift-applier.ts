import type IGift from '../../../types/gift';
import type { IPromotion } from '../../../types/promotion';
import AggregatorApplier from '../../aggregator-applier';
import { Product } from '../../product';
import ProductValidator from '../../product/validators/product-validator';
import type ProductValidatorBase from '../../product/validators/product-validator-base';
import GiftPromotionRuleValidator from '../../promotion-rule/validators/gift-promotion-rule-validator';

class PromotionGiftApplier extends AggregatorApplier<Array<Product>, IPromotion, IGift> {
  #giftPromotionRuleValidator: GiftPromotionRuleValidator;
  #productValidator: ProductValidatorBase;

  constructor(productValidator?: ProductValidatorBase) {
    super();

    this.#productValidator = new ProductValidator();
    this.#giftPromotionRuleValidator = new GiftPromotionRuleValidator();

    if(productValidator) {
      this.#productValidator = productValidator;
    }
  }

  get giftPromotionRuleValidator(): GiftPromotionRuleValidator {
    return this.#giftPromotionRuleValidator;
  }

  get productValidator(): ProductValidatorBase {
    return this.#productValidator;
  }

  apply(products: Array<Product>, promotion: IPromotion): Array<IGift> {
    const validProducts = this.productValidator.fetchValidValues(products, promotion);
    const validPromotionRules = this.giftPromotionRuleValidator.fetchValidValues(promotion.promotionRules, validProducts);

    const gifts = [];

    for(const validPromotionRule of validPromotionRules) {
      if(validPromotionRule.gift) {
        gifts.push(validPromotionRule.gift);
      }
    }

    return gifts;
  }
}

export default PromotionGiftApplier;
