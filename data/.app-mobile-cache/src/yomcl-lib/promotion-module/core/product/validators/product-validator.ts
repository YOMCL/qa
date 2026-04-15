import type IDiscountBase from '../../../types/discount-base';
import type Product from '../product';
import ProductValidatorBase from './product-validator-base';

class ProductValidator<TDiscount extends IDiscountBase = IDiscountBase> extends ProductValidatorBase<TDiscount> {
  isValid(product: Product, promotion: TDiscount): boolean {
    const { brand, category, categories, line, matrix } = promotion;
    const productIds = promotion.productIds?.map((productId) => productId.toString());

    const productHasBrand = Boolean(brand && product.brand === brand);
    const productHasCategory = Boolean(category && product.category === category);
    const productHasCategories = Boolean(categories && categories.some((categoriesElem) => product.categories.includes(categoriesElem)));
    const productHasLine = Boolean(line && product.line === line);
    const productHasMatrix = Boolean(matrix && product.matrix === matrix);
    const isProductInProductIds = Boolean(productIds && productIds.includes(product.id.toString()));

    return productHasBrand || productHasCategory || productHasLine || productHasMatrix || isProductInProductIds || productHasCategories;
  }
}

export default ProductValidator;
