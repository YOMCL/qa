import RequiredPackageError from '../../../errors/required/required-package-error';
import type ProductCalculator from '../../../types/calculator/product-calculator';
import type AmountType from '../../../types/amount-type';
import type { IProduct } from '../../../types/product';
import type { PackageFormat } from '../../../types/product/product';

class PackageCalculator implements ProductCalculator {
  fetchPackageFormat(packageFormats: Array<PackageFormat>, amountType: AmountType): PackageFormat {
    const packageFormat = packageFormats.find(packaging => packaging.key === amountType);

    if(packageFormat) {
      return packageFormat;
    }

    const emergencyPackageFormat = packageFormats.find(packaging => packaging.isEmergencyPackage);
    if(!emergencyPackageFormat) {
      throw new RequiredPackageError(amountType);
    }

    return emergencyPackageFormat;
  }

  transformToBaseAmount(product: IProduct): number {
    const productPackaging = this.fetchPackageFormat(product.packageFormats, product.packageUnit);
    return product.amount * productPackaging.baseAmountPerFormat;
  }
  
  transformAmount(product: IProduct, amountType: AmountType): number {
    const baseAmount = this.transformToBaseAmount(product);
    const desiredPackageFormat = this.fetchPackageFormat(product.packageFormats, amountType);

    return baseAmount / desiredPackageFormat.baseAmountPerFormat;
  }

  calculate(products: Array<IProduct>, amountType: AmountType): number {
    let count = 0;

    for(const product of products) {
      count += this.transformAmount(product, amountType);
    }

    return count;
  }
}

export default new PackageCalculator();
