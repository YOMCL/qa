import { DiscountCategoryKeys } from '../../../types';
import GeneralTypeError from '../general-type-error';

class FixedOrPercentageDiscountCategoryError extends GeneralTypeError {
  constructor() {
    super('Discount category', `"${DiscountCategoryKeys.Fixed}", "${DiscountCategoryKeys.Percentage}" or "${DiscountCategoryKeys.NewPrice}"`);
  }
}

export default FixedOrPercentageDiscountCategoryError;
