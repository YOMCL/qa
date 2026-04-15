import { ProductCardProps } from '../components/ProductCard';
import { ProductFilters } from '../types/filter.types';

export const applyFiltersToProducts = (products: ProductCardProps[], filters: ProductFilters): ProductCardProps[] => {
  if (!products || products.length === 0) {
    return products;
  }

  let filteredProducts = [...products];

  if (filters.category.size > 0) {
    filteredProducts = filteredProducts.filter(product => {
      if (!product.tagList || product.tagList.length === 0) return false;
      
      const selectedCategoryIds = Array.from(filters.category);
      
      return selectedCategoryIds.some(categoryId => {
        return product.tagList?.includes(categoryId) || false;
      });
    });
  }

  if (filters.strategy.size > 0) {
    filteredProducts = filteredProducts.filter(product => {
      if (!product.strategyValue) return false;
      return filters.strategy.has(product.strategyValue);
    });
  }

  if (filters.stock.size > 0) {
    filteredProducts = filteredProducts.filter(product => {
      return product.stock > 0;
    });
  }

  if (filters.promotion.size > 0) {
    filteredProducts = filteredProducts.filter(product => {
      return product.discount.hasDiscount && product.discount.percentage > 0;
    });
  }

  if (filters.noSales.size > 0) {
    filteredProducts = filteredProducts.filter(product => {
      return product.stock === 0;
    });
  }

  return filteredProducts;
};

export const hasActiveFilters = (filters: ProductFilters): boolean => {
  return Object.values(filters).some(filterSet => filterSet.size > 0);
};

export const getActiveFiltersCount = (filters: ProductFilters): number => {
  return Object.values(filters).reduce((total, filterSet) => total + filterSet.size, 0);
};
