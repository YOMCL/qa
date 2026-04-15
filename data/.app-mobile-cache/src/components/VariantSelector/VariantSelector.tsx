import React, { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

export type VariantSelectorProps = {
  variantFeatures: {
    name: string;
    values: string[];
  }[];
  selectedVariants: string[];
  onVariantChange: (variants: string[]) => void;
  disabled?: boolean;
};

export const VariantSelector: React.FC<VariantSelectorProps> = ({
  variantFeatures,
  selectedVariants,
  onVariantChange,
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleVariantSelect = (featureIndex: number, valueIndex: number) => {
    const newVariants = [...selectedVariants];
    newVariants[featureIndex] = variantFeatures[featureIndex].values[valueIndex];
    onVariantChange(newVariants);
  };

  const getSelectedVariantText = () => {
    if (selectedVariants.length === 0) return 'Seleccionar variante';
    return selectedVariants.join(' - ');
  };

  if (!variantFeatures || variantFeatures.length === 0) {
    return null;
  }

  return (
    <View>
      <TouchableOpacity
        onPress={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        style={{
          backgroundColor: '#F5F5F5',
          paddingHorizontal: 12,
          paddingVertical: 8,
          borderRadius: 8,
          minWidth: 120,
          opacity: disabled ? 0.5 : 1
        }}
      >
        <Text style={{ color: '#333333', textAlign: 'center', fontSize: 14 }} numberOfLines={1}>
          {getSelectedVariantText()} ▼
        </Text>
      </TouchableOpacity>

      {isOpen && (
        <View
          style={{
            position: 'absolute',
            top: 40,
            left: 0,
            right: 0,
            backgroundColor: '#FFFFFF',
            borderRadius: 8,
            borderWidth: 1,
            borderColor: '#E0E0E0',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
            zIndex: 1000,
            maxHeight: 200
          }}
        >
          {variantFeatures.map((feature, featureIndex) => (
            <View key={featureIndex}>
              <View
                style={{
                  backgroundColor: '#F8F9FA',
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderBottomWidth: 1,
                  borderBottomColor: '#E0E0E0'
                }}
              >
                <Text style={{ color: '#666666', fontWeight: 'bold', fontSize: 13 }}>
                  {feature.name}:
                </Text>
              </View>
              {feature.values.map((value, valueIndex) => (
                <TouchableOpacity
                  key={valueIndex}
                  onPress={() => handleVariantSelect(featureIndex, valueIndex)}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    borderBottomWidth: featureIndex === variantFeatures.length - 1 && valueIndex === feature.values.length - 1 ? 0 : 1,
                    borderBottomColor: '#E0E0E0',
                    backgroundColor: selectedVariants[featureIndex] === value ? '#F0F8FF' : 'transparent'
                  }}
                >
                  <Text 
                    style={{ 
                      color: selectedVariants[featureIndex] === value ? '#007AFF' : '#333333',
                      fontWeight: selectedVariants[featureIndex] === value ? 'bold' : 'normal',
                      fontSize: 14
                    }}
                  >
                    {value}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </View>
      )}
    </View>
  );
};
