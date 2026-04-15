export const CouponTypesKeys = {
  Order: 'order',
  Product: 'product',
  Set: 'set',
} as const;
    
type CouponTypes = typeof CouponTypesKeys[keyof typeof CouponTypesKeys];
    
export default CouponTypes;
