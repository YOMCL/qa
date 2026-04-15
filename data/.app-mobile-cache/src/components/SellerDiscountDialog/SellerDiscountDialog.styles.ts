import { StyleSheet } from 'react-native';

export const sellerDiscountDialogStyles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    width: '90%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 8,
    marginBottom: 8,
  },
  closeButtonText: {
    fontSize: 24,
    color: '#666666',
  },
  productImage: {
    width: 120,
    height: 120,
    alignSelf: 'center',
    marginBottom: 16,
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 8,
  },
  productBrand: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 8,
  },
  packagingText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 16,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 14,
    color: '#666666',
    marginRight: 8,
  },
  priceValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
  },
  discountedPriceContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
  },
  discountedPriceLabel: {
    fontSize: 14,
    color: '#1976D2',
    marginRight: 8,
  },
  discountedPriceValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1976D2',
    marginRight: 8,
  },
  discountPercentage: {
    fontSize: 14,
    color: '#1976D2',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 12,
    marginTop: 8,
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#FFFFFF',
  },
  limitContainer: {
    padding: 12,
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
    marginBottom: 16,
  },
  limitText: {
    fontSize: 14,
    color: '#E65100',
    textAlign: 'center',
  },
  predefinedContainer: {
    marginBottom: 16,
  },
  predefinedTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  predefinedButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  predefinedButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#2196F3',
    backgroundColor: '#FFFFFF',
  },
  predefinedButtonActive: {
    backgroundColor: '#2196F3',
  },
  predefinedButtonText: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '600',
  },
  predefinedButtonTextActive: {
    color: '#FFFFFF',
  },
  discountTypeContainer: {
    marginBottom: 16,
  },
  discountTypeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  discountTypeLabel: {
    fontSize: 14,
    color: '#000000',
  },
  discountTypeArrow: {
    fontSize: 12,
    color: '#666666',
  },
  discountTypeList: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  discountTypeItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  discountTypeItemText: {
    fontSize: 14,
    color: '#000000',
  },
  buttonContainer: {
    marginTop: 16,
    gap: 12,
  },
  button: {
    borderRadius: 8,
  },
  applyButton: {
    backgroundColor: '#2196F3',
  },
  removeButton: {
    borderColor: '#F44336',
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  removeButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F44336',
  },
});

