import React, { useRef, useState } from 'react';
import { Alert, Animated, NativeScrollEvent, NativeSyntheticEvent, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { cartService } from '../../services/CartService';
import { JavaRealmCartService } from '../../services/JavaRealmCartService';
import { PackagingOption } from '../../types/product.types';
import { ProductCard } from '../ProductCard';

export type CartProduct = {
  id: string;
  sku: string;
  name: string;
  brand: string;
  image: string;
  stock: number;
  price: number;
  currency: string;
  discount: {
    percentage: number;
    hasDiscount: boolean;
  };
  unit: string;
  recommendedQuantity: number;
  category: string;
  tag?: {
    text: string;
    color: string;
  };
  quantity: number;
  productId: string;
  _orderId_productId?: string;
  weight?: string;
  stockQuantity?: string;
  weightUnit?: string;
  tagList?: string;
  type?: string;
  groupSegmentId?: string;
  description?: string;
  source?: string;
  selectedFormatKey?: string;
  suggestedQuantity?: string;
  sourceSuggestion?: boolean;
  isSuggestion?: boolean;
  unitSales?: string[];
  packagingOptions?: PackagingOption[];
  selectedPackagingKey?: string;
  hasVariants?: boolean;
  variantFeatures?: {
    name: string;
    values: string[];
  }[];
  packaging?: {
    packageUnit?: string;
    amountPerPallet?: string;
    amountPerBox?: string;
    amountPerPackage?: string;
    packageName?: string;
    boxName?: string;
    palletName?: string;
    selectedPackaging?: string;
    unitSales?: string[];
  };
  taxes?: {
    taxCode: string;
    taxName: string;
    taxRate: number;
  }[];
  discountList?: number[];
};

export type DeliveryAddress = {
  id: string;
  name: string;
  address: string;
  commune: string;
  phone?: string;
  city?: string;
  _id: string;
  street: string;
  number?: string;
  region?: string;
  country?: string;
  zipCode?: string;
  contactName?: string;
  isDefault: boolean;
};

export type OrderSummary = {
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  currency: string;
};

export type MyOrderTabProps = {
  cartProducts: CartProduct[];
  orderSummary?: OrderSummary;
  deliveryAddresses?: DeliveryAddress[];
  selectedAddress?: DeliveryAddress;
  onViewProducts?: () => void;
  onRemoveProduct?: (productId: string) => void;
  onUpdateQuantity?: (productId: string, quantity: number) => void;
  onPackagingChange?: (productId: string, packagingKey: string) => void;
  onAddOrderDiscount?: () => void;
  onUpdateShipping?: () => void;
  onFinalizeOrder?: () => void;
  onSelectAddress?: (address: DeliveryAddress) => void;
  onAddObservation?: () => void;
  onShareOrderDetail?: () => void;
  onClearCart?: () => void;
  getProductSellerDiscount?: (productId: string) => number;
  shouldShowSellerDiscount?: (product: CartProduct) => boolean;
  onSellerDiscountPress?: (product: CartProduct) => void;
};

const MyOrderTabComponent: React.FC<MyOrderTabProps> = ({
  cartProducts,
  orderSummary,
  onPackagingChange,
  deliveryAddresses = [],
  selectedAddress,
  onViewProducts,
  onRemoveProduct,
  onUpdateQuantity,
  onAddOrderDiscount,
  onUpdateShipping,
  onFinalizeOrder,
  onSelectAddress,
  onAddObservation,
  onShareOrderDetail,
  onClearCart,
  getProductSellerDiscount,
  shouldShowSellerDiscount,
  onSellerDiscountPress
}) => {
  const [showAddressSelector, setShowAddressSelector] = useState(false);
  const [showFloatingComponent, setShowFloatingComponent] = useState(true);
  const [minOrderValue, setMinOrderValue] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const scrollY = useRef(new Animated.Value(0)).current;
  const lastScrollY = useRef(0);

  const formatPrice = (price: number) => {
    return `$${price.toLocaleString()}`;
  };

  const handleAddressSelect = (address: DeliveryAddress) => {
    onSelectAddress?.(address);
    setShowAddressSelector(false);
  };

  const handleClearCart = () => {
    Alert.alert(
      '',
      '¿Estás seguro de quitar todos los productos del pedido?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Aceptar',
          onPress: () => onClearCart?.(),
        },
      ]
    );
  };

  const getDiscountedPrice = (product: CartProduct): number => {
    const promotionInfo = cartService.getProductPromotionInfo(
      product.id,
      product.quantity,
      [],
      product.price
    );
    
    if (promotionInfo.hasPromotionalPrice && promotionInfo.promotionalPrice) {
      return promotionInfo.promotionalPrice;
    }
    
    if (promotionInfo.hasCatalogPromotion && promotionInfo.catalogPromotionPrice) {
      return promotionInfo.catalogPromotionPrice;
    }
    
    if (product.discount.hasDiscount) {
      return product.price * (1 - product.discount.percentage / 100);
    }
    
    return product.price;
  };

  const getTotalTaxes = (): number => {
    const appliedTaxes = cartService.getCurrentCart() ? 
      (cartService as any).cartHandler?.getAppliedTaxes() : null;
    return appliedTaxes?.totalTaxAmount || 0;
  };

  const [javaOrderSummary, setJavaOrderSummary] = useState<OrderSummary | null>(null);

  React.useEffect(() => {
    const loadOrderSummary = async () => {
      const javaRealmService = JavaRealmCartService.getInstance();
      const summary = await javaRealmService.getOrderSummary();
      if (summary) {
        setJavaOrderSummary(summary);
      }
    };
    
    loadOrderSummary();
  }, [cartProducts]);

  React.useEffect(() => {
    const loadMinOrderValue = async () => {
      const javaRealmService = JavaRealmCartService.getInstance();
      const siteConfig = await javaRealmService.getSiteConfig();
      const minValue = siteConfig?.minOrderValue || 0;
      setMinOrderValue(minValue);
    };
    
    loadMinOrderValue();
  }, []);

  const getOrderSummary = (): OrderSummary => {
    if (orderSummary) return orderSummary;
    if (javaOrderSummary) return javaOrderSummary;
    
    return {
      subtotal: 0,
      discount: 0,
      shipping: 0,
      total: 0,
      currency: 'CLP'
    };
  };

  const meetsMinimumOrder = (): boolean => {
    const summary = getOrderSummary();
    const meetsMinimum = summary.total >= minOrderValue;
    return meetsMinimum;
  };

  const getRemainingToMinimum = (): number => {
    const summary = getOrderSummary();
    const remaining = Math.max(0, minOrderValue - summary.total);
    return remaining;
  };

  const handleIncrement = (productId: string) => {
    const product = cartProducts.find(p => p.id === productId);
    if (product && onUpdateQuantity) {
      onUpdateQuantity(productId, product.quantity + 1);
    }
  };

  const handleDecrement = (productId: string) => {
    const product = cartProducts.find(p => p.id === productId);
    if (product && onUpdateQuantity) {
      if (product.quantity <= 1) {
        onRemoveProduct?.(productId);
      } else {
        onUpdateQuantity(productId, product.quantity - 1);
      }
    }
  };

  const summary = getOrderSummary();

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const currentScrollY = event.nativeEvent.contentOffset.y;
    const contentHeight = event.nativeEvent.contentSize.height;
    const scrollViewHeight = event.nativeEvent.layoutMeasurement.height;
    
    const isNearBottom = currentScrollY + scrollViewHeight >= contentHeight - 200;
    
    setShowFloatingComponent(!isNearBottom);
    
    lastScrollY.current = currentScrollY;
    scrollY.setValue(currentScrollY);
  };

  if (cartProducts.length === 0) {
    return (
      <View style={styles.emptyCartContainer}>
        <Text style={styles.emptyCartText}>
          Oops! Parece que aún no has{'\n'}añadido nada a tu carrito
        </Text>
        <TouchableOpacity
          style={styles.emptyCartButton}
          onPress={onViewProducts}
        >
          <Text style={styles.emptyCartButtonText}>Ver listado de productos</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView 
        ref={scrollViewRef}
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollViewContent}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {cartProducts.map((product) => (
          <View key={product.id} style={styles.productCartItem}>
            <ProductCard
              id={product.id}
              sku={product.sku}
              name={product.name}
              brand={product.brand}
              image={product.image}
              stock={product.stock}
              price={product.price}
              currency={product.currency}
              discount={product.discount}
              unit={product.unit}
              recommendedQuantity={product.recommendedQuantity}
              category={product.category}
              tag={product.tag}
              cartQuantity={product.quantity}
              showDeleteButton={true}
              onIncrement={() => handleIncrement(product.id)}
              onDecrement={() => handleDecrement(product.id)}
              onQuantityChange={(quantity) => onUpdateQuantity?.(product.id, quantity)}
              onDelete={() => onRemoveProduct?.(product.id)}
              packagingOptions={product.packagingOptions}
              selectedPackagingKey={product.selectedPackagingKey}
              onPackagingChange={(packagingKey) => onPackagingChange?.(product.id, packagingKey)}
              unitSales={product.unitSales}
              hasVariants={product.hasVariants}
              variantFeatures={product.variantFeatures}
              hasSellerDiscount={shouldShowSellerDiscount ? shouldShowSellerDiscount(product) : false}
              sellerDiscountValue={getProductSellerDiscount ? getProductSellerDiscount(product.id) : 0}
              discountList={product.discountList}
              onSellerDiscountPress={onSellerDiscountPress ? () => onSellerDiscountPress(product) : undefined}
            />
            
            <View style={styles.subtotalContainer}>
              <View style={styles.subtotalRow}>
                <Text style={styles.subtotalLabel}>Subtotal:</Text>
                <Text style={styles.subtotalValue}>
                  {formatPrice(getDiscountedPrice(product) * product.quantity)}
                </Text>
              </View>
            </View>
          </View>
        ))}
        
        <View style={styles.addressSelectorContainer}>
          <Text style={styles.addressSelectorTitle}>
            Seleccione dirección de despacho
          </Text>
          
          <TouchableOpacity
            onPress={() => setShowAddressSelector(!showAddressSelector)}
            style={styles.addressSelector}
          >
            <Text style={styles.addressSelectorText}>
              {selectedAddress 
                ? `${selectedAddress.address}, ${selectedAddress.commune}`
                : 'CALLE 2 LOCAL #124 FEMACA,..'
              }
            </Text>
            <Text style={styles.addressSelectorArrow}>▼</Text>
          </TouchableOpacity>

          {showAddressSelector && deliveryAddresses.length > 0 && (
            <View style={styles.addressDropdown}>
              {deliveryAddresses.map((address) => (
                <TouchableOpacity
                  key={address.id}
                  onPress={() => handleAddressSelect(address)}
                  style={[
                    styles.addressOption,
                    selectedAddress?.id === address.id && styles.addressOptionSelected
                  ]}
                >
                  <Text style={styles.addressOptionText}>
                    {address.address}, {address.commune}
                  </Text>
                  {address.name && (
                    <Text style={styles.addressOptionName}>
                      {address.name}
                    </Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}

          <TouchableOpacity
            onPress={onAddObservation}
            style={styles.observationButton}
          >
            <View style={styles.observationIcon}>
              <Text style={styles.observationIconText}>+</Text>
            </View>
            <Text style={styles.observationButtonText}>
              Agregar una observación
            </Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.orderSummaryContainer}>
          <View style={styles.orderSummaryRow}>
            <Text style={styles.orderSummaryLabel}>Neto total:</Text>
            <Text style={styles.orderSummaryValue}>{formatPrice(summary.subtotal)}</Text>
          </View>

          <View style={styles.orderSummaryRow}>
            <Text style={styles.orderSummaryLabel}>Descuentos Productos:</Text>
            <Text style={styles.orderSummaryValue}>{formatPrice(summary.discount)}</Text>
          </View>

          <View style={styles.orderSummaryRow}>
            <Text style={styles.orderSummaryLabel}>Descuento Orden:</Text>
            <TouchableOpacity onPress={onAddOrderDiscount} style={styles.orderDiscountButton}>
              <Text style={styles.orderDiscountButtonText}>Agregar</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.orderSummaryRow}>
            <Text style={styles.orderSummaryLabel}>Impuesto:</Text>
            <Text style={styles.orderSummaryValue}>{formatPrice(getTotalTaxes())}</Text>
          </View>

          <View style={styles.orderSummaryRow}>
            <Text style={styles.orderSummaryLabel}>Despacho:</Text>
            <TouchableOpacity onPress={onUpdateShipping} style={styles.shippingButton}>
              <Text style={styles.shippingButtonText}>
                {summary.shipping > 0 ? formatPrice(summary.shipping) : "No calculado por vendedor"}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total a pagar:</Text>
            <Text style={styles.totalValue}>{formatPrice(summary.total)}</Text>
          </View>

          <Text style={styles.productCount}>
            {cartProducts.length} Producto{cartProducts.length !== 1 ? 's' : ''}
          </Text>

          {!meetsMinimumOrder() && minOrderValue > 0 && (
            <View style={styles.minimumOrderWarning}>
              <Text style={styles.minimumOrderWarningTitle}>Pedido mínimo no cumplido</Text>
              <Text style={styles.minimumOrderWarningText}>
                Faltan {formatPrice(getRemainingToMinimum())} para alcanzar el pedido mínimo de {formatPrice(minOrderValue)}
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={[
              styles.finalizeButton,
              (!onFinalizeOrder || !meetsMinimumOrder()) && styles.finalizeButtonDisabled
            ]}
            onPress={() => {
              if (onFinalizeOrder && meetsMinimumOrder()) {
                onFinalizeOrder();
              }
            }}
            disabled={!onFinalizeOrder || !meetsMinimumOrder()}
          >
            <Text style={styles.finalizeButtonText}>Finalizar pedido</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.shareButton}
            onPress={onShareOrderDetail}
          >
            <Text style={styles.shareButtonText}>Compartir detalle</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleClearCart}
            style={styles.clearCartButton}
          >
            <Text style={styles.clearCartButtonText}>Vaciar carrito</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {showFloatingComponent && (
        <View style={styles.floatingOrderSummary}>
          <View style={styles.floatingContent}>
            <View>
              <Text style={styles.floatingLabel}>Total a pagar:</Text>
              <Text style={styles.floatingTotal}>{formatPrice(summary.total)}</Text>
              {!meetsMinimumOrder() && minOrderValue > 0 && (
                <Text style={styles.floatingWarning}>
                  Faltan {formatPrice(getRemainingToMinimum())}
                </Text>
              )}
            </View>
            <TouchableOpacity
              style={[
                styles.floatingFinalizeButton,
                (!onFinalizeOrder || !meetsMinimumOrder()) && styles.floatingFinalizeButtonDisabled
              ]}
              onPress={() => {
                if (onFinalizeOrder && meetsMinimumOrder()) {
                  onFinalizeOrder();
                }
              }}
              disabled={!onFinalizeOrder || !meetsMinimumOrder()}
            >
              <Text style={styles.floatingFinalizeButtonText}>Finalizar pedido</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 100,
  },
  emptyCartContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyCartText: {
    fontSize: 20,
    color: '#999999',
    textAlign: 'center',
    marginBottom: 40,
  },
  emptyCartButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
  },
  emptyCartButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  productCartItem: {
    marginBottom: 8,
  },
  subtotalContainer: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  subtotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subtotalLabel: {
    fontSize: 14,
    color: '#666666',
  },
  subtotalValue: {
    fontSize: 16,
    color: '#333333',
    fontWeight: 'bold',
  },
  addressSelectorContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginTop: 16,
    borderRadius: 12,
  },
  addressSelectorTitle: {
    fontSize: 16,
    color: '#333333',
    fontWeight: 'bold',
    marginBottom: 12,
  },
  addressSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    marginBottom: 12,
  },
  addressSelectorText: {
    fontSize: 14,
    color: '#333333',
    flex: 1,
  },
  addressSelectorArrow: {
    fontSize: 14,
    color: '#666666',
  },
  addressDropdown: {
    backgroundColor: '#F9F9F9',
    padding: 8,
    borderRadius: 8,
    marginBottom: 12,
  },
  addressOption: {
    padding: 12,
    borderRadius: 4,
    marginBottom: 4,
  },
  addressOptionSelected: {
    backgroundColor: '#E3F2FD',
  },
  addressOptionText: {
    fontSize: 14,
    color: '#333333',
  },
  addressOptionName: {
    fontSize: 13,
    color: '#666666',
    marginTop: 4,
  },
  observationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  observationIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  observationIconText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
  observationButtonText: {
    fontSize: 14,
    color: '#007AFF',
  },
  orderSummaryContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginTop: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderSummaryLabel: {
    fontSize: 14,
    color: '#666666',
  },
  orderSummaryValue: {
    fontSize: 14,
    color: '#333333',
    fontWeight: 'bold',
  },
  orderDiscountButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  orderDiscountButtonText: {
    fontSize: 14,
    color: '#007AFF',
  },
  shippingButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  shippingButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 16,
    color: '#333333',
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 20,
    color: '#333333',
    fontWeight: 'bold',
  },
  productCount: {
    fontSize: 13,
    color: '#666666',
    marginBottom: 20,
  },
  minimumOrderWarning: {
    backgroundColor: '#FFF3CD',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  minimumOrderWarningTitle: {
    fontSize: 14,
    color: '#856404',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  minimumOrderWarningText: {
    fontSize: 13,
    color: '#856404',
  },
  finalizeButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  finalizeButtonDisabled: {
    backgroundColor: '#CCCCCC',
    opacity: 0.6,
  },
  finalizeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  shareButton: {
    backgroundColor: 'transparent',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  shareButtonText: {
    color: '#333333',
    fontSize: 16,
  },
  clearCartButton: {
    alignItems: 'center',
    paddingVertical: 15,
    marginBottom: 12,
    backgroundColor: '#FFE5E5',
    borderRadius: 8,
  },
  clearCartButtonText: {
    color: '#FF4444',
    fontSize: 14,
    fontWeight: '600',
  },
  floatingOrderSummary: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  floatingContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  floatingLabel: {
    fontSize: 14,
    color: '#333333',
    fontWeight: 'bold',
  },
  floatingTotal: {
    fontSize: 20,
    color: '#333333',
    fontWeight: 'bold',
  },
  floatingWarning: {
    fontSize: 13,
    color: '#856404',
    marginTop: 4,
  },
  floatingFinalizeButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  floatingFinalizeButtonDisabled: {
    backgroundColor: '#CCCCCC',
    opacity: 0.6,
  },
  floatingFinalizeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export const MyOrderTab = React.memo(MyOrderTabComponent); 