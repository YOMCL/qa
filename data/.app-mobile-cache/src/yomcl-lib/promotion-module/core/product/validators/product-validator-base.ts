import type IDiscountBase from '../../../types/discount-base';
import ValidatorBase from '../../validator-base';
import type Product from '../product';

abstract class ProductValidatorBase<TDiscount extends IDiscountBase = IDiscountBase > extends ValidatorBase<Product, TDiscount> {}

export default ProductValidatorBase;
