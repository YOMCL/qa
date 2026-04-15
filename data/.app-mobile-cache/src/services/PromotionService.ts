import { Promotion, PromotionRule } from '../types/promotion.types';
import { JavaRealmCartService } from './JavaRealmCartService';

export type ProductPromotionInfo = {
  hasStepPromotion: boolean;
  hasCatalogPromotion: boolean;
  hasGiftPromotion: boolean;
  stepPromotionMessage?: string;
  giftPromotionMessage?: string;
  catalogPromotionPrice?: number;
  originalPrice?: number;
  achievedStepPromotion?: PromotionRule;
  potentialStepPromotion?: PromotionRule;
  achievedGiftPromotion?: PromotionRule;
  potentialGiftPromotion?: PromotionRule;
  promotionalPrice?: number;
  hasPromotionalPrice?: boolean;
};

export class PromotionService {
  private static instance: PromotionService;
  private promotions: Promotion[] = [];

  private constructor() {}

  public static getInstance(): PromotionService {
    if (!PromotionService.instance) {
      PromotionService.instance = new PromotionService();
    }
    return PromotionService.instance;
  }

  public async loadPromotions(commerceId: string): Promise<void> {
    try {
      const response = await JavaRealmCartService.getInstance().getCommercePromotions(commerceId);
      this.promotions = response.promotions || [];
    } catch (error) {
      console.error('Error loading promotions:', error);
      this.promotions = [];
    }
  }

  public getPromotions(): Promotion[] {
    return this.promotions;
  }

  public getProductPromotions(productId: string, segmentIds: string[] = []): Promotion[] {
    return this.promotions.filter(promotion => {
      if (promotion.productIds && promotion.productIds.includes(productId)) {
        return true;
      }
      
      if (promotion.segmentIds && promotion.segmentIds.some(id => segmentIds.includes(id))) {
        return true;
      }
      
      return false;
    });
  }

  public getStepPromotions(productId: string, segmentIds: string[] = []): Promotion[] {
    return this.getProductPromotions(productId, segmentIds).filter(promotion => 
      promotion.type === 'step' || promotion.type === 'mixed-step'
    );
  }

  public getCatalogPromotions(productId: string, segmentIds: string[] = []): Promotion[] {
    return this.getProductPromotions(productId, segmentIds).filter(promotion => 
      promotion.type === 'catalog'
    );
  }

  public getGiftPromotions(productId: string, segmentIds: string[] = []): Promotion[] {
    return this.getProductPromotions(productId, segmentIds).filter(promotion => 
      promotion.type === 'gift'
    );
  }

  public getSimplePromotionsByProductAndSegment(productId: string, segmentIds: string[] = [], promotionType: 'step' | 'gift' | 'mixed-step'): Promotion[] {
    return this.promotions.filter(promotion => {
      if (promotion.type !== promotionType) return false;
      
      if (promotion.productIds && promotion.productIds.includes(productId)) {
        return true;
      }
      
      if (promotion.segmentIds && promotion.segmentIds.some(id => segmentIds.includes(id))) {
        return true;
      }
      
      return false;
    });
  }

  public getCombinedStepPromotionsByProductAndSegment(productId: string, segmentIds: string[] = []): Promotion | null {
    return null;
  }

  public getProductPromotionInfo(
    productId: string, 
    currentQuantity: number = 0,
    segmentIds: string[] = [],
    originalPrice: number = 0
  ): ProductPromotionInfo {
    const stepPromotions = this.getSimplePromotionsByProductAndSegment(productId, segmentIds, 'step');
    const mixedStepPromotions = this.getSimplePromotionsByProductAndSegment(productId, segmentIds, 'mixed-step');
    const giftPromotions = this.getSimplePromotionsByProductAndSegment(productId, segmentIds, 'gift');
    const catalogPromotions = this.getCatalogPromotions(productId, segmentIds);
    const combinedPromotion = this.getCombinedStepPromotionsByProductAndSegment(productId, segmentIds);
    
    const allStepPromotions = [...stepPromotions, ...mixedStepPromotions];
    
    const info: ProductPromotionInfo = {
      hasStepPromotion: allStepPromotions.length > 0 || combinedPromotion !== null,
      hasGiftPromotion: giftPromotions.length > 0,
      hasCatalogPromotion: catalogPromotions.length > 0,
    };

    if (allStepPromotions.length > 0 || combinedPromotion) {
      const achievedStepPromotion = this.getAchievedStepPromotion(productId, currentQuantity, allStepPromotions);
      if (achievedStepPromotion) {
        info.achievedStepPromotion = achievedStepPromotion;
        info.stepPromotionMessage = this.defineAchievedStepPromotionsMessage(achievedStepPromotion, currentQuantity);
        
        // Buscar el siguiente step disponible después del logrado
        const nextStepPromotion = this.getNextStepPromotion(allStepPromotions, currentQuantity, achievedStepPromotion);
        if (nextStepPromotion) {
          info.potentialStepPromotion = nextStepPromotion;
          const nextStepMessage = this.defineNearestStepPromotionsMessage(nextStepPromotion, currentQuantity);
          info.stepPromotionMessage = `${info.stepPromotionMessage}. ${nextStepMessage}`;
        }
      } else {
        const potentialStepPromotion = this.getNearestStepPromotion(allStepPromotions, currentQuantity);
        if (potentialStepPromotion) {
          info.potentialStepPromotion = potentialStepPromotion;
          info.stepPromotionMessage = this.defineNearestStepPromotionsMessage(potentialStepPromotion, currentQuantity);
        }
      }
    }

    if (giftPromotions.length > 0) {
      const achievedGiftPromotion = this.getAchievedGiftPromotion(productId, currentQuantity, giftPromotions);
      if (achievedGiftPromotion) {
        info.achievedGiftPromotion = achievedGiftPromotion;
        info.giftPromotionMessage = this.defineAchievedGiftPromotionsMessage(achievedGiftPromotion, currentQuantity);
      } else {
        const potentialGiftPromotion = this.getNearestGiftPromotion(productId, currentQuantity, giftPromotions);
        if (potentialGiftPromotion) {
          info.potentialGiftPromotion = potentialGiftPromotion;
          info.giftPromotionMessage = this.defineNearestGiftPromotionsMessage(potentialGiftPromotion, currentQuantity);
        }
      }
    }

    if (catalogPromotions.length > 0) {
      const catalogPromotion = this.getBestCatalogPromotion(catalogPromotions);
      if (catalogPromotion) {
        info.catalogPromotionPrice = this.calculateCatalogPromotionPrice(catalogPromotion, originalPrice);
        info.originalPrice = originalPrice;
      }
    }

    if (info.achievedStepPromotion) {
      info.promotionalPrice = this.calculatePromotionalPrice(info.achievedStepPromotion, originalPrice);
      info.hasPromotionalPrice = true;
      info.originalPrice = originalPrice;
    }

    return info;
  }

  private getAchievedStepPromotion(productId: string, currentQuantity: number, promotions: Promotion[]): PromotionRule | null {
    let bestRule: PromotionRule | null = null;
    let highestThreshold = 0;

    for (const promotion of promotions) {
      for (const rule of promotion.promotionRules || []) {
        const requiredQuantity = parseFloat(rule.amountMinValue || '0');
        if (currentQuantity >= requiredQuantity && requiredQuantity > highestThreshold) {
          highestThreshold = requiredQuantity;
          bestRule = rule;
        }
      }
    }
    return bestRule;
  }

  private getNearestStepPromotion(promotions: Promotion[], currentQuantity: number): PromotionRule | null {
    const allRules: PromotionRule[] = [];
    for (const promotion of promotions) {
      for (const rule of promotion.promotionRules || []) {
        allRules.push(rule);
      }
    }

    allRules.sort((a, b) => parseFloat(a.amountMinValue || '0') - parseFloat(b.amountMinValue || '0'));

    for (const rule of allRules) {
      const requiredQuantity = parseFloat(rule.amountMinValue || '0');
      if (requiredQuantity > currentQuantity) {
        return rule;
      }
    }

    return null;
  }

  private getNextStepPromotion(promotions: Promotion[], currentQuantity: number, achievedRule: PromotionRule): PromotionRule | null {
    const allRules: PromotionRule[] = [];
    for (const promotion of promotions) {
      for (const rule of promotion.promotionRules || []) {
        allRules.push(rule);
      }
    }

    allRules.sort((a, b) => parseFloat(a.amountMinValue || '0') - parseFloat(b.amountMinValue || '0'));

    const achievedQuantity = parseFloat(achievedRule.amountMinValue || '0');
    
    for (const rule of allRules) {
      const requiredQuantity = parseFloat(rule.amountMinValue || '0');
      if (requiredQuantity > achievedQuantity && requiredQuantity > currentQuantity) {
        return rule;
      }
    }

    return null;
  }

  private getAchievedGiftPromotion(productId: string, currentQuantity: number, promotions: Promotion[]): PromotionRule | null {
    for (const promotion of promotions) {
      for (const rule of promotion.promotionRules || []) {
        const requiredQuantity = parseFloat(rule.amountMinValue || '0');
        if (currentQuantity >= requiredQuantity) {
          return rule;
        }
      }
    }
    return null;
  }

  private getNearestGiftPromotion(productId: string, currentQuantity: number, promotions: Promotion[]): PromotionRule | null {
    let nearestRule: PromotionRule | null = null;
    let minDifference = Infinity;

    for (const promotion of promotions) {
      for (const rule of promotion.promotionRules || []) {
        const requiredQuantity = parseFloat(rule.amountMinValue || '0');
        const difference = requiredQuantity - currentQuantity;
        
        if (difference > 0 && difference < minDifference) {
          minDifference = difference;
          nearestRule = rule;
        }
      }
    }

    return nearestRule;
  }

  private defineAchievedStepPromotionsMessage(rule: PromotionRule, currentQuantity: number): string {
    let discount = rule.discountValue;
    let amountType = '';
    
    if (rule.discountCategory === 'percentage') {
      const percentage = (parseFloat(discount) * 100).toFixed(2).replace(/\.?0+$/, '');
      discount = `${percentage}%`;
    } else {
      discount = `$${parseFloat(discount).toLocaleString()}`;
    }

    if (rule.amountType === 'money') {
      amountType = '';
    } else {
      amountType = ` ${rule.amountType || 'unidades'}`;
    }

    let maxStepsMessage = '';
    if (rule.amountMaxValue && parseFloat(rule.amountMaxValue) > parseFloat(rule.amountMinValue || '0')) {
      maxStepsMessage = ` (máx. ${rule.amountMaxValue}${amountType})`;
    }

    if (discount.includes('$')) {
      discount = discount + amountType.replace(' ', '/');
    }

    let prefix = 'Dcto. volumen: ';
    if (rule.discountCategory === 'new-price') {
      prefix = 'Precio volumen: ';
    }

    return prefix + discount + maxStepsMessage;
  }

  private defineNearestStepPromotionsMessage(rule: PromotionRule, currentQuantity: number): string {
    const requiredQuantity = parseFloat(rule.amountMinValue || '0');
    const neededQuantity = Math.max(0, requiredQuantity - currentQuantity);
    
    let discount = rule.discountValue;
    let amountType = '';
    let maxAmountType = '';
    
    if (rule.discountCategory === 'percentage') {
      const percentage = (parseFloat(discount) * 100).toFixed(2).replace(/\.?0+$/, '');
      discount = `${percentage}%`;
    } else {
      discount = `$${parseFloat(discount).toLocaleString()}`;
    }

    if (rule.amountType === 'money') {
      amountType = 'pesos';
      maxAmountType = '';
    } else {
      amountType = rule.amountType || 'unidades';
      maxAmountType = ` ${rule.amountType || 'unidades'}`;
    }

    let maxStepsMessage = '';
    if (rule.amountMaxValue && parseFloat(rule.amountMaxValue) > parseFloat(rule.amountMinValue || '0')) {
      maxStepsMessage = ` (máx. ${rule.amountMaxValue}${maxAmountType})`;
    }

    if (discount.includes('$')) {
      discount = discount + maxAmountType.replace(' ', '/');
    }

    let prefix = 'Dcto. de ';
    if (rule.discountCategory === 'new-price') {
      prefix = 'Precio de ';
    }
    
    return prefix + discount + ' en ' + neededQuantity + ' ' + amountType + ' más' + maxStepsMessage;
  }

  private defineAchievedGiftPromotionsMessage(rule: PromotionRule, currentQuantity: number): string {
    if (!rule.gift) return '';
    
    const giftAmount = rule.gift.amount;
    
    const requiredQuantity = parseFloat(rule.amountMinValue || '0');
    const timesAchieved = Math.floor(currentQuantity / requiredQuantity);
    const totalGiftAmount = parseFloat(giftAmount) * timesAchieved;
    
    const amountType = rule.amountType === 'money' ? 'pesos' : rule.amountType || 'unidades';
    const nextRequiredQuantity = requiredQuantity * (timesAchieved + 1);
    const stepsLeft = Math.max(0, nextRequiredQuantity - currentQuantity);
    
    const giftProductName = 'producto';
    const giftAmountType = amountType;
    
    return `${totalGiftAmount} ${giftAmountType} ${giftProductName} obtenidos, siguiente en ${stepsLeft} ${amountType}`;
  }

  private defineNearestGiftPromotionsMessage(rule: PromotionRule, currentQuantity: number): string {
    if (!rule.gift) return '';
    
    const giftAmount = rule.gift.amount;
    const requiredQuantity = parseFloat(rule.amountMinValue || '0');
    const neededQuantity = Math.max(0, requiredQuantity - currentQuantity);
    
    const amountType = rule.amountType === 'money' ? 'pesos' : rule.amountType || 'unidades';
    const giftProductName = 'producto';
    const giftAmountType = amountType;
    
    return `${giftAmount} ${giftAmountType} ${giftProductName} disponible en ${neededQuantity} ${amountType}`;
  }

  private getBestCatalogPromotion(promotions: Promotion[]): PromotionRule | null {
    let bestRule: PromotionRule | null = null;
    let bestDiscount = 0;
    
    for (const promotion of promotions) {
      const promotionRules = promotion.promotionRules || [];
      for (const rule of promotionRules) {
        let discount = 0;
        
        if (rule.discountCategory === 'percentage') {
          discount = parseFloat(rule.discountValue);
        } else if (rule.discountCategory === 'fixed' || rule.discountCategory === 'new-price') {
          discount = parseFloat(rule.discountValue);
        }
        
        if (discount > bestDiscount) {
          bestDiscount = discount;
          bestRule = rule;
        }
      }
    }

    return bestRule;
  }

  private calculateCatalogPromotionPrice(rule: PromotionRule, originalPrice: number): number {
    if (rule.discountCategory === 'percentage') {
      const discount = parseFloat(rule.discountValue);
      return originalPrice * (1 - discount);
    } else if (rule.discountCategory === 'fixed') {
      return Math.max(0, originalPrice - parseFloat(rule.discountValue));
    } else if (rule.discountCategory === 'new-price') {
      return parseFloat(rule.discountValue);
    }
    
    return originalPrice;
  }

  private calculatePromotionalPrice(rule: PromotionRule, originalPrice: number): number {
    if (!rule.discountCategory || !rule.discountValue) {
      return originalPrice;
    }

    let discountedPrice = originalPrice;

    switch (rule.discountCategory) {
      case 'percentage':
        const discountPercent = parseFloat(rule.discountValue);
        discountedPrice = originalPrice * (1 - discountPercent);
        break;
      case 'fixed':
        discountedPrice = parseFloat(rule.discountValue);
        break;
      case 'new-price':
        discountedPrice = parseFloat(rule.discountValue);
        break;
      case 'multiple':
        if (rule.amountType === 'multiple') {
          const amountMin = parseFloat(rule.amountMinValue || '0');
          const amountMax = parseFloat(rule.amountMaxValue || '0');
          if (amountMax > 0) {
            const discountMultiplier = amountMin / amountMax;
            discountedPrice = originalPrice * discountMultiplier;
          }
        } else {
          const amountMin = parseFloat(rule.amountMinValue || '0');
          const discountAmount = parseFloat(rule.discountValue);
          if (amountMin > 0) {
            discountedPrice = (originalPrice * discountAmount) / amountMin;
          }
        }
        break;
    }

    return Math.max(0, discountedPrice);
  }
}
