import React from 'react';
import { FlatList, Modal, Text, TouchableOpacity, View } from 'react-native';
import { IconButton } from 'react-native-paper';
import { SORT_OPTIONS, SortOption, SortOptionConfig } from '../../types/sorting.types';

export type SortDialogProps = {
  visible: boolean;
  onClose: () => void;
  onSelectSort: (sortOption: SortOption) => void;
  currentSort?: SortOption;
};

const SortDialog: React.FC<SortDialogProps> = ({
  visible,
  onClose,
  onSelectSort,
  currentSort = 'shoppingList'
}) => {
  const handleSelectSort = (sortOption: SortOption) => {
    onSelectSort(sortOption);
    onClose();
  };

  const renderSortOption = ({ item }: { item: SortOptionConfig }) => {
    const isSelected = item.value === currentSort;
    
    return (
      <TouchableOpacity
        onPress={() => handleSelectSort(item.value)}
        style={{
          paddingVertical: 16,
          paddingHorizontal: 20,
          borderBottomWidth: 1,
          borderBottomColor: '#F0F0F0',
          backgroundColor: isSelected ? '#F8F9FF' : 'transparent',
          flexDirection: 'row',
          alignItems: 'center'
        }}
      >
        <Text 
          style={{ 
            color: isSelected ? '#007AFF' : '#333333',
            fontWeight: isSelected ? '600' : '400',
            fontSize: 14
          }}
        >
          {item.label}
        </Text>
        {isSelected && (
          <Text style={{ marginLeft: 12, color: '#007AFF', fontSize: 14 }}>✓</Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
        <View 
          style={{ 
            backgroundColor: '#FFFFFF',
            marginHorizontal: 20,
            maxHeight: '70%',
            width: '90%',
            borderRadius: 12
          }}
        >
          <View style={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={{ color: '#333333', fontWeight: '600', fontSize: 18 }}>
                Ordenar productos
              </Text>
              <IconButton
                icon="close"
                size={20}
                onPress={onClose}
                iconColor="#666666"
              />
            </View>
          </View>
          
          <FlatList
            data={SORT_OPTIONS}
            keyExtractor={(item) => item.value}
            renderItem={renderSortOption}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </View>
    </Modal>
  );
};

export default SortDialog;
