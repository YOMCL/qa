import { NativeModules } from 'react-native';
import { ProductSearchResult, ProductSegmentedData } from '../types/product.types';
import {
    CategoriesResult,
    CategoryData,
    OpenRealmResult,
    ProductsGroupDescription,
    ProductsGroupDescriptionsResult,
    QueryObjectsResult,
    RealmInfoResult,
    SearchProductsResult,
    ShoppingListResult,
    SiteConfig,
    SiteConfigResult,
} from '../types/realm-native.types';
import { convertRealmProductToCartProduct } from '../utils/productConverter';

type JavaRealmModule = {
  openRealm(realmPath: string): Promise<OpenRealmResult>;
  getRealmInfo(): Promise<RealmInfoResult>;
  searchProducts(searchTerm: string, limit: number): Promise<SearchProductsResult>;
  queryObjects(schemaName: string, fieldName?: string, value?: string, limit?: number): Promise<QueryObjectsResult>;
  getShoppingListByCommerceId(commerceId: string): Promise<ShoppingListResult>;
  getProductsGroupDescriptions(): Promise<ProductsGroupDescriptionsResult>;
  getCategories(): Promise<CategoriesResult>;
  getSiteConfig(): Promise<SiteConfigResult>;
};

const { JavaRealmModule: NativeJavaRealmModule } = NativeModules as { JavaRealmModule?: JavaRealmModule };

const DEFAULT_TAG_TRANSLATIONS: Record<string, string> = {
  exploration: 'Exploración',
  combo: 'Combo',
  optimal_mix: 'Mix estratégico',
  focus: 'Foco',
  tarjeton: 'Tarjetón',
  base: 'Canasta base',
  default: 'Canasta base',
};

const DEFAULT_TAG_COLORS: Record<string, string> = {
  exploration: '#155fa0',
  combo: '#EC407A',
  optimal_mix: '#5263FF',
  focus: '#7E57C2',
  tarjeton: '#D83131',
  base: '#1E88E5',
  default: '#1E88E5',
};

export class JavaRealmNativeService {
  private static instance: JavaRealmNativeService;
  private isInitialized = false;
  private realmInfo: RealmInfoResult | null = null;
  private shoppingListCache: Map<string, Map<string, string>> = new Map();
  private groupDescriptionsMap: Map<string, ProductsGroupDescription> = new Map();

  private constructor() {}

  public static getInstance(): JavaRealmNativeService {
    if (!JavaRealmNativeService.instance) {
      JavaRealmNativeService.instance = new JavaRealmNativeService();
    }
    return JavaRealmNativeService.instance;
  }

  public async initialize(): Promise<boolean> {
    try {
      if (!NativeJavaRealmModule) {
        return false;
      }

      const infoResult = await NativeJavaRealmModule.getRealmInfo();
      
      if (!infoResult.success) {
        return false;
      }
      
      this.realmInfo = infoResult;

      await this.loadProductsGroupDescriptions();
      
      this.isInitialized = true;
      return true;
      
    } catch {
      this.isInitialized = false;
      return false;
    }
  }

  private getTagColor(tag: string | null | undefined): string {
    if (!tag) {
      const defaultDesc = this.groupDescriptionsMap.get('default');
      if (defaultDesc?.mobileColor) {
        return defaultDesc.mobileColor;
      }
      return DEFAULT_TAG_COLORS.default;
    }

    const customTag = this.groupDescriptionsMap.get(tag);
    if (customTag?.mobileColor) {
      return customTag.mobileColor;
    }

    return DEFAULT_TAG_COLORS[tag] || DEFAULT_TAG_COLORS.base;
  }

  public async loadShoppingList(commerceId: string): Promise<void> {
    try {
      if (!this.isInitialized || !NativeJavaRealmModule) {
        return;
      }

      const result = await NativeJavaRealmModule.getShoppingListByCommerceId(commerceId);

      if (!result.success) {
        return;
      }

      const tagMap = new Map<string, string>();
      result.entries.forEach(entry => {
        tagMap.set(entry.productId, entry.tag);
      });

      this.shoppingListCache.set(commerceId, tagMap);
    } catch (error) {
      console.error('Error loading shopping list:', error);
    }
  }

  public async loadProductsGroupDescriptions(): Promise<void> {
    try {
      if (!NativeJavaRealmModule) {
        return;
      }

      const result = await NativeJavaRealmModule.getProductsGroupDescriptions();

      if (!result.success) {
        return;
      }

      result.descriptions.forEach(desc => {
        this.groupDescriptionsMap.set(desc.purposesLabel, desc);
      });
    } catch (error) {
      console.error('Error loading products group descriptions:', error);
    }
  }

  public getAvailableStrategies(commerceId: string): string[] {
    const strategies = new Set<string>();
    
    if (this.shoppingListCache.has(commerceId)) {
      const tagMap = this.shoppingListCache.get(commerceId);
      if (tagMap) {
        tagMap.forEach(tag => {
          if (tag && tag !== 'default') {
            strategies.add(tag);
          }
        });
      }
    }

    return Array.from(strategies);
  }

  public getStrategyDisplayName(strategy: string): string {
    const groupDesc = this.groupDescriptionsMap.get(strategy);
    if (groupDesc && groupDesc.mobileText) {
      return groupDesc.mobileText;
    }
    
    return this.translateTag(strategy);
  }

  private translateTag(tag: string | null | undefined): string {
    if (!tag) {
      const defaultDesc = this.groupDescriptionsMap.get('default');
      return defaultDesc?.mobileText || DEFAULT_TAG_TRANSLATIONS.default;
    }

    const customTag = this.groupDescriptionsMap.get(tag);
    if (customTag && customTag.mobileText) {
      return customTag.mobileText;
    }

    return DEFAULT_TAG_TRANSLATIONS[tag] || DEFAULT_TAG_TRANSLATIONS.default;
  }

  public async getCategories(): Promise<CategoryData[]> {
    try {
      if (!NativeJavaRealmModule) {
        return [];
      }

      const result = await NativeJavaRealmModule.getCategories();

      if (!result.success) {
        console.error('Error getting categories:', result.error);
        return [];
      }

      return result.categories;
    } catch (error) {
      console.error('Error getting categories:', error);
      return [];
    }
  }

  public async searchProducts(query: string = '', limit: number = 20, commerceId?: string): Promise<ProductSearchResult[]> {
    try {
      if (!this.isInitialized || !NativeJavaRealmModule) {
        return [];
      }

      if (commerceId && !this.shoppingListCache.has(commerceId)) {
        await this.loadShoppingList(commerceId);
      }

      const result = await NativeJavaRealmModule.searchProducts(query, limit);
      
      if (!result.success) {
        return [];
      }

      const tagMap = commerceId ? this.shoppingListCache.get(commerceId) : null;
      
      const products: ProductSearchResult[] = result.products.map((product: ProductSegmentedData, index: number) => {
        const productId = product._id || product.productId || `product_${index}`;
        const tagKey = tagMap?.get(productId) || null;
        
        let shoppingListOrder = Number.MAX_SAFE_INTEGER;
        if (tagMap) {
          const entries = Array.from(tagMap.entries());
          const orderIndex = entries.findIndex(([id]) => id === productId);
          if (orderIndex !== -1) {
            shoppingListOrder = orderIndex;
          }
        }

        const cartProduct = convertRealmProductToCartProduct(product, {
          tagKey,
          translateTag: (tag) => this.translateTag(tag),
          getTagColor: (tag) => this.getTagColor(tag),
          quantity: 0
        });

        const finalProduct = {
          ...cartProduct,
          _id: productId,
          _realmData: product,
          type: 'PRODUCT',
          source: 'JAVA_REALM',
          shoppingListOrder,
          tagKey
        } as ProductSearchResult;
        return finalProduct;
      });
      return products;

    } catch {
      return [];
    }
  }

  public getRealmInfo(): RealmInfoResult | null {
    return this.realmInfo;
  }

  public isRealmInitialized(): boolean {
    return this.isInitialized;
  }

  public async getSiteConfig(): Promise<SiteConfig | null> {
    try {
      if (!NativeJavaRealmModule) {
        return null;
      }

      const result = await NativeJavaRealmModule.getSiteConfig();

      if (!result.success) {
        console.error('Error getting site config:', result.error);
        return null;
      }

      return result.config;
    } catch (error) {
      console.error('Error getting site config:', error);
      return null;
    }
  }

  public async close(): Promise<void> {
    try {
      this.isInitialized = false;
      this.realmInfo = null;
    } catch {
    }
  }
} 