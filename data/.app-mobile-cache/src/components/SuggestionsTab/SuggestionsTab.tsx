import React from 'react';
import { FlatList, ScrollView } from 'react-native';
import { ProductCard, ProductCardProps } from '../ProductCard';

export type SuggestionsTabProps = {
  products: ProductCardProps[];
  cartProducts: { id: string; quantity: number }[];
  onAddProduct: (productId: string) => void;
  onIncrementProduct: (productId: string) => void;
  onDecrementProduct: (productId: string) => void;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onPackagingChange: (productId: string, packagingKey: string) => void;
  onSellerDiscountPress?: (product: ProductCardProps) => void;
};

const SuggestionsTabComponent: React.FC<SuggestionsTabProps> = ({
  products,
  cartProducts,
  onAddProduct,
  onIncrementProduct,
  onDecrementProduct,
  onUpdateQuantity,
  onPackagingChange,
  onSellerDiscountPress,
}) => {
  const getCartQuantity = (productId: string): number => {
    const cartProduct = cartProducts.find(p => p.id === productId);
    return cartProduct ? cartProduct.quantity : 0;
  };

  const renderProduct = ({ item: product }: { item: ProductCardProps }) => (
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
      cartQuantity={getCartQuantity(product.id)}
      onAddPress={() => onAddProduct(product.id)}
      onIncrement={() => onIncrementProduct(product.id)}
      onDecrement={() => onDecrementProduct(product.id)}
      onQuantityChange={(quantity) => onUpdateQuantity(product.id, quantity)}
      packagingOptions={product.packagingOptions}
      selectedPackagingKey={product.selectedPackagingKey}
      onPackagingChange={(packagingKey) => onPackagingChange(product.id, packagingKey)}
      unitSales={product.unitSales}
      hasVariants={product.hasVariants}
      variantFeatures={product.variantFeatures}
      hasSellerDiscount={product.hasSellerDiscount}
      sellerDiscountValue={product.sellerDiscountValue}
      discountList={product.discountList}
      onSellerDiscountPress={onSellerDiscountPress ? () => onSellerDiscountPress(product) : undefined}
    />
  );

  return (
    <ScrollView style={{ flex: 1 }}>
      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        showsVerticalScrollIndicator={false}
      />
    </ScrollView>
  );
};

export const SuggestionsTab = React.memo(SuggestionsTabComponent); 