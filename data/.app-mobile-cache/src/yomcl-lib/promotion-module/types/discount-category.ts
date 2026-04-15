export const DiscountCategoryKeys = {
  Fixed: 'fixed',
  Percentage: 'percentage',
  Gift: 'gift',
  NewPrice: 'new-price',
} as const;

type DiscountCategory = typeof DiscountCategoryKeys[keyof typeof DiscountCategoryKeys];

export default DiscountCategory;
