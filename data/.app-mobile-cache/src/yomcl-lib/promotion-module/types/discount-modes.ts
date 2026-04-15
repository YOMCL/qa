export const DiscountModeKeys = {
  Order: 'order',
  Product: 'product',
  Set: 'set',
} as const;
  
type DiscountMode = typeof DiscountModeKeys[keyof typeof DiscountModeKeys];
  
export default DiscountMode;
