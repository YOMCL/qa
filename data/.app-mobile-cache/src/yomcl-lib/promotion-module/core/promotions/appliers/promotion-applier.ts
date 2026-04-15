import type IDiscountBase from '../../../types/discount-base';
import type PromotionRuleBase from '../../../types/promotion-rule/promotion-rule-base';
import type { IProduct } from '../../../types/product';
import type { PromotedProduct } from '../../../types/product';
import { PromotionTypesKeys } from '../../../types/promotion-type';
import AccumulativeApplier from '../../accumulative-applier';
import { Product } from '../../product';
import totalPriceCalculator from '../../product/calculators/total-price-calculator';
import totalPromotedPriceCalculator from '../../product/calculators/total-promoted-price-calculator';
import type ProductValidatorBase from '../../product/validators/product-validator-base';
import type PromotionRuleApplierBase from '../../promotion-rule/appliers/promotion-rule-applier-base';
import type PromotionRuleValidatorBase from '../../promotion-rule/validators/promotion-rule-validator-base';

export type PromotionApplierResponse = {
  appliedDiscounts: Array<IDiscountBase>;
  promotedProducts: Array<PromotedProduct>;
  totalPrice: number;
  totalPromotedPrice: number;
};

export type FetchValidValuesResponse = {
  validProducts: Array<Product>;
  validPromotionRules: Array<PromotionRuleBase>;
};

export type AppliedDiscount = IDiscountBase & {
  appliedPromotionRuleIndex?: number;
};

class PromotionApplier extends AccumulativeApplier<Array<IProduct>, IDiscountBase, Array<Product>> {
  #appliedDiscounts: Array<AppliedDiscount> = [];
  #productValidator: ProductValidatorBase;
  #promotionRuleValidator: PromotionRuleValidatorBase;
  #promotionRuleApplier: PromotionRuleApplierBase;
  
  constructor(promotionRuleValidator: PromotionRuleValidatorBase, promotionRuleApplier: PromotionRuleApplierBase, productValidator: ProductValidatorBase) {
    super();
    this.#promotionRuleValidator = promotionRuleValidator;
    this.#promotionRuleApplier = promotionRuleApplier;
    this.#productValidator = productValidator;
  }

  get productValidator(): ProductValidatorBase {
    return this.#productValidator;
  }

  get promotionRuleValidator(): PromotionRuleValidatorBase {
    return this.#promotionRuleValidator;
  }

  get promotionRuleApplier(): PromotionRuleApplierBase {
    return this.#promotionRuleApplier;
  }

  get appliedDiscounts(): Array<AppliedDiscount> {
    return this.#appliedDiscounts;
  }

  apply(products: Array<Product>, discount: IDiscountBase): Array<Product> {
    const { validProducts, validPromotionRules } = this.fetchValidValues(products, discount);
    this.pushAppliedDiscount(discount, validPromotionRules);

    this.promotionRuleApplier.applyAll(validProducts, validPromotionRules);

    const promotedProducts: Array<Product> = products.map((product) => {
      const promotedProduct = this.promotionRuleApplier.result.find((promoted) => promoted.id === product.id);
      
      if(promotedProduct) {
        return promotedProduct;
      }

      return product;
    });

    return promotedProducts;
  }

  fetchResponse(products: Array<IProduct>, discounts: Array<IDiscountBase>): PromotionApplierResponse {
    const instanceProducts = products.map(product => (new Product(product)));
    const orderedDiscounts = this.orderDiscounts(discounts);
    const promotedProducts = this.applyAll(instanceProducts, orderedDiscounts).map(promotedProduct => promotedProduct.toJSON());

    return {
      appliedDiscounts: this.appliedDiscounts,
      promotedProducts,
      totalPrice: totalPriceCalculator.calculate(products),
      totalPromotedPrice: totalPromotedPriceCalculator.calculate(promotedProducts)
    };
  }

  protected fetchValidValues(products: Array<Product>, discount: IDiscountBase): FetchValidValuesResponse {
    const validProducts = this.productValidator.fetchValidValues(products, discount);
    const validPromotionRules = this.promotionRuleValidator.fetchValidValues(discount.promotionRules, validProducts);
    return { validProducts, validPromotionRules };
  }

  protected pushAppliedDiscount(discount: IDiscountBase, validPromotionRules: Array<PromotionRuleBase>): void {
    if(validPromotionRules.length > 0) {
      const promotionRule = discount.promotionRules.find(
        (rule) => rule.amountMinValue === validPromotionRules[0].amountMinValue && rule.amountMaxValue === validPromotionRules[0].amountMaxValue
      );
      const appliedPromotionRuleIndex = promotionRule ? promotionRule.priority : undefined;
      this.appliedDiscounts.push({
        ...discount,
        appliedDiscountId: discount._id,
        appliedPromotionRuleIndex,
        promotionRules: validPromotionRules,
      });
    }
  }

  protected orderDiscounts(discounts: Array<IDiscountBase>): Array<IDiscountBase> {
    const DEFAULT_ORDER = 4;
    const typeOrder: Record<string, number> = {
      [PromotionTypesKeys.Catalog]: 1,
      [PromotionTypesKeys.Step]: 2,
      [PromotionTypesKeys.MixedStep]: 3,
    };

    return discounts.sort((discountA, discountB) => {
      const typeA = typeOrder[discountA.type] || DEFAULT_ORDER;
      const typeB = typeOrder[discountB.type] || DEFAULT_ORDER;

      return typeA - typeB;
    });
  }
}

export default PromotionApplier;
