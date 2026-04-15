import type PackageUnit from './package-unit';

export const ReservedAmountTypes = {
  Money: 'money'
} as const;

type AmountType = PackageUnit | typeof ReservedAmountTypes[keyof typeof ReservedAmountTypes];

export default AmountType;
