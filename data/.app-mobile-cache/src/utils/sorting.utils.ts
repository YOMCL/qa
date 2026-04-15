import { ProductForSorting, SortOption } from '../types/sorting.types';

export const sortProducts = (products: ProductForSorting[], sorter: SortOption): ProductForSorting[] => {
  if (!products || products.length === 0) {
    return products;
  }

  const sortedProducts = [...products];

  applyBaseSorting(sortedProducts);

  applySpecificSorting(sortedProducts, sorter);

  return sortedProducts;
};

const applyBaseSorting = (products: ProductForSorting[]): void => {
  products.sort((a, b) => {
    const orderA = a.shoppingListOrder ?? Number.MAX_SAFE_INTEGER;
    const orderB = b.shoppingListOrder ?? Number.MAX_SAFE_INTEGER;
    return orderA - orderB;
  });
};

const applySpecificSorting = (products: ProductForSorting[], sorter: SortOption): void => {
  switch (sorter) {
    case 'name':
      products.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case '-name':
      products.sort((a, b) => b.name.localeCompare(a.name));
      break;
    case 'sku':
      products.sort((a, b) => a.sku.localeCompare(b.sku));
      break;
    case '-sku':
      products.sort((a, b) => b.sku.localeCompare(a.sku));
      break;
    case 'brand':
      products.sort((a, b) => {
        const brandA = a.brand || '';
        const brandB = b.brand || '';
        return brandA.localeCompare(brandB);
      });
      break;
    case '-brand':
      products.sort((a, b) => {
        const brandA = a.brand || '';
        const brandB = b.brand || '';
        return brandB.localeCompare(brandA);
      });
      break;
    case 'category':
      products.sort((a, b) => {
        const categoryA = a.category || '';
        const categoryB = b.category || '';
        return categoryA.localeCompare(categoryB);
      });
      break;
    case '-category':
      products.sort((a, b) => {
        const categoryA = a.category || '';
        const categoryB = b.category || '';
        return categoryB.localeCompare(categoryA);
      });
      break;
    case 'price':
      products.sort((a, b) => b.price - a.price);
      break;
    case '-price':
      products.sort((a, b) => a.price - b.price);
      break;
    case 'discount':
      products.sort((a, b) => {
        const discountA = a.discount?.percentage || 0;
        const discountB = b.discount?.percentage || 0;
        return discountB - discountA;
      });
      break;
    case 'shoppingList':
      break;
    default:
      break;
  }
};
