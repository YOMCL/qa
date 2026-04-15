import React, { useEffect, useState } from 'react';
import {
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    TouchableOpacity,
    View
} from 'react-native';
import { Button, Text } from 'react-native-paper';
import type { SellerDiscount, SellerDiscountDialogProps } from '../../types/seller-discount.types';
import { sellerDiscountDialogStyles as styles } from './SellerDiscountDialog.styles';

export type SellerDiscountDialogComponentProps = SellerDiscountDialogProps & {
  disableManualDiscount?: boolean;
};

export const SellerDiscountDialog: React.FC<SellerDiscountDialogComponentProps> = ({
  visible,
  product,
  currentDiscount = 0,
  discountLimit,
  discountTypes = [],
  currentDiscountType,
  onClose,
  onApplyDiscount,
  onRemoveDiscount,
  disableManualDiscount = false,
}) => {
  const [discountValue, setDiscountValue] = useState<string>(
    currentDiscount > 0 ? currentDiscount.toString() : ''
  );
  const [selectedDiscountType, setSelectedDiscountType] = useState<string | undefined>(
    currentDiscountType
  );
  const [showTypeSelector, setShowTypeSelector] = useState(false);

  useEffect(() => {
    if (visible) {
      setDiscountValue(currentDiscount > 0 ? currentDiscount.toString() : '');
      setSelectedDiscountType(currentDiscountType);
    }
  }, [visible, currentDiscount, currentDiscountType]);

  const hasChanged = () => {
    const currentValueNum = currentDiscount;
    const newValueNum = parseFloat(discountValue) || 0;
    
    if (currentValueNum !== newValueNum) return true;
    if (selectedDiscountType !== currentDiscountType) return true;
    
    return false;
  };

  const calculateDiscountedPrice = () => {
    const discount = parseFloat(discountValue) || 0;
    return product.price * (1 - discount);
  };

  const formatPrice = (price: number) => {
    return `$${Math.round(price).toLocaleString()}`;
  };

  const handleApplyDiscount = () => {
    const discount = parseFloat(discountValue) || 0;
    
    if (discount < 0) {
      alert('No se puede ingresar un descuento de valor menor a 0');
      return;
    }

    if (discountLimit && discount > discountLimit) {
      alert(`El descuento no puede exceder el ${(discountLimit * 100).toFixed(2)}%`);
      return;
    }

    const sellerDiscount: SellerDiscount = {
      mode: {
        type: 'product',
        productId: product.id,
      },
      discount: {
        value: discount.toString(),
        type: 'percentage',
        classification: selectedDiscountType,
      },
    };

    onApplyDiscount(sellerDiscount);
    onClose();
  };

  const handleRemoveDiscount = () => {
    onRemoveDiscount();
    onClose();
  };

  const handlePredefinedDiscount = (discount: number) => {
    const sellerDiscount: SellerDiscount = {
      mode: {
        type: 'product',
        productId: product.id,
      },
      discount: {
        value: discount.toString(),
        type: 'percentage',
        classification: selectedDiscountType,
      },
    };

    onApplyDiscount(sellerDiscount);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={onClose}
        >
          <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalContent}>
              <ScrollView showsVerticalScrollIndicator={false}>
                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                  <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>

                {product.discountList && product.discountList.length > 0 && (
                  <View style={styles.predefinedContainer}>
                    <Text style={styles.predefinedTitle}>Descuentos sugeridos:</Text>
                    <View style={styles.predefinedButtons}>
                      {product.discountList.map((discount, index) => (
                        <TouchableOpacity
                          key={index}
                          style={[
                            styles.predefinedButton,
                            discountValue === discount.toString() && styles.predefinedButtonActive,
                          ]}
                          onPress={() => handlePredefinedDiscount(discount)}
                        >
                          <Text
                            style={[
                              styles.predefinedButtonText,
                              discountValue === discount.toString() && styles.predefinedButtonTextActive,
                            ]}
                          >
                            {(discount * 100).toFixed(2)}%
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}

                {discountTypes.length > 0 && (
                  <View style={styles.discountTypeContainer}>
                    <TouchableOpacity
                      style={styles.discountTypeSelector}
                      onPress={() => setShowTypeSelector(!showTypeSelector)}
                    >
                      <Text style={styles.discountTypeLabel}>
                        {selectedDiscountType || 'Tipo de descuento'}
                      </Text>
                      <Text style={styles.discountTypeArrow}>▼</Text>
                    </TouchableOpacity>

                    {showTypeSelector && (
                      <View style={styles.discountTypeList}>
                        {discountTypes.map((type, index) => (
                          <TouchableOpacity
                            key={index}
                            style={styles.discountTypeItem}
                            onPress={() => {
                              setSelectedDiscountType(type);
                              setShowTypeSelector(false);
                            }}
                          >
                            <Text style={styles.discountTypeItemText}>{type}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </View>
                )}

                <View style={styles.buttonContainer}>
                  <Button
                    mode="contained"
                    onPress={handleApplyDiscount}
                    disabled={!hasChanged()}
                    style={[styles.button, styles.applyButton]}
                    labelStyle={styles.buttonLabel}
                  >
                    Aplicar descuento
                  </Button>

                  {currentDiscount > 0 && (
                    <Button
                      mode="outlined"
                      onPress={handleRemoveDiscount}
                      style={[styles.button, styles.removeButton]}
                      labelStyle={styles.removeButtonLabel}
                    >
                      Quitar descuento
                    </Button>
                  )}
                </View>
              </ScrollView>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </Modal>
  );
};

