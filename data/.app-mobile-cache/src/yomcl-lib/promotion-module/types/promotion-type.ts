export const PromotionTypesKeys = {
  Bundle: 'bundle',
  Catalog: 'catalog',
  Step: 'step',
  MixedStep: 'mixed-step',
  Gift: 'gift'
} as const;
  
type PromotionTypes = typeof PromotionTypesKeys[keyof typeof PromotionTypesKeys];
  
export default PromotionTypes;
