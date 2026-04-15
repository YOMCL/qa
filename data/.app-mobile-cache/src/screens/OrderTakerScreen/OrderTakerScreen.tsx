import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, BackHandler, Keyboard, Text, View } from 'react-native';
import { BottomNavigation, FilterDialog, MyOrderTab, SortDialog, SuggestionsTab } from '../../components';
import { OrderTakerHeader } from '../../components/OrderTakerHeader';
import { ProductCardProps } from '../../components/ProductCard';
import SearchBarComponent from '../../components/SearchBar/SearchBar';
import { SellerDiscountDialog } from '../../components/SellerDiscountDialog';
import { TabSelector } from '../../components/TabSelector';
import { useJavaRealm } from '../../contexts/JavaRealmContext';
import { useJavaRealmCart } from '../../hooks/useJavaRealmCart';
import { useOrderTaker } from '../../hooks/useOrderTaker';
import { JavaRealmCartService } from '../../services/JavaRealmCartService';
import { PromotionService } from '../../services/PromotionService';
import { orderTakerScreenStyles } from '../../styles/OrderTakerScreen.styles';
import { CategoryFilterOption, ProductFilters } from '../../types/filter.types';
import { Promotion } from '../../types/promotion.types';
import { DiscountErrorDetail, SellerDiscount, SellerDiscountConfig } from '../../types/seller-discount.types';
import { SortOption } from '../../types/sorting.types';
import { applyFiltersToProducts } from '../../utils/filtering.utils';
import * as ProductConverter from '../../utils/productConverter';


export type OrderTakerScreenProps = {
  commerceId: string;
  orderId?: string;
  segmentId?: string;
  fromOrders?: boolean;
  externalId?: string;
  sourceId?: string;
};

const OrderTakerScreen: React.FC<OrderTakerScreenProps> = ({ 
  commerceId, 
  orderId, 
  segmentId,
  fromOrders = false,
  externalId,
  sourceId,
}) => {
  const [activeTab, setActiveTab] = useState<'suggestions' | 'order'>('suggestions');
  const [suggestedProducts, setSuggestedProducts] = useState<ProductCardProps[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [showSortDialog, setShowSortDialog] = useState(false);
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [availableCategories, setAvailableCategories] = useState<CategoryFilterOption[]>([]);
  const [inSearchMode, setInSearchMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ProductCardProps[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [lastSearches, setLastSearches] = useState<string[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [productPackaging, setProductPackaging] = useState<Map<string, string>>(new Map());
  const [potentialDiscounts, setPotentialDiscounts] = useState<Map<string, SellerDiscount>>(new Map());
  const [orderDiscounts, setOrderDiscounts] = useState<Record<string, number>>({});
  const [discountLimits, setDiscountLimits] = useState<Map<string, DiscountErrorDetail>>(new Map());
  const [sellerDiscountConfig, setSellerDiscountConfig] = useState<SellerDiscountConfig>({
    enableSellerDiscount: false,
    disableManualDiscount: false,
    enableProductDiscountType: false,
  });
  const [showSellerDiscountDialog, setShowSellerDiscountDialog] = useState(false);
  const [selectedProductForDiscount, setSelectedProductForDiscount] = useState<ProductCardProps | null>(null);

  const { javaRealmService, isLoading: isRealmLoading, isConnected } = useJavaRealm();
  
  const translateTag = (tag: string | null | undefined): string => {
    const DEFAULT_TAG_TRANSLATIONS: Record<string, string> = {
      exploration: 'Exploración',
      combo: 'Combo',
      optimal_mix: 'Mix estratégico',
      focus: 'Foco',
      tarjeton: 'Tarjetón',
    };
    
    if (!tag) return '';
    return DEFAULT_TAG_TRANSLATIONS[tag] || tag;
  };
  
  const getTagColor = (tag: string | null | undefined): string => {
    const DEFAULT_TAG_COLORS: Record<string, string> = {
      exploration: '#9C27B0',
      combo: '#FF9800',
      optimal_mix: '#4CAF50',
      focus: '#2196F3',
      tarjeton: '#F44336',
    };
    
    if (!tag) return '#757575';
    return DEFAULT_TAG_COLORS[tag] || '#757575';
  };
  
  const {
    cartProducts: rawCartProducts,
    orderSummary,
    isLoading: isCartLoading,
    handleAddProduct: addProductToCart,
    handleRemoveProduct: removeProductFromCart,
    handleUpdateQuantity: updateCartQuantity,
    handleUpdatePackaging: updateCartPackaging,
    handleIncrementProduct: incrementCartProduct,
    handleDecrementProduct: decrementCartProduct,
    handleClearCart: clearCart,
    refreshCart,
    refreshOrderSummary,
  } = useJavaRealmCart({ 
    commerceId, 
    orderId 
  });
  
  const [cartProducts, setCartProducts] = useState(rawCartProducts);
  
  useEffect(() => {
    setCartProducts(rawCartProducts);
  }, [rawCartProducts]);
  
  useEffect(() => {
    if (suggestedProducts.length === 0 || cartProducts.length === 0) {
      return;
    }
    
    setSuggestedProducts(currentProducts => {
      return currentProducts.map(product => {
        const cartProduct = cartProducts.find(cp => cp.sku === product.sku);
        if (cartProduct) {
          return {
            ...product,
            selectedPackagingKey: cartProduct.selectedPackagingKey || cartProduct.selectedFormatKey || 'unit',
            price: cartProduct.price,
          };
        }
        return product;
      });
    });
  }, [cartProducts, suggestedProducts.length]);
  
  const {
    handleFinalizeOrder: finalizeOrder,
    handleAddOrderDiscount: addOrderDiscount,
    handleUpdateShipping: updateShipping,
    isSubmittingOrder,
    currentSort,
    handleSortChange: setSortOption,
    sortProducts: sortProductsFunction,
    currentFilters,
    handleApplyFilters: applyFilters,
    handleClearFilters: clearFilters,
    getAvailableStrategies,
    getStrategyDisplayName
  } = useOrderTaker({ 
    commerceId, 
    orderId, 
    segmentId,
    externalId,
    sourceId,
    onClearCart: clearCart,
    sellerDiscounts: Array.from(potentialDiscounts.values())
  });

  const loadSuggestedProducts = useCallback(async () => {
    try {
      setIsLoadingProducts(true);
      
      const cartService = JavaRealmCartService.getInstance();
      const products = await cartService.getSuggestedProducts(commerceId, false, 1000);
      
      if (!products || products.length === 0) {
        setSuggestedProducts([]);
        return;
      }
      
      const formattedProducts: ProductCardProps[] = products.map((product: any) => {
        const packagingOptions = product.packaging 
          ? ProductConverter.createPackagingOptions(product.packaging)
          : [];
        
        const cartProduct = cartProducts.find(cp => cp.sku === product.sku);
        let selectedPackagingKey: string;
        let displayPrice: number;
        
        if (cartProduct) {
          selectedPackagingKey = cartProduct.selectedPackagingKey || cartProduct.selectedFormatKey || 'unit';
          displayPrice = cartProduct.price;
        } else {
          const localPackaging = productPackaging.get(product.sku);
          selectedPackagingKey = localPackaging || product.selectedFormatKey || product.selectedPackagingKey || 'unit';
          
          const selectedOption = packagingOptions.find(opt => opt.key === selectedPackagingKey);
          const multiplier = selectedOption?.amount || 1;
          displayPrice = product.price * multiplier;
        }
        
        return {
          id: product._id || product.productId,
          sku: product.sku,
          name: product.name,
          brand: product.brand,
          image: product.image,
          stock: product.stock,
          price: displayPrice,
          currency: product.currency,
          discount: product.discount || { percentage: 0, hasDiscount: false },
          unit: product.unit,
          cartQuantity: 0,
          recommendedQuantity: product.recommendedQuantity || 1,
          category: product.type || product.category,
          tag: product.tagKey ? {
            text: translateTag(product.tagKey),
            color: getTagColor(product.tagKey)
          } : undefined,
          tagList: product.tagList ? product.tagList.split(',') : [],
          shoppingListOrder: 0,
          strategyValue: product.tagKey || null,
          packagingOptions,
          selectedPackagingKey,
          unitSales: product.unitSales,
          hasVariants: product.hasVariants || false,
          variantFeatures: product.variantFeatures || [],
          discountList: product.discountList || []
        };
      });

      const uniqueProducts = Array.from(
        new Map(formattedProducts.map(p => [p.id, p])).values()
      );

      const filteredProducts = applyFiltersToProducts(uniqueProducts, currentFilters);
      const sortedProducts = sortProductsFunction(filteredProducts);
      
      const syncedProducts = sortedProducts.map(product => {
        const cartProduct = cartProducts.find(cp => cp.sku === product.sku);
        if (cartProduct) {
          return {
            ...product,
            selectedPackagingKey: cartProduct.selectedPackagingKey || cartProduct.selectedFormatKey || 'unit',
            price: cartProduct.price,
          };
        }
        return product;
      });
      
      setSuggestedProducts(syncedProducts);
    } catch (error) {
      console.error('❌ Error loading suggested products:', error);
      setSuggestedProducts([]);
    } finally {
      setIsLoadingProducts(false);
    }
  }, [commerceId, currentFilters, sortProductsFunction]);

  const loadCategories = useCallback(async () => {
    try {
      if (!javaRealmService) {
        return;
      }

      const categories = await javaRealmService.getCategories();
      
      const categoryOptions: CategoryFilterOption[] = categories.map(category => ({
        id: category._id,
        name: category.name,
        value: category._id,
        tags: category.tags,
        parent: category.parent
      }));

      setAvailableCategories(categoryOptions);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  }, [javaRealmService]);

  const loadLastSearches = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem('lastSearches');
      if (stored) {
        const searches = JSON.parse(stored);
        setLastSearches(searches.slice(0, 10));
      }
    } catch (error) {
      console.error('Error loading last searches:', error);
    }
  }, []);

  const loadPromotions = useCallback(async () => {
    try {
      const promotionService = PromotionService.getInstance();
      await promotionService.loadPromotions(commerceId);
      const loadedPromotions = promotionService.getPromotions();
      setPromotions(loadedPromotions);
    } catch (error) {
      console.error('Error loading promotions:', error);
      setPromotions([]);
    }
  }, [commerceId]);

  const loadSellerDiscountConfig = useCallback(async () => {
    try {
      if (!javaRealmService) {
        console.log('⚠️ javaRealmService not available for loadSellerDiscountConfig');
        return;
      }
      
      console.log('📡 Loading seller discount config from Java Realm...');
      const siteConfig = await javaRealmService.getSiteConfig();
      console.log('📡 Full site config response:', JSON.stringify(siteConfig, null, 2));
      
      if (siteConfig.success && siteConfig.config) {
        const config = {
          enableSellerDiscount: siteConfig.config.enableSellerDiscount || false,
          disableManualDiscount: siteConfig.config.disableManualDiscount || false,
          enableProductDiscountType: false,
          discountTypes: [],
        };
        
        console.log('💰 Setting seller discount config:', config);
        setSellerDiscountConfig(config);
      } else {
        console.log('⚠️ Site config not loaded properly');
      }
    } catch (error) {
      console.error('❌ Error loading seller discount config:', error);
    }
  }, [javaRealmService]);

  const loadOrderDiscounts = useCallback(async () => {
    try {
      const cartService = JavaRealmCartService.getInstance();
      const discounts = await cartService.getOrderSellerDiscounts();
      setOrderDiscounts(discounts);
    } catch (error) {
      console.error('❌ Error loading order discounts:', error);
    }
  }, []);

  const saveLastSearch = useCallback(async (searchTerm: string) => {
    try {
      const trimmed = searchTerm.trim();
      if (trimmed.length < 2) return;
      
      const current = lastSearches.filter(s => s !== trimmed);
      const updated = [trimmed, ...current].slice(0, 10);
      setLastSearches(updated);
      await AsyncStorage.setItem('lastSearches', JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving last search:', error);
    }
  }, [lastSearches]);

  const performSearch = useCallback(async (query: string, completeSearch: boolean = false) => {
    if (!query.trim() && !completeSearch) {
      setSearchResults([]);
      return;
    }

    try {
      setIsSearching(true);
      
      const cartService = JavaRealmCartService.getInstance();
      const allProducts = await cartService.getSuggestedProducts(commerceId, false, 1000);
      
      const filtered = query.trim() 
        ? allProducts.filter((product: any) => 
            product.name?.toLowerCase().includes(query.toLowerCase()) ||
            product.sku?.toLowerCase().includes(query.toLowerCase()) ||
            product.brand?.toLowerCase().includes(query.toLowerCase())
          )
        : allProducts;
      
      const limit = completeSearch ? 500 : 50;
      const limitedProducts = filtered.slice(0, limit);
      
      const formattedProducts: ProductCardProps[] = limitedProducts.map((product: any) => {
        const packagingOptions = product.packaging 
          ? ProductConverter.createPackagingOptions(product.packaging)
          : [];
        
        const cartProduct = cartProducts.find(cp => cp.sku === product.sku);
        let selectedPackagingKey: string;
        
        if (cartProduct) {
          selectedPackagingKey = cartProduct.selectedPackagingKey || cartProduct.selectedFormatKey || 'unit';
        } else {
          const localPackaging = productPackaging.get(product.sku);
          selectedPackagingKey = localPackaging || product.selectedFormatKey || product.selectedPackagingKey || 'unit';
        }
        
        return {
          id: product._id || product.productId,
          sku: product.sku,
          name: product.name,
          brand: product.brand,
          image: product.image,
          stock: product.stock,
          price: product.price,
          currency: product.currency,
          discount: product.discount || { percentage: 0, hasDiscount: false },
          unit: product.unit,
          cartQuantity: 0,
          recommendedQuantity: product.recommendedQuantity || 1,
          category: product.type || product.category,
          tag: product.tagKey ? {
            text: translateTag(product.tagKey),
            color: getTagColor(product.tagKey)
          } : undefined,
          tagList: product.tagList ? product.tagList.split(',') : [],
          shoppingListOrder: 0,
          strategyValue: product.tagKey || null,
          packagingOptions,
          selectedPackagingKey,
          unitSales: product.unitSales,
          hasVariants: product.hasVariants || false,
          variantFeatures: product.variantFeatures || [],
          discountList: product.discountList || []
        };
      });

      const uniqueProducts = Array.from(
        new Map(formattedProducts.map(p => [p.id, p])).values()
      );

      setSearchResults(uniqueProducts);
      
      if (completeSearch && query.trim()) {
        await saveLastSearch(query);
      }
    } catch (error) {
      console.error('❌ Error performing search:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [commerceId, saveLastSearch, translateTag, getTagColor]);

  const handleSearchTextChange = useCallback((text: string) => {
    setSearchQuery(text);
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (text.length < 2) {
      setSearchResults([]);
      return;
    }

    searchTimeoutRef.current = setTimeout(() => {
      performSearch(text, false);
    }, 300);
  }, [performSearch]);

  const handleSearchSubmit = useCallback(() => {
    if (searchQuery.trim()) {
      performSearch(searchQuery, true);
      Keyboard.dismiss();
    }
  }, [searchQuery, performSearch]);

  const handleLastSearchSelect = useCallback((searchTerm: string) => {
    setSearchQuery(searchTerm);
    performSearch(searchTerm, true);
    Keyboard.dismiss();
  }, [performSearch]);

  const showSearchBar = useCallback(async () => {
    setInSearchMode(true);
    await loadLastSearches();
  }, [loadLastSearches]);

  const hideSearchBar = useCallback(() => {
    setInSearchMode(false);
    setSearchQuery('');
    setSearchResults([]);
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    Keyboard.dismiss();
  }, []);

  useEffect(() => {
    loadSuggestedProducts();
    loadCategories();
    loadPromotions();
  }, [currentSort]);

  useEffect(() => {
    loadSellerDiscountConfig();
  }, [loadSellerDiscountConfig]);

  useEffect(() => {
    loadOrderDiscounts();
  }, [loadOrderDiscounts, cartProducts]);

  useEffect(() => {
    setSuggestedProducts(prevProducts => 
      prevProducts.map(product => ({
        ...product,
        cartQuantity: cartProducts.find(p => p.id === product.id)?.quantity || 0
      }))
    );
    
    setSearchResults(prevResults => 
      prevResults.map(product => ({
        ...product,
        cartQuantity: cartProducts.find(p => p.id === product.id)?.quantity || 0
      }))
    );
  }, [cartProducts]);

  const handleAddProduct = useCallback(async (productId: string) => {
    const product = suggestedProducts.find(p => p.id === productId);
    if (!product) {
      await addProductToCart(productId);
      return;
    }
    
    const packagingKey = productPackaging.get(product.sku) || product.selectedPackagingKey || 'unit';
    
    const cartService = JavaRealmCartService.getInstance();
    await cartService.addProduct(productId, 1, packagingKey);
    
    // Si hay un descuento potencial, aplicarlo
    const potentialDiscount = potentialDiscounts.get(productId);
    if (potentialDiscount) {
      const discountValue = parseFloat(potentialDiscount.discount.value);
      await cartService.applyProductDiscount(productId, discountValue);
      
      // Remover de potentialDiscounts ya que ahora está en la orden
      const newMap = new Map(potentialDiscounts);
      newMap.delete(productId);
      setPotentialDiscounts(newMap);
    }
    
    await refreshCart();
    await refreshOrderSummary();
    await loadOrderDiscounts();
  }, [suggestedProducts, productPackaging, potentialDiscounts, refreshCart, refreshOrderSummary, loadOrderDiscounts]);

  const handleRemoveProduct = useCallback(async (productId: string) => {
    await removeProductFromCart(productId);
  }, [removeProductFromCart]);

  const handleUpdateQuantity = useCallback(async (productId: string, quantity: number) => {
    await updateCartQuantity(productId, quantity);
  }, [updateCartQuantity]);

  const packagingUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const handleUpdatePackaging = useCallback(async (productId: string, packagingKey: string) => {
    const isProductInCart = cartProducts.some(p => p.id === productId);
    
    setSuggestedProducts(currentProducts => {
      const newProducts = currentProducts.map(p => {
        if (p.id === productId) {
          const packagingOptions = p.packagingOptions || [];
          const selectedOption = packagingOptions.find(opt => opt.key === packagingKey);
          
          if (isProductInCart) {
            const cartProduct = cartProducts.find(cp => cp.id === productId);
            const basePrice = cartProduct ? cartProduct.price : p.price;
            const baseOption = packagingOptions.find(opt => opt.key === (cartProduct?.selectedPackagingKey || 'unit'));
            const baseAmount = baseOption?.amount || 1;
            const newAmount = selectedOption?.amount || 1;
            const calculatedPrice = (basePrice / baseAmount) * newAmount;
            
            return {
              ...p,
              selectedPackagingKey: packagingKey,
              price: calculatedPrice,
            };
          } else {
            const multiplier = selectedOption?.amount || 1;
            const basePrice = p.price / (packagingOptions.find(opt => opt.key === p.selectedPackagingKey)?.amount || 1);
            
            return {
              ...p,
              selectedPackagingKey: packagingKey,
              price: basePrice * multiplier,
            };
          }
        }
        return p;
      });
      return [...newProducts];
    });
    
    if (isProductInCart) {
      setCartProducts(currentCartProducts => {
        return currentCartProducts.map(p => {
          if (p.id === productId) {
            return {
              ...p,
              selectedPackagingKey: packagingKey,
              selectedFormatKey: packagingKey,
            };
          }
          return p;
        });
      });
      
      if (packagingUpdateTimeoutRef.current) {
        clearTimeout(packagingUpdateTimeoutRef.current);
      }
      
      updateCartPackaging(productId, packagingKey).then(() => {
        refreshCart();
        refreshOrderSummary();
      });
    } else {
      const product = suggestedProducts.find(p => p.id === productId);
      if (product) {
        setProductPackaging(prev => {
          const newMap = new Map(prev);
          newMap.set(product.sku, packagingKey);
          return newMap;
        });
      }
    }
  }, [cartProducts, suggestedProducts, updateCartPackaging, refreshCart, refreshOrderSummary]);

  const handleIncrementProduct = useCallback(async (productId: string) => {
    const isProductInCart = cartProducts.some(p => p.id === productId);
    
    if (isProductInCart) {
      await incrementCartProduct(productId);
    } else {
      await handleAddProduct(productId);
    }
  }, [incrementCartProduct, cartProducts, handleAddProduct]);

  const handleDecrementProduct = useCallback(async (productId: string) => {
    await decrementCartProduct(productId);
  }, [decrementCartProduct]);

  const handleBackPress = () => {
    BackHandler.exitApp();
  };

  const handleViewProducts = () => {
    setActiveTab('suggestions');
  };

  const handleAddOrderDiscount = async () => {
    await addOrderDiscount();
  };

  const handleUpdateShipping = async () => {
    await updateShipping();
  };

  const handleFinalizeOrder = async () => {
    await finalizeOrder();
  };

  const handleShareDetails = () => {
  };

  const handleEmptyCart = async () => {
    await clearCart();
  };

  const handleFilter = () => {
    setShowFilterDialog(true);
  };

  const handleSort = () => {
    setShowSortDialog(true);
  };

  const handleSortChange = (sortOption: SortOption) => {
    setSortOption(sortOption);
    loadSuggestedProducts();
  };

  const handleApplyFilters = async (filters: ProductFilters) => {
    try {
      setIsLoadingProducts(true);
      setSuggestedProducts([]);
      applyFilters(filters);
      
      const cartService = JavaRealmCartService.getInstance();
      const products = await cartService.getSuggestedProducts(commerceId, false, 1000);
      
      const formattedProducts: ProductCardProps[] = products.map((product: any) => {
        const packagingOptions = product.packaging 
          ? ProductConverter.createPackagingOptions(product.packaging)
          : [];
        
        const cartProduct = cartProducts.find(cp => cp.sku === product.sku);
        let selectedPackagingKey: string;
        let displayPrice: number;
        
        if (cartProduct) {
          selectedPackagingKey = cartProduct.selectedPackagingKey || cartProduct.selectedFormatKey || 'unit';
          displayPrice = cartProduct.price;
        } else {
          const localPackaging = productPackaging.get(product.sku);
          selectedPackagingKey = localPackaging || product.selectedFormatKey || product.selectedPackagingKey || 'unit';
          
          const selectedOption = packagingOptions.find(opt => opt.key === selectedPackagingKey);
          const multiplier = selectedOption?.amount || 1;
          displayPrice = product.price * multiplier;
        }
        
        return {
          id: product._id || product.productId,
          sku: product.sku,
          name: product.name,
          brand: product.brand,
          image: product.image,
          stock: product.stock,
          price: displayPrice,
          currency: product.currency,
          discount: product.discount || { percentage: 0, hasDiscount: false },
          unit: product.unit,
          cartQuantity: 0,
          recommendedQuantity: product.recommendedQuantity || 1,
          category: product.type || product.category,
          tag: product.tagKey ? {
            text: translateTag(product.tagKey),
            color: getTagColor(product.tagKey)
          } : undefined,
          tagList: product.tagList ? product.tagList.split(',') : [],
          shoppingListOrder: 0,
          strategyValue: product.tagKey || null,
          packagingOptions,
          selectedPackagingKey,
          unitSales: product.unitSales,
          hasVariants: product.hasVariants || false,
          variantFeatures: product.variantFeatures || [],
          discountList: product.discountList || []
        };
      });

      const uniqueProducts = Array.from(
        new Map(formattedProducts.map(p => [p.id, p])).values()
      );

      const filteredProducts = applyFiltersToProducts(uniqueProducts, filters);
      const sortedProducts = sortProductsFunction(filteredProducts);
      setSuggestedProducts(sortedProducts);
    } catch (error) {
      console.error('Error applying filters and loading products:', error);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const handleClearFilters = async () => {
    try {
      setIsLoadingProducts(true);
      setSuggestedProducts([]);
      clearFilters();
      
      const cartService = JavaRealmCartService.getInstance();
      const products = await cartService.getSuggestedProducts(commerceId, false, 1000);
      
      const formattedProducts: ProductCardProps[] = products.map((product: any) => {
        const packagingOptions = product.packaging 
          ? ProductConverter.createPackagingOptions(product.packaging)
          : [];
        
        const cartProduct = cartProducts.find(cp => cp.sku === product.sku);
        let selectedPackagingKey: string;
        let displayPrice: number;
        
        if (cartProduct) {
          selectedPackagingKey = cartProduct.selectedPackagingKey || cartProduct.selectedFormatKey || 'unit';
          displayPrice = cartProduct.price;
        } else {
          const localPackaging = productPackaging.get(product.sku);
          selectedPackagingKey = localPackaging || product.selectedFormatKey || product.selectedPackagingKey || 'unit';
          
          const selectedOption = packagingOptions.find(opt => opt.key === selectedPackagingKey);
          const multiplier = selectedOption?.amount || 1;
          displayPrice = product.price * multiplier;
        }
        
        return {
          id: product._id || product.productId,
          sku: product.sku,
          name: product.name,
          brand: product.brand,
          image: product.image,
          stock: product.stock,
          price: displayPrice,
          currency: product.currency,
          discount: product.discount || { percentage: 0, hasDiscount: false },
          unit: product.unit,
          cartQuantity: 0,
          recommendedQuantity: product.recommendedQuantity || 1,
          category: product.type || product.category,
          tag: product.tagKey ? {
            text: translateTag(product.tagKey),
            color: getTagColor(product.tagKey)
          } : undefined,
          tagList: product.tagList ? product.tagList.split(',') : [],
          shoppingListOrder: 0,
          strategyValue: product.tagKey || null,
          packagingOptions,
          selectedPackagingKey,
          unitSales: product.unitSales,
          hasVariants: product.hasVariants || false,
          variantFeatures: product.variantFeatures || [],
          discountList: product.discountList || []
        };
      });

      const uniqueProducts = Array.from(
        new Map(formattedProducts.map(p => [p.id, p])).values()
      );

      const sortedProducts = sortProductsFunction(uniqueProducts);
      setSuggestedProducts(sortedProducts);
    } catch (error) {
      console.error('Error clearing filters and loading products:', error);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const handleRefresh = async () => {
    await loadSuggestedProducts();
    await refreshCart();
    await refreshOrderSummary();
  };

  const handleShare = () => {
  };

  const handleSearch = () => {
    showSearchBar();
  };

  const shouldShowSellerDiscount = (product: ProductCardProps): boolean => {
    if (product.hasVariants) {
      return false;
    }
    
    const hasDiscountList = product.discountList && product.discountList.length > 0;
    const allowManualDiscount = !sellerDiscountConfig.disableManualDiscount;
    
    return hasDiscountList || allowManualDiscount;
  };

  const handleSellerDiscountPress = (product: ProductCardProps) => {
    setSelectedProductForDiscount(product);
    setShowSellerDiscountDialog(true);
  };

  const handleApplySellerDiscount = async (discount: SellerDiscount) => {
    if (selectedProductForDiscount) {
      const isInCart = cartProducts.some(p => p.id === selectedProductForDiscount.id);
      
      if (isInCart) {
        // Producto ya está en el carrito, aplicar descuento directamente en la orden
        const discountValue = parseFloat(discount.discount.value);
        const cartService = JavaRealmCartService.getInstance();
        await cartService.applyProductDiscount(selectedProductForDiscount.id, discountValue);
        await refreshCart();
        await refreshOrderSummary();
        await loadOrderDiscounts();
      } else {
        // Producto no está en el carrito, guardar en potentialDiscounts
        const newMap = new Map(potentialDiscounts);
        newMap.set(selectedProductForDiscount.id, discount);
        setPotentialDiscounts(newMap);
      }
    }
  };

  const handleRemoveSellerDiscount = async () => {
    if (selectedProductForDiscount) {
      const isInCart = cartProducts.some(p => p.id === selectedProductForDiscount.id);
      
      if (isInCart) {
        // Producto ya está en el carrito, quitar descuento directamente de la orden
        const cartService = JavaRealmCartService.getInstance();
        await cartService.removeProductDiscount(selectedProductForDiscount.id);
        await refreshCart();
        await refreshOrderSummary();
        await loadOrderDiscounts();
      } else {
        // Producto no está en el carrito, quitar de potentialDiscounts
        const newMap = new Map(potentialDiscounts);
        newMap.delete(selectedProductForDiscount.id);
        setPotentialDiscounts(newMap);
      }
    }
  };

  const getProductSellerDiscount = (productId: string): number => {
    // Primero buscar en descuentos de la orden (productos en carrito)
    if (orderDiscounts[productId]) {
      return orderDiscounts[productId];
    }
    
    // Luego buscar en descuentos potenciales (productos no en carrito)
    const discount = potentialDiscounts.get(productId);
    if (!discount) return 0;
    
    return parseFloat(discount.discount.value);
  };


  if (isSubmittingOrder) {
    return (
      <View style={orderTakerScreenStyles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={orderTakerScreenStyles.loadingText}>
          Enviando pedido...
        </Text>
      </View>
    );
  }

  if (isCartLoading) {
    return (
      <View style={orderTakerScreenStyles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={orderTakerScreenStyles.loadingText}>
          Inicializando carrito...
        </Text>
      </View>
    );
  }


  if (inSearchMode) {
    return (
      <View style={orderTakerScreenStyles.container}>
        <SearchBarComponent
          searchQuery={searchQuery}
          onSearchTextChange={handleSearchTextChange}
          onSearchSubmit={handleSearchSubmit}
          onClearSearch={() => setSearchQuery('')}
          onCloseSearch={hideSearchBar}
          lastSearches={lastSearches}
          onLastSearchSelect={handleLastSearchSelect}
          isSearching={isSearching}
          searchResults={searchResults.map(product => ({
            ...product,
            hasSellerDiscount: shouldShowSellerDiscount(product),
            sellerDiscountValue: getProductSellerDiscount(product.id),
          }))}
          onAddProduct={handleAddProduct}
          onIncrementProduct={handleIncrementProduct}
          onDecrementProduct={handleDecrementProduct}
          onUpdateQuantity={handleUpdateQuantity}
          onPackagingChange={handleUpdatePackaging}
          cartProducts={cartProducts.map(p => ({ id: p.id, quantity: p.quantity }))}
          onSellerDiscountPress={handleSellerDiscountPress}
        />
        <BottomNavigation />
      </View>
    );
  }

  return (
    <View style={orderTakerScreenStyles.container}>
      <OrderTakerHeader
        onBackPress={handleBackPress}
        onSearch={handleSearch}
        onMenu={() => {}}
        onFilter={handleFilter}
        onRefresh={handleRefresh}
        onSort={handleSort}
        onShare={handleShare}
        activeFiltersCount={Object.values(currentFilters).reduce((total, filterSet) => total + filterSet.size, 0)}
      />

      <TabSelector
        activeTab={activeTab}
        onTabChange={setActiveTab}
        cartProductsCount={cartProducts.length}
      />
      
      <View style={orderTakerScreenStyles.contentContainer}>
        {isLoadingProducts ? (
          <View style={orderTakerScreenStyles.productsLoadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={orderTakerScreenStyles.productsLoadingText}>
              Cargando productos...
            </Text>
          </View>
        ) : activeTab === 'suggestions' ? (
          suggestedProducts.length > 0 ? (
            <SuggestionsTab 
              products={suggestedProducts.map(product => ({
                ...product,
                hasSellerDiscount: shouldShowSellerDiscount(product),
                sellerDiscountValue: getProductSellerDiscount(product.id),
              }))}
              cartProducts={cartProducts.map(p => ({ id: p.id, quantity: p.quantity }))}
              onAddProduct={handleAddProduct}
              onIncrementProduct={handleIncrementProduct}
              onDecrementProduct={handleDecrementProduct}
              onUpdateQuantity={handleUpdateQuantity}
              onPackagingChange={handleUpdatePackaging}
              onSellerDiscountPress={handleSellerDiscountPress}
            />
          ) : (
            <View style={orderTakerScreenStyles.noProductsContainer}>
              <Text style={orderTakerScreenStyles.noProductsText}>
                No hay productos disponibles
              </Text>
            </View>
          )
        ) : (
          <MyOrderTab 
            cartProducts={cartProducts}
            orderSummary={orderSummary || undefined}
            onViewProducts={handleViewProducts}
            onRemoveProduct={handleRemoveProduct}
            onUpdateQuantity={handleUpdateQuantity}
            onPackagingChange={handleUpdatePackaging}
            onAddOrderDiscount={handleAddOrderDiscount}
            onUpdateShipping={handleUpdateShipping}
            onFinalizeOrder={handleFinalizeOrder}
            onShareOrderDetail={handleShareDetails}
            onClearCart={handleEmptyCart}
            getProductSellerDiscount={getProductSellerDiscount}
            shouldShowSellerDiscount={(product) => shouldShowSellerDiscount(product as any)}
            onSellerDiscountPress={(product) => handleSellerDiscountPress(product as any)}
          />
        )}
      </View>
      
      <BottomNavigation />
      
      <SortDialog
        visible={showSortDialog}
        onClose={() => setShowSortDialog(false)}
        onSelectSort={handleSortChange}
        currentSort={currentSort}
      />
      
      <FilterDialog
        visible={showFilterDialog}
        onClose={() => setShowFilterDialog(false)}
        onApplyFilters={handleApplyFilters}
        onClearFilters={handleClearFilters}
        currentFilters={currentFilters}
        commerceId={commerceId}
        availableStrategies={getAvailableStrategies()}
        getStrategyDisplayName={getStrategyDisplayName}
        availableCategories={availableCategories}
      />

      {selectedProductForDiscount && (
        <SellerDiscountDialog
          visible={showSellerDiscountDialog}
          product={{
            id: selectedProductForDiscount.id,
            sku: selectedProductForDiscount.sku,
            name: selectedProductForDiscount.name,
            brand: selectedProductForDiscount.brand,
            image: selectedProductForDiscount.image,
            price: selectedProductForDiscount.price,
            discountList: selectedProductForDiscount.discountList,
            selectedPackagingKey: selectedProductForDiscount.selectedPackagingKey,
            packagingOptions: selectedProductForDiscount.packagingOptions,
          }}
          currentDiscount={getProductSellerDiscount(selectedProductForDiscount.id)}
          discountLimit={discountLimits.get(selectedProductForDiscount.id)?.limit ? parseFloat(discountLimits.get(selectedProductForDiscount.id)!.limit) : undefined}
          discountTypes={sellerDiscountConfig.discountTypes}
          disableManualDiscount={sellerDiscountConfig.disableManualDiscount}
          onClose={() => {
            setShowSellerDiscountDialog(false);
            setSelectedProductForDiscount(null);
          }}
          onApplyDiscount={handleApplySellerDiscount}
          onRemoveDiscount={handleRemoveSellerDiscount}
        />
      )}
    </View>
  );
};

export default OrderTakerScreen; 