import React, { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { CategoryFilterOption } from '../../types/filter.types';

export type ExpandableCategoriesProps = {
  categories: CategoryFilterOption[];
  onCategorySelect: (categoryId: string, categoryName: string, tags: string[]) => void;
  selectedCategories: Set<string>;
};

type CategoryGroup = {
  parent: CategoryFilterOption;
  children: CategoryFilterOption[];
};

export const ExpandableCategories: React.FC<ExpandableCategoriesProps> = ({
  categories,
  onCategorySelect,
  selectedCategories
}) => {
  const [expandedGroup, setExpandedGroup] = useState<number | null>(null);

  const groupedCategories = React.useMemo(() => {
    const groups: CategoryGroup[] = [];
    const parentMap = new Map<string, CategoryFilterOption>();
    const childMap = new Map<string, CategoryFilterOption[]>();

    categories.forEach(category => {
      if (!category.parent) {
        parentMap.set(category.id, category);
        childMap.set(category.id, []);
      }
    });

    categories.forEach(category => {
      if (category.parent && parentMap.has(category.parent)) {
        const children = childMap.get(category.parent) || [];
        children.push(category);
        childMap.set(category.parent, children);
      }
    });

    parentMap.forEach((parent, parentId) => {
      const children = childMap.get(parentId) || [];
      groups.push({ parent, children });
    });

    return groups;
  }, [categories]);

  const handleGroupPress = (index: number) => {
    if (expandedGroup === index) {
      setExpandedGroup(null);
    } else {
      setExpandedGroup(index);
    }
  };

  const handleCategoryPress = (category: CategoryFilterOption, isParent: boolean = false) => {
    const categoryName = isParent ? category.name : category.name;
    onCategorySelect(category.id, categoryName, category.tags);
  };

  const isCategorySelected = (category: CategoryFilterOption): boolean => {
    return selectedCategories.has(category.id);
  };

  const isParentSelected = (parent: CategoryFilterOption): boolean => {
    return selectedCategories.has(parent.id);
  };

  return (
    <View>
      {groupedCategories.map((group, groupIndex) => (
        <View key={group.parent.id} marginB-8>
          <TouchableOpacity
            onPress={() => handleGroupPress(groupIndex)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingVertical: 12,
              paddingHorizontal: 16,
              backgroundColor: isParentSelected(group.parent) ? '#E3F2FD' : '#F8F9FA',
              borderRadius: 8,
              borderWidth: 1,
              borderColor: isParentSelected(group.parent) ? '#007AFF' : '#E9ECEF'
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <View
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 10,
                  borderWidth: 2,
                  borderColor: isParentSelected(group.parent) ? '#007AFF' : '#DDDDDD',
                  backgroundColor: isParentSelected(group.parent) ? '#007AFF' : 'transparent',
                  marginRight: 12,
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {isParentSelected(group.parent) && (
                  <Text text70 color="#FFFFFF">✓</Text>
                )}
              </View>
              <Text text70 color="#333333" style={{ fontWeight: '600' }}>
                {group.parent.name}
              </Text>
            </View>
            <Text text70 color="#666666">
              {expandedGroup === groupIndex ? '−' : '+'}
            </Text>
          </TouchableOpacity>

          {expandedGroup === groupIndex && (
            <View marginL-16 marginT-4>
              <TouchableOpacity
                onPress={() => handleCategoryPress(group.parent, true)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                  backgroundColor: isParentSelected(group.parent) ? '#E3F2FD' : '#F8F9FA',
                  borderRadius: 6,
                  marginBottom: 4,
                  borderWidth: 1,
                  borderColor: isParentSelected(group.parent) ? '#007AFF' : '#E9ECEF'
                }}
              >
                <View
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: 8,
                    borderWidth: 2,
                    borderColor: isParentSelected(group.parent) ? '#007AFF' : '#DDDDDD',
                    backgroundColor: isParentSelected(group.parent) ? '#007AFF' : 'transparent',
                    marginRight: 10,
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {isParentSelected(group.parent) && (
                    <Text text80 color="#FFFFFF">✓</Text>
                  )}
                </View>
                <Text text80 color={isParentSelected(group.parent) ? '#1976D2' : '#666666'} style={{ fontWeight: '500' }}>
                  Todos
                </Text>
              </TouchableOpacity>

              {group.children.map((child) => (
                <TouchableOpacity
                  key={child.id}
                  onPress={() => handleCategoryPress(child)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: 10,
                    paddingHorizontal: 12,
                    backgroundColor: isCategorySelected(child) ? '#E3F2FD' : '#FFFFFF',
                    borderRadius: 6,
                    marginBottom: 4,
                    borderWidth: 1,
                    borderColor: isCategorySelected(child) ? '#007AFF' : '#DDDDDD'
                  }}
                >
                  <View
                    style={{
                      width: 16,
                      height: 16,
                      borderRadius: 8,
                      borderWidth: 2,
                      borderColor: isCategorySelected(child) ? '#007AFF' : '#DDDDDD',
                      backgroundColor: isCategorySelected(child) ? '#007AFF' : 'transparent',
                      marginRight: 10,
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {isCategorySelected(child) && (
                      <Text text80 color="#FFFFFF">✓</Text>
                    )}
                  </View>
                  <Text text80 color={isCategorySelected(child) ? '#1976D2' : '#333333'}>
                    {child.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      ))}
    </View>
  );
};
