import { CartProduct } from '../components/MyOrderTab/MyOrderTab';
import { PackagingOption, ProductSegmentedData } from '../types/product.types';

export type ProductConverterOptions = {
  tagKey?: string | null;
  translateTag?: (tag: string | null | undefined) => string;
  getTagColor?: (tag: string | null | undefined) => string;
  quantity?: number;
  _orderId_productId?: string;
};

export const createPackagingOptions = (packaging: any, productSku?: string): PackagingOption[] => {
  
  const formatKeyOrder: string[] = [];
  const formatKeyNameMap: { [key: string]: string } = {};
  const formatKeyAmountMap: { [key: string]: number } = {};

  if (packaging && packaging.genericFormats && packaging.genericFormats.length > 0) {
    for (const format of packaging.genericFormats) {
      formatKeyNameMap[format.key] = format.displayName;
      formatKeyAmountMap[format.key] = format.amount || 1;
      formatKeyOrder.push(format.key);
    }
  } else {
    formatKeyNameMap['unit'] = 'Unidad';
    formatKeyAmountMap['unit'] = 1;
    formatKeyOrder.push('unit');

    if (packaging) {
      if (packaging.unitName != null) {
        formatKeyNameMap['unit'] = packaging.unitName;
      }
      if (packaging.packageName != null) {
        formatKeyNameMap['package'] = packaging.packageName;
        const amountPerPackage = packaging.amountPerPackage;
        const packageAmount = (amountPerPackage == null || amountPerPackage === '') ? 1 : parseFloat(amountPerPackage);
        formatKeyAmountMap['package'] = packageAmount < 1 ? 1 : packageAmount;
        formatKeyOrder.push('package');
      }
      if (packaging.boxName != null) {
        formatKeyNameMap['box'] = packaging.boxName;
        const amountPerBox = packaging.amountPerBox;
        const boxAmount = (amountPerBox == null || amountPerBox === '') ? 1 : parseFloat(amountPerBox);
        formatKeyAmountMap['box'] = boxAmount < 1 ? 1 : boxAmount;
        formatKeyOrder.push('box');
      }
      if (packaging.palletName != null) {
        formatKeyNameMap['pallet'] = packaging.palletName;
        const amountPerPallet = packaging.amountPerPallet;
        const palletAmount = (amountPerPallet == null || amountPerPallet === '') ? 1 : parseFloat(amountPerPallet);
        formatKeyAmountMap['pallet'] = palletAmount < 1 ? 1 : palletAmount;
        formatKeyOrder.push('pallet');
      }
    }
  }

  const packagingOptions: PackagingOption[] = [];
  for (const key of formatKeyOrder) {
    const name = formatKeyNameMap[key];
    const amount = formatKeyAmountMap[key] || 1;
    
    let displayName = name;
    if (key === 'unit') {
      displayName = name;
    } else {
      const unitName = formatKeyNameMap['unit'] || 'Unidad';
      displayName = `${name} (${amount} ${unitName})`;
    }
    
    packagingOptions.push({
      key,
      name,
      amount,
      displayName
    });
  }

  return packagingOptions;
};

export const convertRealmProductToCartProduct = (
  product: ProductSegmentedData | any,
  options: ProductConverterOptions = {}
): CartProduct => {
  const {
    tagKey = null,
    translateTag = () => '',
    getTagColor = () => '#000000',
    quantity = 0,
    _orderId_productId
  } = options;

  const productId = product._id || product.productId || product.id || '';

  const getUnitSales = (product: any): string[] => {
    const packagingOptions = createPackagingOptions(product.packaging, product.sku);
    return packagingOptions.map(option => option.displayName);
  };

  const getVariantFeatures = (product: any) => {
    if (!product.variant || !product.variant.configuration) return [];
    
    return product.variant.configuration.map((config: any) => ({
      name: config.key || '',
      values: config.configurationValues?.map((value: any) => value.value) || []
    }));
  };

  const cartProduct: CartProduct = {
    id: productId,
    sku: product.sku || '',
    name: product.name || 'Producto sin nombre',
    brand: product.brand || '',
    image: product.image || '',
    stock: parseInt(product.stock || product.stockQuantity || '0'),
    price: parseFloat(product.fullPricing?.finalPricePerUnit || product.fullPricing?.discountedPricePerUnit || '0'),
    currency: 'CLP',
    discount: {
      percentage: 0,
      hasDiscount: false
    },
    unit: product.unit || 'UN',
    recommendedQuantity: parseInt(product.suggestedQuantity || product.recommendedQuantity || '1'),
    category: product.type || product.category || '',
    quantity: parseInt(quantity.toString() || product.quantity || '0'),
    productId: productId,
    _orderId_productId: _orderId_productId || product._orderId_productId,
    weight: product.weight || '',
    stockQuantity: product.stock || product.stockQuantity || '0',
    weightUnit: product.weightUnit,
    tagList: product.tagList,
    type: product.type,
    groupSegmentId: product.groupSegmentId,
    description: product.description || '',
    source: product.source || 'NATIVE',
    selectedFormatKey: product.selectedFormatKey,
    suggestedQuantity: product.suggestedQuantity,
    sourceSuggestion: product.sourceSuggestion,
    isSuggestion: product.isSuggestion,
    unitSales: getUnitSales(product),
    packagingOptions: createPackagingOptions(product.packaging, product.sku),
    selectedPackagingKey: product.selectedFormatKey || 'unit',
    hasVariants: !!(product.variant && product.variant.configuration && product.variant.configuration.length > 0),
    variantFeatures: getVariantFeatures(product)
  };

  if (tagKey && translateTag && getTagColor) {
    cartProduct.tag = {
      text: translateTag(tagKey),
      color: getTagColor(tagKey),
    };
  }

  return cartProduct;
};
