import { StyleSheet } from 'react-native';

export const searchBarStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#333333',
  },
  clearButton: {
    padding: 4,
  },
  closeButton: {
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  contentContainer: {
    flex: 1,
  },
  lastSearchesContainer: {
    paddingHorizontal: 20,
  },
  lastSearchesTitle: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 12,
  },
  lastSearchItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  lastSearchText: {
    fontSize: 14,
    color: '#333333',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#666666',
    marginTop: 16,
  },
  resultsContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  resultsCount: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 16,
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: 16,
    color: '#999999',
  },
});
