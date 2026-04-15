import {
  CouponApplier,
  type ICoupon,
  type IProduct,
  type Product,
  ProductValidator,
  PromotionApplier,
  type PromotionApplierResponse,
  PromotionGiftApplier,
  PromotionRuleApplier,
  PromotionRuleValidator,
  PromotionTypesKeys,
  StepPromotionApplier,
} from '../../promotion-module';
import type { CartProduct } from '../types';
import type { IPromotionService } from '../types/contracts';
import type IDiscountBase from '../../promotion-module/types/discount-base';

export class PromotionService implements IPromotionService {
  private readonly promotionApplier: PromotionApplier;
  private readonly stepPromotionApplier: StepPromotionApplier;
  private readonly couponApplier: CouponApplier;
  private readonly promotionGiftApplier: PromotionGiftApplier;

  constructor() {
    const productValidator = new ProductValidator();
    const promotionRuleValidator = new PromotionRuleValidator();
    const promotionRuleApplier = new PromotionRuleApplier();

    this.promotionApplier = new PromotionApplier(
      promotionRuleValidator,
      promotionRuleApplier,
      productValidator,
    );

    this.stepPromotionApplier = new StepPromotionApplier(
      promotionRuleValidator,
      promotionRuleApplier,
      productValidator,
    );

    this.couponApplier = new CouponApplier(
      promotionRuleValidator,
      promotionRuleApplier,
      productValidator,
    );

    this.promotionGiftApplier = new PromotionGiftApplier(productValidator);
  }

  calculatePromotions(
    cartProducts: CartProduct[],
    availableDiscounts: IDiscountBase[],
  ): PromotionApplierResponse {
    const products: IProduct[] = cartProducts.map(cp => {
      return this.mapCartProductToIProduct(cp);
    });

    const regularPromotions = availableDiscounts.filter(
      d =>
        d.type !== PromotionTypesKeys.Step &&
        d.type !== PromotionTypesKeys.MixedStep &&
        d.type !== PromotionTypesKeys.Gift,
    );

    const stepPromotions = availableDiscounts.filter(
      d => d.type === PromotionTypesKeys.Step || d.type === PromotionTypesKeys.MixedStep,
    );

    let result = this.promotionApplier.fetchResponse(products, regularPromotions);

    if (stepPromotions.length > 0) {
      result = this.stepPromotionApplier.fetchResponse(result.promotedProducts, stepPromotions);
    }

    return result;
  }

  applyCoupon(products: CartProduct[], coupon: ICoupon & IDiscountBase): PromotionApplierResponse {
    return this.couponApplier.fetchResponse(
      products.map(cp => this.mapCartProductToIProduct(cp)) as Product[],
      [coupon],
    );
  }

  private mapCartProductToIProduct(cartProduct: CartProduct): IProduct {
    const tags = cartProduct.product.tags ?? [];
    const primaryCategory = tags.length > 0 ? tags[0] : undefined;

    return {
      id: cartProduct.product._id ?? cartProduct.product.id,
      amount: cartProduct.quantity,
      brand: cartProduct.product.brand ?? '',
      category: primaryCategory,
      categories: tags,
      line: (cartProduct.product as any).line ?? '',
      matrix: (cartProduct.product as any).matrix ?? '',
      domain: cartProduct.product.domain,
      price: cartProduct.product.pricing?.pricePerUnit ?? 0,
      packageFormats: (cartProduct.product as any).packageFormats ?? [],
      packageUnit: (cartProduct.product as any).packageUnit ?? '',
    } as unknown as IProduct;
  }
}
