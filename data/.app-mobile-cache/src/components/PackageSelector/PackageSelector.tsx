import React, { useState } from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';
import { PackagingOption } from '../../types/product.types';

export type PackageSelectorProps = {
  unitSales?: string[];
  selectedUnitIndex?: number;
  onUnitChange?: (unitIndex: number) => void;
  
  packagingOptions?: PackagingOption[];
  selectedPackagingKey?: string;
  onPackagingChange?: (packagingKey: string) => void;
  
  disabled?: boolean;
};

export const PackageSelector: React.FC<PackageSelectorProps> = ({
  unitSales,
  selectedUnitIndex = 0,
  onUnitChange,
  packagingOptions,
  selectedPackagingKey = 'unit',
  onPackagingChange,
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentKey, setCurrentKey] = useState(selectedPackagingKey);
  
  React.useEffect(() => {
    setCurrentKey(selectedPackagingKey);
  }, [selectedPackagingKey]);
  
  const useNewPackagingSystem = packagingOptions && packagingOptions.length > 0;
  const useOldUnitSystem = unitSales && unitSales.length > 1;

  if (!useNewPackagingSystem && !useOldUnitSystem) {
    return null;
  }

  const handleSelection = (index: number) => {
    if (useNewPackagingSystem && onPackagingChange) {
      const selectedOption = packagingOptions![index];
      onPackagingChange(selectedOption.key);
    } else if (useOldUnitSystem && onUnitChange) {
      onUnitChange(index);
    }
    setIsOpen(false);
  };

  const getOptions = () => {
    if (useNewPackagingSystem) {
      return packagingOptions!.map(option => option.displayName);
    } else {
      return unitSales!;
    }
  };

  const getSelectedIndex = () => {
    if (useNewPackagingSystem) {
      return packagingOptions!.findIndex(option => option.key === currentKey);
    } else {
      return selectedUnitIndex!;
    }
  };

  const options = getOptions();
  const selectedIndex = getSelectedIndex();

  return (
    <View style={{ position: 'relative', zIndex: 1 }}>
      <TouchableOpacity
        onPress={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        style={{
          backgroundColor: '#F5F5F5',
          paddingHorizontal: 12,
          paddingVertical: 8,
          borderRadius: 8,
          minWidth: 60,
          opacity: disabled ? 0.5 : 1
        }}
      >
        <Text style={{ fontSize: 14, color: '#333333', textAlign: 'center' }}>
          {options[selectedIndex]} ▼
        </Text>
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.3)',
            justifyContent: 'center',
            alignItems: 'center'
          }}
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
        >
          <View
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 8,
              borderWidth: 1,
              borderColor: '#E0E0E0',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 10,
              minWidth: 200,
              maxWidth: 300,
              overflow: 'hidden'
            }}
            onStartShouldSetResponder={() => true}
          >
            {options.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleSelection(index)}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 16,
                    borderBottomWidth: index < options.length - 1 ? 1 : 0,
                    borderBottomColor: '#E0E0E0',
                    backgroundColor: index === selectedIndex ? '#F0F8FF' : '#FFFFFF',
                    minHeight: 50,
                    justifyContent: 'center'
                  }}
                >
                  <Text 
                    style={{ 
                      fontSize: 14,
                      color: index === selectedIndex ? '#007AFF' : '#333333',
                      fontWeight: index === selectedIndex ? 'bold' : 'normal',
                      textAlign: 'center'
                    }}
                  >
                    {option}
                  </Text>
                </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};
