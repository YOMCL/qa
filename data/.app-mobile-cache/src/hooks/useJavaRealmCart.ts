import { useCallback, useEffect, useRef, useState } from 'react';
import { CartProduct, OrderSummary } from '../components/MyOrderTab/MyOrderTab';
import { JavaRealmCartService } from '../services/JavaRealmCartService';
import { useDebugTiming } from './useDebugTiming';

type UseJavaRealmCartProps = {
  commerceId: string;
  orderId?: string;
};

type UseJavaRealmCartReturn = {
  cartProducts: CartProduct[];
  orderSummary: OrderSummary | null;
  isLoading: boolean;
  isConnected: boolean;
  handleAddProduct: (productId: string, quantity?: number) => Promise<boolean>;
  handleRemoveProduct: (productId: string) => Promise<boolean>;
  handleUpdateQuantity: (productId: string, quantity: number) => Promise<boolean>;
  handleUpdatePackaging: (productId: string, packagingKey: string) => Promise<boolean>;
  handleIncrementProduct: (productId: string) => Promise<boolean>;
  handleDecrementProduct: (productId: string) => Promise<boolean>;
  handleClearCart: () => Promise<boolean>;
  refreshCart: () => Promise<void>;
  refreshOrderSummary: () => Promise<void>;
  getCurrentQuantity: (productId: string) => number;
  registerUpdateCallback: (productId: string, callback: (quantity: number) => void) => void;
  unregisterUpdateCallback: (productId: string) => void;
};

export const useJavaRealmCart = ({ commerceId, orderId }: UseJavaRealmCartProps): UseJavaRealmCartReturn => {
  const [cartProducts, setCartProducts] = useState<CartProduct[]>([]);
  const [orderSummary, setOrderSummary] = useState<OrderSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  
  const { startTiming, endTiming } = useDebugTiming();
  
  const uiStateRef = useRef<Map<string, number>>(new Map());
  const cartProductsRef = useRef<CartProduct[]>([]);
  const updateCallbacksRef = useRef<Map<string, (quantity: number) => void>>(new Map());
  const debounceTimersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const pendingChangesRef = useRef<Map<string, number>>(new Map());
  
  const cartService = JavaRealmCartService.getInstance();

  const getCurrentQuantity = useCallback((productId: string): number => {
    const uiQuantity = uiStateRef.current.get(productId);
    if (uiQuantity !== undefined) {
      return uiQuantity;
    }
    
    const realProduct = cartProductsRef.current.find(p => p.id === productId);
    return realProduct?.quantity || 0;
  }, []);

  const updateUIOnly = useCallback((productId: string, quantity: number) => {
    uiStateRef.current.set(productId, quantity);
    
    const callback = updateCallbacksRef.current.get(productId);
    if (callback) {
      callback(quantity);
    }
  }, []);

  const registerUpdateCallback = useCallback((productId: string, callback: (quantity: number) => void) => {
    updateCallbacksRef.current.set(productId, callback);
  }, []);

  const unregisterUpdateCallback = useCallback((productId: string) => {
    updateCallbacksRef.current.delete(productId);
  }, []);

  const debouncedUpdate = useCallback((productId: string, newQuantity: number, operationType: 'add' | 'remove' | 'update') => {
    const existingTimer = debounceTimersRef.current.get(productId);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }
    
    pendingChangesRef.current.set(productId, newQuantity);
    
    const timer = setTimeout(async () => {
      const finalQuantity = pendingChangesRef.current.get(productId);
      if (finalQuantity !== undefined) {
        try {
          let success = false;
          switch (operationType) {
            case 'add':
              success = await cartService.addProduct(productId, finalQuantity);
              break;
            case 'remove':
              success = await cartService.removeProduct(productId);
              break;
            case 'update':
              success = await cartService.updateQuantity(productId, finalQuantity);
              break;
          }
          
          if (success) {
            const products = await cartService.getCartProducts();
            cartProductsRef.current = products;
            setCartProducts(products);
            
            const summary = await cartService.getOrderSummary();
            if (summary) {
              setOrderSummary(summary);
            }
          }
        } catch (error) {
          console.error(`Error in ${operationType} operation for ${productId}:`, error);
        }
        
        pendingChangesRef.current.delete(productId);
        debounceTimersRef.current.delete(productId);
      }
    }, 500);
    
    debounceTimersRef.current.set(productId, timer);
  }, [cartService]);

  const refreshCart = useCallback(async () => {
    startTiming('refreshCart');
    try {
      const products = await cartService.getCartProducts();
      cartProductsRef.current = products;
      setCartProducts(products);
      
      const summary = await cartService.getOrderSummary();
      if (summary) {
        setOrderSummary(summary);
      }
      
      endTiming('refreshCart', true);
    } catch (error) {
      console.error('Error refreshing cart:', error);
      cartProductsRef.current = [];
      setCartProducts([]);
      endTiming('refreshCart', false, error instanceof Error ? error.message : 'Unknown error');
    }
  }, [cartService, startTiming, endTiming]);

  const refreshOrderSummary = useCallback(async () => {
    startTiming('refreshOrderSummary');
    try {
      const summary = await cartService.getOrderSummary();
      setOrderSummary(summary);
      endTiming('refreshOrderSummary', true);
    } catch (error) {
      console.error('Error refreshing order summary:', error);
      endTiming('refreshOrderSummary', false, error instanceof Error ? error.message : 'Unknown error');
    }
  }, [cartService, startTiming, endTiming]);

  const initializeCart = useCallback(async () => {
    startTiming('initializeCart');
    try {
      setIsLoading(true);
      
      await cartService.getCommercePromotions(commerceId);
      
      const success = await cartService.initializeCart(commerceId);
      setIsConnected(success);

      if (success) {
        await refreshCart();
        await refreshOrderSummary();
        endTiming('initializeCart', true);
      } else {
        endTiming('initializeCart', false, 'Failed to initialize cart service');
      }

      setIsLoading(false);
    } catch (error) {
      setIsConnected(false);
      setIsLoading(false);
      endTiming('initializeCart', false, error instanceof Error ? error.message : 'Unknown error');
    }
  }, [commerceId, cartService, refreshCart, refreshOrderSummary, startTiming, endTiming]);

  const handleAddProduct = useCallback(async (productId: string, quantity: number = 1): Promise<boolean> => {
    const currentQuantity = getCurrentQuantity(productId);
    const newQuantity = currentQuantity + quantity;
    
    updateUIOnly(productId, newQuantity);
    debouncedUpdate(productId, newQuantity, 'add');
    
    return true;
  }, [getCurrentQuantity, updateUIOnly, debouncedUpdate]);

  const handleRemoveProduct = useCallback(async (productId: string): Promise<boolean> => {
    updateUIOnly(productId, 0);
    debouncedUpdate(productId, 0, 'remove');
    
    return true;
  }, [updateUIOnly, debouncedUpdate]);

  const handleUpdateQuantity = useCallback(async (productId: string, quantity: number): Promise<boolean> => {
    updateUIOnly(productId, quantity);
    debouncedUpdate(productId, quantity, 'update');
    
    return true;
  }, [updateUIOnly, debouncedUpdate]);

  const handleIncrementProduct = useCallback(async (productId: string): Promise<boolean> => {
    const currentQuantity = getCurrentQuantity(productId);
    const newQuantity = currentQuantity + 1;
    
    updateUIOnly(productId, newQuantity);
    debouncedUpdate(productId, newQuantity, 'update');
    
    return true;
  }, [getCurrentQuantity, updateUIOnly, debouncedUpdate]);

  const handleDecrementProduct = useCallback(async (productId: string): Promise<boolean> => {
    const currentQuantity = getCurrentQuantity(productId);
    
    if (currentQuantity <= 1) {
      updateUIOnly(productId, 0);
      debouncedUpdate(productId, 0, 'remove');
      return true;
    }
    
    const newQuantity = currentQuantity - 1;
    
    updateUIOnly(productId, newQuantity);
    debouncedUpdate(productId, newQuantity, 'update');
    
    return true;
  }, [getCurrentQuantity, updateUIOnly, debouncedUpdate]);

  const handleUpdatePackaging = useCallback(async (productId: string, packagingKey: string): Promise<boolean> => {
    try {
      const success = await cartService.updateProductPackaging(productId, packagingKey);
      if (success) {
        await refreshCart();
        await refreshOrderSummary();
      }
      return success;
    } catch (error) {
      console.error('Error updating packaging:', error);
      return false;
    }
  }, [cartService, refreshCart, refreshOrderSummary]);

  const handleClearCart = useCallback(async (): Promise<boolean> => {
    try {
      const success = await cartService.clearCart();
      if (success) {
        cartProductsRef.current = [];
        setCartProducts([]);
        uiStateRef.current.clear();
        
        // Actualizar también el resumen de la orden
        const summary = await cartService.getOrderSummary();
        if (summary) {
          setOrderSummary(summary);
        }
      }
      return success;
    } catch (error) {
      console.error('Error clearing cart:', error);
      return false;
    }
  }, [cartService]);

  useEffect(() => {
    if (commerceId) {
      initializeCart();
    }
  }, [commerceId, initializeCart]);

  useEffect(() => {
    return () => {
      debounceTimersRef.current.forEach((timer) => {
        clearTimeout(timer);
      });
      debounceTimersRef.current.clear();
      pendingChangesRef.current.clear();
    };
  }, []);

  return {
    cartProducts,
    orderSummary,
    isLoading,
    isConnected,
    handleAddProduct,
    handleRemoveProduct,
    handleUpdateQuantity,
    handleUpdatePackaging,
    handleIncrementProduct,
    handleDecrementProduct,
    handleClearCart,
    refreshCart,
    refreshOrderSummary,
    getCurrentQuantity,
    registerUpdateCallback,
    unregisterUpdateCallback,
  };
};