import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Button, IconButton } from 'react-native-paper';
import { FilterCategory, FilterDialogProps, ProductFilters } from '../../types/filter.types';
import { ExpandableCategories } from '../ExpandableCategories';

export type { FilterDialogProps } from '../../types/filter.types';

export const FilterDialog: React.FC<FilterDialogProps> = ({
  visible,
  onClose,
  onApplyFilters,
  onClearFilters,
  currentFilters,
  commerceId,
  availableStrategies = [],
  getStrategyDisplayName = (strategy) => strategy,
  availableCategories = []
}) => {
  const [filters, setFilters] = useState<ProductFilters>(currentFilters);
  const [filterCategories, setFilterCategories] = useState<FilterCategory[]>([]);
  const [categoryTagsMap, setCategoryTagsMap] = useState<Map<string, string[]>>(new Map());

  useEffect(() => {
    if (visible) {
      const filtersWithCategoryIds = convertTagsToCategoryIds(currentFilters);
      setFilters(filtersWithCategoryIds);
      loadFilterOptions();
      buildCategoryTagsMap();
    }
  }, [visible, currentFilters, availableCategories, buildCategoryTagsMap, convertTagsToCategoryIds, loadFilterOptions]);

  const loadFilterOptions = useCallback(() => {
    const strategyOptions = availableStrategies.map(strategy => ({
      id: strategy,
      name: getStrategyDisplayName(strategy),
      value: strategy
    }));

    const categories: FilterCategory[] = [
      {
        id: 'strategy',
        name: 'Estrategia',
        options: strategyOptions,
        selected: filters.strategy
      },
      {
        id: 'stock',
        name: 'Stock',
        options: [
          { id: 'stock', name: 'Disponible en stock', value: 'stock' }
        ],
        selected: filters.stock
      },
      {
        id: 'promotion',
        name: 'Promoción',
        options: [
          { id: 'promotion', name: 'Productos con promoción', value: 'promotion' }
        ],
        selected: filters.promotion
      },
      {
        id: 'noSales',
        name: 'Sin Ventas',
        options: [
          { id: 'noSales', name: 'Productos sin ventas mes actual', value: 'noSales' }
        ],
        selected: filters.noSales
      }
    ];

    setFilterCategories(categories);
  }, [availableStrategies, getStrategyDisplayName, filters.strategy, filters.stock, filters.promotion, filters.noSales]);

  const buildCategoryTagsMap = useCallback(() => {
    const map = new Map<string, string[]>();
    
    availableCategories.forEach(category => {
      map.set(category.id, category.tags);
    });
    
    setCategoryTagsMap(map);
  }, [availableCategories]);

  const convertTagsToCategoryIds = useCallback((filtersWithTags: ProductFilters): ProductFilters => {
    const categoryIds = new Set<string>();
    
    Array.from(filtersWithTags.category).forEach(tag => {
      availableCategories.forEach(category => {
        if (category.tags.includes(tag)) {
          categoryIds.add(category.id);
        }
      });
    });
    
    return {
      ...filtersWithTags,
      category: categoryIds
    };
  }, [availableCategories]);

  const handleCategorySelect = (categoryId: string, categoryName: string, tags: string[]) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      
      if (newFilters.category.has(categoryId)) {
        newFilters.category.delete(categoryId);
      } else {
        newFilters.category.add(categoryId);
      }
      
      return newFilters;
    });
  };

  const toggleFilterOption = (categoryId: string, optionValue: string) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      const category = newFilters[categoryId as keyof ProductFilters] as Set<string>;
      
      if (category.has(optionValue)) {
        category.delete(optionValue);
      } else {
        category.add(optionValue);
      }
      
      return newFilters;
    });
  };

  const clearAllFilters = () => {
    const clearedFilters = {
      businessUnit: new Set<string>(),
      category: new Set<string>(),
      strategy: new Set<string>(),
      format: new Set<string>(),
      stock: new Set<string>(),
      promotion: new Set<string>(),
      noSales: new Set<string>(),
    };
    setFilters(clearedFilters);
    onClearFilters();
    onClose();
  };

  const applyFilters = () => {
    const filtersWithTags = {
      businessUnit: new Set(filters.businessUnit),
      category: new Set<string>(),
      strategy: new Set(filters.strategy),
      format: new Set(filters.format),
      stock: new Set(filters.stock),
      promotion: new Set(filters.promotion),
      noSales: new Set(filters.noSales),
    };
    
    const selectedCategoryIds = Array.from(filters.category);
    
    selectedCategoryIds.forEach(categoryId => {
      const tags = categoryTagsMap.get(categoryId);
      if (tags) {
        tags.forEach(tag => filtersWithTags.category.add(tag));
      }
    });
    
    onApplyFilters(filtersWithTags);
    onClose();
  };

  const hasActiveFilters = () => {
    const otherFiltersActive = Object.entries(filters).some(([key, filterSet]) => 
      key !== 'category' && filterSet.size > 0
    );
    const categoriesActive = filters.category.size > 0;
    
    return otherFiltersActive || categoriesActive;
  };

  const getActiveFiltersCount = () => {
    const otherFiltersCount = Object.entries(filters).reduce((total, [key, filterSet]) => 
      key !== 'category' ? total + filterSet.size : total, 0
    );
    const categoriesCount = filters.category.size;
    
    return otherFiltersCount + categoriesCount;
  };

  if (!visible) return null;

  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <View style={{ flex: 1, backgroundColor: '#FFFFFF', marginHorizontal: 20, marginVertical: 100, borderRadius: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16 }}>
          <Text style={{ fontSize: 22, color: '#333333', fontWeight: '600' }}>Filtros</Text>
          <IconButton icon="close" size={24} onPress={onClose} iconColor="#666666" />
        </View>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 20 }}>
          <View style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 16, color: '#333333', marginBottom: 12 }}>Categorías</Text>
            <ExpandableCategories
              categories={availableCategories}
              onCategorySelect={handleCategorySelect}
              selectedCategories={filters.category}
            />
          </View>

          {filterCategories.map(category => (
            <View key={category.id} style={{ marginBottom: 24 }}>
              <Text style={{ fontSize: 16, color: '#333333', marginBottom: 12 }}>{category.name}</Text>
              {category.options.map(option => (
                <TouchableOpacity
                  key={option.id}
                  onPress={() => toggleFilterOption(category.id, option.value)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                    backgroundColor: filters[category.id as keyof ProductFilters].has(option.value) ? '#E3F2FD' : 'transparent',
                    borderRadius: 8,
                    marginBottom: 8,
                    borderWidth: 1,
                    borderColor: filters[category.id as keyof ProductFilters].has(option.value) ? '#007AFF' : '#DDDDDD'
                  }}
                >
                  <View
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      borderWidth: 2,
                      borderColor: filters[category.id as keyof ProductFilters].has(option.value) ? '#007AFF' : '#DDDDDD',
                      backgroundColor: filters[category.id as keyof ProductFilters].has(option.value) ? '#007AFF' : 'transparent',
                      marginRight: 12,
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {filters[category.id as keyof ProductFilters].has(option.value) && (
                      <Text style={{ fontSize: 14, color: '#FFFFFF' }}>✓</Text>
                    )}
                  </View>
                  <Text style={{ fontSize: 14, color: '#333333' }}>{option.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </ScrollView>

        <View style={{ flexDirection: 'row', paddingHorizontal: 20, paddingBottom: 20, paddingTop: 16 }}>
          <Button
            mode="outlined"
            onPress={clearAllFilters}
            style={{ flex: 1, marginRight: 12, borderColor: '#DDDDDD' }}
            labelStyle={{ color: '#666666' }}
          >
            Limpiar
          </Button>
          <Button
            mode="contained"
            onPress={applyFilters}
            style={{ flex: 1, marginLeft: 12 }}
            buttonColor="#007AFF"
          >
            {`Aplicar${hasActiveFilters() ? ` (${getActiveFiltersCount()})` : ''}`}
          </Button>
        </View>
      </View>
    </View>
  );
};
