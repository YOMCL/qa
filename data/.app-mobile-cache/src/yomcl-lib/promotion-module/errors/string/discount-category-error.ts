import type DiscountCategory from '../../types/discount-category';
import StringTypeError from './string-type-error';

class DiscountCategoryError extends StringTypeError {
  constructor(discountCategory: DiscountCategory) {
    super('discount category', discountCategory);
    
    this.name = this.constructor.name;
  }
}

export default DiscountCategoryError;
