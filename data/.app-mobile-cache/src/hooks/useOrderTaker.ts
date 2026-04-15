import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { CartProduct, OrderSummary } from '../components/MyOrderTab/MyOrderTab';
import { useJavaRealm } from '../contexts/JavaRealmContext';
import { AuthService } from '../services/AuthService';
import { JavaRealmCartService } from '../services/JavaRealmCartService';
import { OrderService, OrderSubmissionError } from '../services/OrderService';
import { DEFAULT_FILTERS, ProductFilters } from '../types/filter.types';
import { CommerceData, OrderData, ProductSegmentedData } from '../types/realm.types';
import { SellerDiscount } from '../types/seller-discount.types';
import { SortOption } from '../types/sorting.types';
import { buildSellerOrderPayload } from '../utils/orderPayloadMapper';
import { sortProducts } from '../utils/sorting.utils';

export type UseOrderTakerProps = {
  commerceId: string;
  orderId?: string;
  segmentId?: string;
  externalId?: string;
  sourceId?: string;
  onClearCart?: () => Promise<boolean>;
  sellerDiscounts?: SellerDiscount[];
};

export type UseOrderTakerReturn = {
  cartProducts: CartProduct[];
  orderSummary?: OrderSummary;
  order?: OrderData;
  commerce?: CommerceData;
  isLoading: boolean;
  isSubmittingOrder: boolean;
  
  handleAddProduct: (productId: string) => Promise<void>;
  handleRemoveProduct: (productId: string) => Promise<void>;
  handleUpdateQuantity: (productId: string, quantity: number) => Promise<void>;
  handleIncrementProduct: (productId: string) => Promise<void>;
  handleDecrementProduct: (productId: string) => Promise<void>;
  
  handleFinalizeOrder: () => Promise<void>;
  handleEmptyCart: () => Promise<void>;
  handleAddOrderDiscount: () => Promise<void>;
  handleUpdateShipping: () => Promise<void>;

  handleSearch: (query: string) => Promise<ProductSegmentedData[]>;
  
  refreshOrder: () => Promise<void>;
  
  currentSort: SortOption;
  handleSortChange: (sortOption: SortOption) => void;
  sortProducts: (products: any[]) => any[];

  currentFilters: ProductFilters;
  handleApplyFilters: (filters: ProductFilters) => void;
  handleClearFilters: () => void;
  getAvailableStrategies: () => string[];
  getStrategyDisplayName: (strategy: string) => string;
};

export const useOrderTaker = ({
  commerceId,
  orderId,
  segmentId,
  externalId,
  sourceId,
  onClearCart,
  sellerDiscounts = []
}: UseOrderTakerProps): UseOrderTakerReturn => {
  const [cartProducts, setCartProducts] = useState<CartProduct[]>([]);
  const [orderSummary, setOrderSummary] = useState<OrderSummary | undefined>(undefined);
  const [order, setOrder] = useState<OrderData | undefined>(undefined);
  const [commerce, setCommerce] = useState<CommerceData | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [currentSort, setCurrentSort] = useState<SortOption>('shoppingList');
  const [currentFilters, setCurrentFilters] = useState<ProductFilters>(DEFAULT_FILTERS);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  
  const { javaRealmService, isLoading: isJavaRealmLoading, isConnected } = useJavaRealm();
  const orderService = OrderService.getInstance();
  const cartService = JavaRealmCartService.getInstance();

  const updateOrderSummary = useCallback(() => {
    const summary = cartService.getOrderSummarySync();
    setOrderSummary({
      subtotal: summary.subtotal,
      discount: summary.discount,
      shipping: summary.shipping,
      total: summary.total,
      currency: summary.currency,
    });
  }, [cartService]);

  const setupAuthToken = useCallback(() => {
    const authService = new AuthService();
    orderService.setAuthService(authService);
  }, [orderService]);


  const initializeOrderTaker = useCallback(async () => {
    try {
      setIsLoading(true);
      
      setupAuthToken();
      
      const success = await cartService.initializeCart(commerceId);
      if (!success) {
        setIsLoading(false);
        return;
      }

      const orderData = await cartService.getOrderData();
      
      if (orderData) {
        setOrder(orderData as OrderData);
      }

      const mockCommerce = {
        _id: commerceId,
        authorized: true,
        aovKpi: 0,
        depthKpi: 0,
        amplitudeKpi: 0,
      };
      setCommerce(mockCommerce);

      if (javaRealmService) {
        await javaRealmService.loadProductsGroupDescriptions();
      }
    } catch (error) {
      console.error('Error initializing order taker:', error);
    } finally {
      setIsLoading(false);
    }
  }, [commerceId, cartService, javaRealmService, setupAuthToken]);

  useEffect(() => {
    if (!isJavaRealmLoading) {
      initializeOrderTaker();
    }
  }, [commerceId, orderId, isJavaRealmLoading, isConnected, javaRealmService, initializeOrderTaker]);

  const refreshOrder = useCallback(async () => {
    const orderData = await cartService.getOrderData();
    if (orderData) {
      setOrder(orderData as OrderData);
    }
  }, [cartService]);



  const handleRemoveProduct = useCallback(async (productId: string) => {
    try {
      const success = await cartService.removeProduct(productId);
      if (success) {
        await refreshOrder();
      }
    } catch (error) {
      console.error('Error removing product:', error);
    }
  }, [cartService, refreshOrder]);

  const handleUpdateQuantity = useCallback(async (productId: string, quantity: number) => {
    try {
      if (quantity <= 0) {
        await handleRemoveProduct(productId);
        return;
      }

      const success = await cartService.updateQuantity(productId, quantity);
      if (success) {
        await refreshOrder();
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  }, [cartService, handleRemoveProduct, refreshOrder]);

  const handleAddProduct = useCallback(async (productId: string) => {
    try {
      const success = await cartService.addProduct(productId, 1);
      if (success) {
        await refreshOrder();
      }
    } catch (error) {
      console.error('Error adding product:', error);
    }
  }, [cartService, refreshOrder]);


  const handleIncrementProduct = useCallback(async (productId: string) => {
    try {
      const success = await cartService.addProduct(productId, 1);
      if (success) {
        await refreshOrder();
      }
    } catch (error) {
      console.error('Error incrementing product:', error);
    }
  }, [cartService, refreshOrder]);

  const handleDecrementProduct = useCallback(async (productId: string) => {
    try {
      const success = await cartService.removeProduct(productId);
      if (success) {
        await refreshOrder();
      }
    } catch (error) {
      console.error('Error decrementing product:', error);
    }
  }, [cartService, refreshOrder]);

  const handleFinalizeOrder = useCallback(async () => {
    if (!cartService.getCurrentOrderId()) {
      Alert.alert('Error', 'No hay pedido para enviar');
      return;
    }

    if (isSubmittingOrder) {
      return;
    }

    try {
      setIsSubmittingOrder(true);
      
      setupAuthToken();
      
      const completeOrderData = await cartService.getCompleteOrderData();
      
      if (!completeOrderData) {
        Alert.alert('Error', 'No se pudo obtener los datos del pedido');
        return;
      }

      if (!completeOrderData.products || completeOrderData.products.length === 0) {
        Alert.alert('Error', 'El pedido no tiene productos');
        return;
      }

      if (!completeOrderData.shippingAddress) {
        Alert.alert('Error', 'El pedido no tiene dirección de envío');
        return;
      }

      const orderDataWithDiscounts = {
        ...completeOrderData,
        sellerDiscounts: sellerDiscounts.map(discount => ({
          mode: {
            type: discount.mode.type,
            productId: discount.mode.productId,
          },
          discount: {
            value: discount.discount.value,
            type: discount.discount.type,
            classification: discount.discount.classification,
          },
        })),
      };

      const payload = buildSellerOrderPayload(orderDataWithDiscounts as any, { externalId, sourceId });

      await orderService.saveOrder(payload as any);

      if (onClearCart) {
        await onClearCart();
      }
      
      Alert.alert(
        'Pedido enviado',
        'El pedido ha sido enviado exitosamente.',
        [
          {
            text: 'Aceptar',
            onPress: () => {
              if (commerce) {
                commerce.orderStatus = 'submitted';
                commerce.lastOrderSubmittedDate = new Date();
              }
            }
          }
        ]
      );
      
    } catch (error) {
      console.error('❌ Error submitting order:', JSON.stringify(error, null, 2));
      const submissionError = error as OrderSubmissionError;
      
      if (submissionError.code === 409) {
        Alert.alert(
          'Error',
          'El pedido ya existe. Intenta nuevamente.',
          [
            {
              text: 'Reintentar',
              onPress: () => handleFinalizeOrder()
            }
          ]
        );
      } else if (submissionError.isDiscountLimitError) {
        Alert.alert('Error de descuentos', submissionError.message);
      } else if (submissionError.code === 0) {
        Alert.alert('Error de conexión', 'No se pudo conectar con el servidor. El pedido se guardará localmente.');
      } else {
        Alert.alert('Error', `Error al enviar el pedido: ${submissionError.message}`);
      }
    } finally {
      setIsSubmittingOrder(false);
    }
  }, [order, isSubmittingOrder, orderService, commerce, cartService, setupAuthToken, onClearCart]);

  const handleEmptyCart = useCallback(async () => {
    try {
      const success = await cartService.clearCart();
      if (success) {
        await refreshOrder();
      }
    } catch (error) {
      console.error('Error emptying cart:', error);
    }
  }, [cartService, refreshOrder]);

  const handleAddOrderDiscount = useCallback(async () => {
  }, []);

  const handleUpdateShipping = useCallback(async () => {
  }, []);

  const handleSearch = useCallback(async (query: string): Promise<ProductSegmentedData[]> => {
    try {
      if (!isConnected || !javaRealmService) {
        return [];
      }
      
      const results = await javaRealmService.searchProducts(query, 20, commerceId);
      return results.map(result => result._realmData) as unknown as ProductSegmentedData[];
    } catch (error) {
      console.error('Error searching products:', error);
      return [];
    }
  }, [commerceId, javaRealmService, isConnected]);

  const handleSortChange = useCallback((sortOption: SortOption) => {
    setCurrentSort(sortOption);
  }, []);

  const sortProductsFunction = useCallback((products: any[]) => {
    return sortProducts(products, currentSort);
  }, [currentSort]);

  const handleApplyFilters = useCallback((filters: ProductFilters) => {
    setCurrentFilters(filters);
  }, []);

  const handleClearFilters = useCallback(() => {
    setCurrentFilters(DEFAULT_FILTERS);
  }, []);

  const getAvailableStrategies = useCallback(() => {
    if (!javaRealmService) return [];
    return javaRealmService.getAvailableStrategies(commerceId);
  }, [javaRealmService, commerceId]);

  const getStrategyDisplayName = useCallback((strategy: string) => {
    if (!javaRealmService) return strategy;
    return javaRealmService.getStrategyDisplayName(strategy);
  }, [javaRealmService]);

  return {
    cartProducts,
    orderSummary,
    order,
    commerce,
    isLoading,
    isSubmittingOrder,
    
    handleAddProduct,
    handleRemoveProduct,
    handleUpdateQuantity,
    handleIncrementProduct,
    handleDecrementProduct,
    
    handleFinalizeOrder,
    handleEmptyCart,
    handleAddOrderDiscount,
    handleUpdateShipping,
    
    handleSearch,

    refreshOrder,
    
    currentSort,
    handleSortChange,
    sortProducts: sortProductsFunction,

    currentFilters,
    handleApplyFilters,
    handleClearFilters,
    getAvailableStrategies,
    getStrategyDisplayName
  };
};