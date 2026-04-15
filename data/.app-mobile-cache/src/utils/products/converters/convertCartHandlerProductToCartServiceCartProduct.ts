import { CartProductUI } from '../../../types/product-ui.types';
import { CartProduct } from '../../../yomcl-lib';
import { convertCartHandlerToCartProduct } from '../../cartConverter';

export const convertCartHandlerProductToCartServiceCartProduct = (
  cartProduct: CartProduct
): CartProductUI => {
  return convertCartHandlerToCartProduct(cartProduct);
};


