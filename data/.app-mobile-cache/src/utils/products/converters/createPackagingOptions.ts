import { PackagingOption } from '../../../types/product.types';

export const createPackagingOptions = (packaging: any): PackagingOption[] => {
  
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


