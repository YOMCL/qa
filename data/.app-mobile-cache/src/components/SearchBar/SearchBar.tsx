import React, { useEffect, useRef } from 'react';
import { ActivityIndicator, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { searchBarStyles } from '../../styles/SearchBar.styles';
import { SuggestionsTab } from '../SuggestionsTab';

// Inline icon components to avoid import issues
const SearchIcon = ({ size = 20, color = "#666666" }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const CloseIcon = ({ size = 24, color = "#333333" }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M18 6L6 18M6 6L18 18"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const ClearIcon = ({ size = 16, color = "#666666" }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM17 15.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"
      fill={color}
    />
  </Svg>
);

export type SearchBarProps = {
  searchQuery: string;
  onSearchTextChange: (text: string) => void;
  onSearchSubmit: () => void;
  onClearSearch: () => void;
  onCloseSearch: () => void;
  lastSearches: string[];
  onLastSearchSelect: (searchTerm: string) => void;
  isSearching: boolean;
  searchResults: any[];
  onAddProduct: (productId: string) => Promise<void>;
  onIncrementProduct: (productId: string) => Promise<void>;
  onDecrementProduct: (productId: string) => Promise<void>;
  onUpdateQuantity: (productId: string, quantity: number) => Promise<void>;
  onPackagingChange: (productId: string, packagingKey: string) => Promise<void>;
  cartProducts: { id: string; quantity: number }[];
  onSellerDiscountPress?: (product: any) => void;
};

export const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  onSearchTextChange,
  onSearchSubmit,
  onClearSearch,
  onCloseSearch,
  lastSearches,
  onLastSearchSelect,
  isSearching,
  searchResults,
  onAddProduct,
  onIncrementProduct,
  onDecrementProduct,
  onUpdateQuantity,
  onPackagingChange,
  cartProducts,
  onSellerDiscountPress,
}) => {
  const searchInputRef = useRef<TextInput>(null);

  useEffect(() => {
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 100);
  }, []);

  const renderLastSearches = () => (
    <View style={searchBarStyles.lastSearchesContainer}>
      <Text style={searchBarStyles.lastSearchesTitle}>
        Búsquedas recientes
      </Text>
      {lastSearches.map((search, index) => (
        <TouchableOpacity
          key={index}
          onPress={() => onLastSearchSelect(search)}
          style={searchBarStyles.lastSearchItem}
        >
          <Text style={searchBarStyles.lastSearchText}>{search}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <View style={searchBarStyles.container}>
      <View style={searchBarStyles.searchInputContainer}>
        <View style={searchBarStyles.searchInputWrapper}>
          <SearchIcon size={20} color="#666666" />
          <TextInput
            ref={searchInputRef}
            value={searchQuery}
            onChangeText={onSearchTextChange}
            onSubmitEditing={onSearchSubmit}
            placeholder="Buscar productos..."
            placeholderTextColor="#999999"
            style={searchBarStyles.searchInput}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={onClearSearch}
              style={searchBarStyles.clearButton}
            >
              <ClearIcon size={16} color="#666666" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          onPress={onCloseSearch}
          style={searchBarStyles.closeButton}
        >
          <CloseIcon size={24} />
        </TouchableOpacity>
      </View>
      
      <View style={searchBarStyles.contentContainer}>
        {searchQuery.length < 2 && lastSearches.length > 0 
          ? renderLastSearches() 
          : (() => {
              if (isSearching) {
                return (
                  <View style={searchBarStyles.loadingContainer}>
                    <ActivityIndicator size="large" color="#007AFF" />
                    <Text style={searchBarStyles.loadingText}>
                      Buscando productos...
                    </Text>
                  </View>
                );
              }

              if (searchResults.length > 0) {
                return (
                  <View style={searchBarStyles.resultsContainer}>
                    <SuggestionsTab 
                      products={searchResults}
                      cartProducts={cartProducts}
                      onAddProduct={onAddProduct}
                      onIncrementProduct={onIncrementProduct}
                      onDecrementProduct={onDecrementProduct}
                      onUpdateQuantity={onUpdateQuantity}
                      onPackagingChange={onPackagingChange}
                      onSellerDiscountPress={onSellerDiscountPress}
                    />
                  </View>
                );
              }

              if (searchQuery.length >= 2) {
                return (
                  <View style={searchBarStyles.noResultsContainer}>
                    <Text style={searchBarStyles.noResultsText}>
                      No se encontraron productos
                    </Text>
                  </View>
                );
              }

              return null;
            })()
        }
      </View>
    </View>
  );
};

export default SearchBar;
