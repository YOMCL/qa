import { StyleSheet } from 'react-native';

export const orderSummaryStyles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginTop: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderDiscountButton: {
    borderWidth: 0,
    minHeight: 'auto',
  },
  shippingButton: {
    minHeight: 'auto',
  },
  finalizeButton: {
    width: '100%',
  },
  shareButton: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  clearCartButton: {
    alignItems: 'center',
    paddingVertical: 15,
    marginBottom: 12,
  },
}); 