import { StyleSheet } from 'react-native';

export const orderTakerScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    fontSize: 14,
    color: '#333333',
    marginTop: 16,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 80,
  },
  productsLoadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productsLoadingText: {
    fontSize: 14,
    color: '#666666',
    marginTop: 16,
  },
  noProductsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noProductsText: {
    fontSize: 16,
    color: '#999999',
  },
});
