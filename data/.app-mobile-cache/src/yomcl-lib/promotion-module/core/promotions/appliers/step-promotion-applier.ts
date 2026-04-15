import type IDiscountBase from '../../../types/discount-base';
import { IProduct } from '../../../types/product';
import { Product } from '../../product';
import type { PromotionApplierResponse } from './promotion-applier';
import PromotionApplier from './promotion-applier';

export type SiblingProduct = {
  value: string;
  type: string;
};

class StepPromotionApplier extends PromotionApplier {
  override fetchResponse(products: Array<IProduct>, discounts: Array<IDiscountBase>): PromotionApplierResponse {
    const response = super.fetchResponse(products, discounts);
    response.promotedProducts = response.promotedProducts.map((product) => {
      const relatedDiscounts = discounts.filter(discount => this.productValidator.isValid(new Product(product), discount));
      return {
        ...product,
        siblingProducts: this.fetchSiblingProducts(product, discounts),
        relatedDiscounts
      };
    });

    return {
      ...response,
      appliedDiscounts: []
    };
  }

  protected fetchSiblingProducts(product: IProduct, discounts: Array<IDiscountBase>): Array<SiblingProduct> {
    const siblings: Array<SiblingProduct> = [];
    for(const discount of discounts) {
      if(discount.productIds && discount.productIds.length > 1) {
        const productIds = discount.productIds.map((productId) => productId.toString());

        for(const productId of productIds) {
          siblings.push({
            type: 'products',
            value: productId
          });
        }
      }
      if(discount.brand) {
        siblings.push({
          type: 'brand',
          value: product.brand
        });
      }
      if(discount.category) {
        siblings.push({
          type: 'category',
          value: product.category
        });
      }
      if(discount.line) {
        siblings.push({
          type: 'line',
          value: product.line
        });
      }
      if(discount.matrix) {
        siblings.push({
          type: 'matrix',
          value: product.matrix,
        });
      }
    }

    return siblings;
  }

}

export default StepPromotionApplier;
