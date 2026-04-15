import React from 'react';
import { ScrollView, View } from 'react-native';
import { ProductCard } from '../components/ProductCard/ProductCard';

// Ejemplo de uso del ProductCard con promociones
export const ProductCardWithPromotionsExample: React.FC = () => {
  // Ejemplo de producto con promoción step
  const productWithStepPromotion = {
    id: 'product-1',
    sku: 'SKU001',
    name: 'Producto con Promoción Step',
    brand: 'Marca Ejemplo',
    image: null,
    stock: 100,
    price: 1000,
    currency: 'CLP',
    discount: {
      percentage: 0,
      hasDiscount: false,
    },
    unit: 'unidad',
    recommendedQuantity: 5,
    category: 'Categoría A',
    segmentIds: ['segment-1', 'segment-2'], // IDs de segmentos para promociones
  };

  // Ejemplo de producto con promoción catalog
  const productWithCatalogPromotion = {
    id: 'product-2',
    sku: 'SKU002',
    name: 'Producto con Promoción Catalog',
    brand: 'Marca Ejemplo',
    image: null,
    stock: 50,
    price: 2000,
    currency: 'CLP',
    discount: {
      percentage: 0,
      hasDiscount: false,
    },
    unit: 'unidad',
    recommendedQuantity: 3,
    category: 'Categoría B',
    segmentIds: ['segment-1', 'segment-2'],
  };

  // Ejemplo de producto sin promociones
  const productWithoutPromotion = {
    id: 'product-3',
    sku: 'SKU003',
    name: 'Producto Sin Promociones',
    brand: 'Marca Ejemplo',
    image: null,
    stock: 200,
    price: 500,
    currency: 'CLP',
    discount: {
      percentage: 0,
      hasDiscount: false,
    },
    unit: 'unidad',
    recommendedQuantity: 2,
    category: 'Categoría C',
    segmentIds: ['segment-1', 'segment-2'],
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#F5F5F5' }}>
      <View style={{ padding: 16 }}>
        <ProductCard
          {...productWithStepPromotion}
          cartQuantity={0}
          onAddPress={() => console.log('Agregar producto con promoción step')}
          onIncrement={() => console.log('Incrementar cantidad')}
          onDecrement={() => console.log('Decrementar cantidad')}
          onQuantityChange={(quantity) => console.log('Cambiar cantidad:', quantity)}
        />

        <ProductCard
          {...productWithCatalogPromotion}
          cartQuantity={0}
          onAddPress={() => console.log('Agregar producto con promoción catalog')}
          onIncrement={() => console.log('Incrementar cantidad')}
          onDecrement={() => console.log('Decrementar cantidad')}
          onQuantityChange={(quantity) => console.log('Cambiar cantidad:', quantity)}
        />

        <ProductCard
          {...productWithoutPromotion}
          cartQuantity={0}
          onAddPress={() => console.log('Agregar producto sin promociones')}
          onIncrement={() => console.log('Incrementar cantidad')}
          onDecrement={() => console.log('Decrementar cantidad')}
          onQuantityChange={(quantity) => console.log('Cambiar cantidad:', quantity)}
        />
      </View>
    </ScrollView>
  );
};
