import React from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Button } from 'react-native-paper';
import { cartService } from '../../services/CartService';
import { ProductPromotionInfo } from '../../services/PromotionService';
import { PackagingOption } from '../../types/product.types';
import { PackageSelector } from '../PackageSelector';
import { VariantSelector } from '../VariantSelector';

export type ProductCardProps = {
  id: string;
  sku: string;
  name: string;
  brand: string;
  image: string | null;
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
  tagList?: string[];
  strategyValue?: string | null;
  shoppingListOrder?: number;
  localQuantity?: number;
  cartQuantity?: number;
  showDeleteButton?: boolean;
  onAddPress?: () => void;
  onIncrement?: () => void;
  onDecrement?: () => void;
  onQuantityChange?: (quantity: number) => void;
  onDelete?: () => void;
  buttonLabel?: string;
  buttonColor?: string;
  unitSales?: string[];
  packagingOptions?: PackagingOption[];
  selectedPackagingKey?: string;
  selectedUnitIndex?: number;
  onUnitChange?: (unitIndex: number) => void;
  onPackagingChange?: (packagingKey: string) => void;
  hasVariants?: boolean;
  variantFeatures?: {
    name: string;
    values: string[];
  }[];
  selectedVariants?: string[];
  onVariantChange?: (variants: string[]) => void;
  onVariantSelect?: () => void;
  segmentIds?: string[];
  hasSellerDiscount?: boolean;
  sellerDiscountValue?: number;
  discountList?: number[];
  onSellerDiscountPress?: () => void;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F0F0F0'
  },
  row: {
    flexDirection: 'row'
  },
  rowSpread: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  rowCenter: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  deleteButton: {
    backgroundColor: '#FF5722',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center'
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12
  },
  sku: {
    fontSize: 13,
    color: '#666666'
  },
  name: {
    fontSize: 14,
    color: '#333333',
    marginBottom: 4
  },
  brand: {
    fontSize: 13,
    color: '#666666',
    marginBottom: 8
  },
  stock: {
    fontSize: 13,
    color: '#2196F3',
    fontWeight: 'bold'
  },
  discountBadge: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 8,
    borderRadius: 8
  },
  price: {
    fontSize: 16,
    color: '#333333',
    fontWeight: 'bold'
  },
  originalPrice: {
    fontSize: 16,
    color: '#999999',
    fontWeight: 'bold',
    textDecorationLine: 'line-through',
    marginRight: 8
  },
  promotionalPrice: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: 'bold'
  },
  unitBadge: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 60,
    borderRadius: 8
  },
  quantityButton: {
    backgroundColor: '#F5F5F5',
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center'
  },
  quantityButtonActive: {
    backgroundColor: '#4CAF50'
  },
  quantityInput: {
    width: 40,
    height: 32,
    marginHorizontal: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 4,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333333',
    textAlign: 'center'
  },
  recommendation: {
    fontSize: 12,
    color: '#666666',
    marginTop: 8
  },
  promotionMessage: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 8,
    borderRadius: 8,
    borderLeftWidth: 4
  },
  stepPromotionMessage: {
    backgroundColor: '#FFF3E0',
    borderLeftColor: '#FF9800'
  },
  giftPromotionMessage: {
    backgroundColor: '#E8F5E8',
    borderLeftColor: '#4CAF50'
  },
  text90: {
    fontSize: 12
  },
  text80: {
    fontSize: 13
  },
  text70: {
    fontSize: 14
  },
  text60: {
    fontSize: 16
  },
  colorWhite: {
    color: '#FFFFFF'
  },
  colorRed: {
    color: '#BF360C'
  },
  colorGreen: {
    color: '#1B5E20'
  },
  sellerDiscountIcon: {
    width: 32,
    height: 32,
    backgroundColor: '#2196F3',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  sellerDiscountIconText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  priceRowWithDiscount: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export const ProductCard: React.FC<ProductCardProps> = ({
  id,
  sku,
  name,
  brand,
  image,
  stock,
  price,
  currency,
  discount,
  unit,
  recommendedQuantity,
  category,
  tag,
  cartQuantity = 0,
  showDeleteButton = false,
  onAddPress,
  onIncrement,
  onDecrement,
  onQuantityChange,
  onDelete,
  buttonLabel,
  buttonColor,
  unitSales,
  packagingOptions,
  selectedPackagingKey = 'unit',
  selectedUnitIndex = 0,
  onUnitChange,
  onPackagingChange,
  hasVariants = false,
  variantFeatures,
  selectedVariants = [],
  onVariantChange,
  onVariantSelect,
  segmentIds = [],
  hasSellerDiscount = false,
  sellerDiscountValue = 0,
  discountList = [],
  onSellerDiscountPress,
}) => {
  
  const getDisplayPrice = (): number => {
    return price;
  };

  const getPriceAfterSellerDiscount = (): number => {
    if (sellerDiscountValue > 0) {
      return price * (1 - sellerDiscountValue);
    }
    return price;
  };

  const hasSellerDiscountApplied = sellerDiscountValue > 0;

  const getPackagingMultiplier = (): number => {
    if (!packagingOptions || !selectedPackagingKey) return 1;
    const selectedOption = packagingOptions.find(opt => opt.key === selectedPackagingKey);
    return selectedOption?.amount || 1;
  };
  
  const [localQuantity, setLocalQuantity] = React.useState(cartQuantity);
  const [quantityText, setQuantityText] = React.useState(cartQuantity > 0 ? cartQuantity.toString() : '');
  const [isEditingQuantity, setIsEditingQuantity] = React.useState(false);
  const lastCartQuantityRef = React.useRef(cartQuantity);
  const [promotionInfo, setPromotionInfo] = React.useState<ProductPromotionInfo>({
    hasStepPromotion: false,
    hasCatalogPromotion: false,
    hasGiftPromotion: false,
  });
  
  const memoizedSegmentIds = React.useMemo(() => segmentIds || [], [JSON.stringify(segmentIds || [])]);
  
  React.useEffect(() => {
    if (cartQuantity !== lastCartQuantityRef.current) {
      lastCartQuantityRef.current = cartQuantity;
      setLocalQuantity(cartQuantity);
      if (!isEditingQuantity) {
        setQuantityText(cartQuantity > 0 ? cartQuantity.toString() : '');
      }
    }
  }, [cartQuantity, isEditingQuantity]);

  React.useEffect(() => {
    const loadPromotionInfo = () => {
      const info = cartService.getProductPromotionInfo(
        id,
        localQuantity,
        memoizedSegmentIds,
        price
      );
      setPromotionInfo(info);
    };

    loadPromotionInfo();
  }, [id, localQuantity, memoizedSegmentIds, price]);
  
  const formatPrice = (price: number) => {
    return `$${price.toLocaleString()}`;
  };

  const hasItemsInCart = localQuantity > 0 || isEditingQuantity;
  const shouldShowDeleteButton = showDeleteButton && localQuantity > 0;
  const hasMultiplePackaging = packagingOptions && packagingOptions.length > 1;
  const hasMultipleUnits = unitSales && unitSales.length > 1;
  const hasVariantFeatures = hasVariants && variantFeatures && variantFeatures.length > 0;
  
  const shouldShowPackagingSelector = hasMultiplePackaging || hasMultipleUnits;

  const handleQuantityChange = (text: string) => {
    setQuantityText(text);
    setIsEditingQuantity(true);
    
    if (text === '' || text === '0') {
      return;
    }
    
    const quantity = parseInt(text);
    if (!isNaN(quantity) && quantity > 0) {
      setLocalQuantity(quantity);
      onQuantityChange?.(quantity);
    }
  };

  const handleQuantityBlur = () => {
    setIsEditingQuantity(false);
    const quantity = parseInt(quantityText) || 0;
    if (quantity <= 0) {
      setQuantityText(localQuantity > 0 ? localQuantity.toString() : '');
    } else {
      setLocalQuantity(quantity);
      setQuantityText(quantity.toString());
      onQuantityChange?.(quantity);
    }
  };

  const handleQuantitySubmit = () => {
    setIsEditingQuantity(false);
    const quantity = parseInt(quantityText) || 0;
    if (quantity <= 0) {
      setQuantityText(localQuantity > 0 ? localQuantity.toString() : '');
    } else {
      setLocalQuantity(quantity);
      setQuantityText(quantity.toString());
      onQuantityChange?.(quantity);
    }
  };

  return (
    <View style={styles.card}>
      <View style={[styles.rowSpread, { marginBottom: 8 }]}>
        <Text style={styles.sku}>{sku}</Text>
        {shouldShowDeleteButton ? (
          <TouchableOpacity
            onPress={() => {
              setLocalQuantity(0);
              setQuantityText('0');
              setIsEditingQuantity(false);
              onDelete?.();
            }}
            style={styles.deleteButton}
          >
            <Text style={[styles.text80, styles.colorWhite, { fontWeight: 'bold' }]}>×</Text>
          </TouchableOpacity>
        ) : tag && (
          <View style={[styles.tag, { backgroundColor: tag.color }]}>
            <Text style={[styles.text90, styles.colorWhite, { fontWeight: 'bold' }]}>{tag.text}</Text>
          </View>
        )}
      </View>

      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Text style={styles.name} numberOfLines={2}>{name}</Text>
          <Text style={styles.brand}>{brand}</Text>

          <View style={[styles.rowSpread, { marginBottom: 8 }]}>
            <View style={styles.rowCenter}>
              <Text style={styles.stock}>Stock: {stock}</Text>
              {discount.hasDiscount && (
                <View style={styles.discountBadge}>
                  <Text style={[styles.text90, styles.colorWhite, { fontWeight: 'bold' }]}>
                    {discount.percentage}%
                  </Text>
                </View>
              )}
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' }}>
              {hasSellerDiscount && onSellerDiscountPress && (
                <TouchableOpacity 
                  style={styles.sellerDiscountIcon}
                  onPress={onSellerDiscountPress}
                >
                  <Text style={styles.sellerDiscountIconText}>%</Text>
                </TouchableOpacity>
              )}
              {hasSellerDiscountApplied ? (
                <View style={{ alignItems: 'flex-end' }}>
                  <View style={[styles.discountBadge, { marginBottom: 2 }]}>
                    <Text style={[styles.text90, styles.colorWhite, { fontWeight: 'bold' }]}>
                      {(sellerDiscountValue * 100).toFixed(2)}% dscto
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                    <Text style={[styles.text90, { color: '#999999', textDecorationLine: 'line-through' }]}>
                      Antes {formatPrice(getDisplayPrice())}
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                    <Text style={styles.promotionalPrice}>
                      {formatPrice(getPriceAfterSellerDiscount())}
                    </Text>
                    <Text style={[styles.text80, { color: '#666666', marginLeft: 4 }]}>/pos</Text>
                  </View>
                </View>
              ) : (promotionInfo.hasPromotionalPrice || promotionInfo.hasCatalogPromotion) && promotionInfo.originalPrice ? (
                <View style={{ alignItems: 'flex-end' }}>
                  <View style={styles.rowCenter}>
                    <Text style={styles.originalPrice}>
                      {formatPrice(showDeleteButton ? promotionInfo.originalPrice : promotionInfo.originalPrice * getPackagingMultiplier())}
                    </Text>
                    <Text style={styles.promotionalPrice}>
                      {formatPrice(getDisplayPrice())}
                    </Text>
                    <Text style={[styles.text80, { color: '#666666', marginLeft: 4 }]}>/pos</Text>
                  </View>
                </View>
              ) : (
                <View style={{ alignItems: 'flex-end' }}>
                  <View style={styles.rowCenter}>
                    <Text style={styles.price}>{formatPrice(getDisplayPrice())}</Text>
                    <Text style={[styles.text80, { color: '#666666', marginLeft: 4 }]}>/pos</Text>
                  </View>
                </View>
              )}
            </View>
          </View>

          <View style={[styles.rowSpread, styles.rowCenter]}>
            {hasVariantFeatures ? (
              <VariantSelector
                variantFeatures={variantFeatures}
                selectedVariants={selectedVariants}
                onVariantChange={onVariantChange || (() => {})}
                disabled={false}
              />
            ) : shouldShowPackagingSelector ? (
              <PackageSelector
                packagingOptions={packagingOptions}
                selectedPackagingKey={selectedPackagingKey}
                onPackagingChange={onPackagingChange || (() => {})}
                unitSales={unitSales}
                selectedUnitIndex={selectedUnitIndex}
                onUnitChange={onUnitChange || (() => {})}
                disabled={false}
              />
            ) : (
              <View style={styles.unitBadge}>
                <Text style={[styles.text70, { color: '#333333', textAlign: 'center' }]}>{unit}</Text>
              </View>
            )}
            
            {hasVariantFeatures ? (
              <Button
                mode="contained"
                onPress={onVariantSelect}
                buttonColor={buttonColor || "#007AFF"}
                style={{ minWidth: 120 }}
              >
                Seleccionar Variante
              </Button>
            ) : hasItemsInCart ? (
              <View style={[styles.rowCenter, { minWidth: 100 }]}>
                <TouchableOpacity
                  onPress={() => {
                    const newQuantity = Math.max(0, localQuantity - 1);
                    setLocalQuantity(newQuantity);
                    setQuantityText(newQuantity.toString());
                    setIsEditingQuantity(false);
                    onDecrement?.();
                  }}
                  disabled={localQuantity <= 0}
                  style={[styles.quantityButton, { opacity: localQuantity <= 0 ? 0.5 : 1 }]}
                >
                  <Text style={[styles.text60, { color: '#333333', fontWeight: 'bold' }]}>-</Text>
                </TouchableOpacity>

                <TextInput
                  value={quantityText}
                  onChangeText={handleQuantityChange}
                  onBlur={handleQuantityBlur}
                  onSubmitEditing={handleQuantitySubmit}
                  keyboardType="numeric"
                  style={styles.quantityInput}
                />

                <TouchableOpacity
                  onPress={() => {
                    const newQuantity = localQuantity + 1;
                    setLocalQuantity(newQuantity);
                    setQuantityText(newQuantity.toString());
                    setIsEditingQuantity(false);
                    onIncrement?.();
                  }}
                  style={[styles.quantityButton, styles.quantityButtonActive]}
                >
                  <Text style={[styles.text60, styles.colorWhite, { fontWeight: 'bold' }]}>+</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <Button
                mode="contained"
                onPress={() => {
                  setLocalQuantity(1);
                  setQuantityText('1');
                  setIsEditingQuantity(false);
                  onAddPress?.();
                }}
                buttonColor={buttonColor || "#4CAF50"}
                style={{ minWidth: 100 }}
              >
                {buttonLabel || "Agregar"}
              </Button>
            )}
          </View>

          <Text style={styles.recommendation}>
            Recomendamos {recommendedQuantity} unidad{recommendedQuantity > 1 ? 'es' : ''} de este producto
          </Text>

          {promotionInfo.hasStepPromotion && promotionInfo.stepPromotionMessage && (
            <View style={[styles.promotionMessage, styles.stepPromotionMessage]}>
              <Text style={[styles.text90, styles.colorRed]}>
                {promotionInfo.stepPromotionMessage}
              </Text>
            </View>
          )}

          {promotionInfo.hasGiftPromotion && promotionInfo.giftPromotionMessage && (
            <View style={[styles.promotionMessage, styles.giftPromotionMessage]}>
              <Text style={[styles.text90, styles.colorGreen]}>
                {promotionInfo.giftPromotionMessage}
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

ProductCard.displayName = 'ProductCard';
