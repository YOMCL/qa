import type { IPromotionRule }  from '../../types/promotion-rule';
import type Id from '../../types/id';
import type PackageUnit from '../../types/package-unit';
import type { IProduct } from '../../types/product';
import type { PromotedProduct } from '../../types/product';
import type { PackageFormat } from '../../types/product/product';
import type Step from '../../types/product/step';
import Prototype from '../prototype';
import fetchSafeNumber from '../utils/fetch-safe-number';

class Product 
  extends Prototype<PromotedProduct> 
  implements IProduct {
  #product: IProduct;
  #promotedPrice?: number;
  #steps: Array<Step> = [];
  #promotionRules: Array<IPromotionRule> = [];

  constructor(product: IProduct) {
    super();
    this.#product = product;
  }

  get amount(): number {
    return fetchSafeNumber(this.#product.amount);
  }

  get brand(): string {
    return this.#product.brand;
  }

  get category(): string {
    return this.#product.category;
  }

  get categories(): Array<string> {
    return this.#product.categories || [];
  }

  get id(): Id {
    return this.#product.id;
  }

  get line(): string {
    return this.#product.line;
  }

  get matrix(): string {
    return this.#product.matrix;
  }

  get packageFormats(): Array<PackageFormat> {
    return this.#product.packageFormats;
  }

  get packageUnit(): PackageUnit {
    return this.#product.packageUnit;
  }

  get price(): number {
    return fetchSafeNumber(this.#product.price);
  }

  get promotedPrice(): number {
    if(!this.#promotedPrice && this.#promotedPrice !== 0) {
      this.#promotedPrice = this.price;

      if(typeof this.#product.promotedPrice === 'number') {
        this.#promotedPrice = this.#product.promotedPrice;
      }
    }

    return fetchSafeNumber(this.#promotedPrice);
  }

  get totalPrice(): number {
    return this.price * this.amount;
  }

  get totalPromotedPrice(): number {
    return this.promotedPrice * this.amount;
  }

  get steps(): Array<Step> {
    return this.#steps;
  }

  get promotionRules(): Array<IPromotionRule> {
    return this.#promotionRules;
  }

  setPromotedPrice(promotedPrice: number): void {
    this.#promotedPrice = promotedPrice;
  }
}

export default Product;
