import type Id from '../id';
import type PackageUnit from '../package-unit';

export type PackageFormat = {
  key: PackageUnit;
  base: boolean;
  baseAmountPerFormat: number;
  isEmergencyPackage: boolean;
};

type IProduct = {
  amount: number;
  brand: string;
  category: string;
  categories: Array<string>;
  id: Id;
  line: string;
  matrix: string;
  packageFormats: Array<PackageFormat>;
  packageUnit: PackageUnit;
  price: number;
  promotedPrice?: number;
};

export default IProduct;
