import React from 'react';
import { NativeModules, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { IconButton } from 'react-native-paper';
import { orderTakerHeaderStyles } from '../../styles/OrderTakerHeader.styles';
import { FilterButtons } from '../FilterButtons';
import { MenuIcon, SearchIcon } from '../OrderTakerIcons';

export type OrderTakerHeaderProps = {
  onBackPress: () => void;
  onSearch: () => void;
  onMenu: () => void;
  onFilter: () => void;
  onRefresh: () => void;
  onSort: () => void;
  onShare: () => void;
  activeFiltersCount: number;
};

const styles = StyleSheet.create({
  title: {
    fontSize: 18,
    color: '#333333',
    textAlign: 'center'
  }
});

export const OrderTakerHeader: React.FC<OrderTakerHeaderProps> = ({
  onBackPress,
  onSearch,
  onMenu,
  onFilter,
  onRefresh,
  onSort,
  onShare,
  activeFiltersCount
}) => {
  const handleMenu = () => {
    const { MenuModule } = NativeModules;
    if (MenuModule) {
      MenuModule.openMainMenu();
    }
  };

  return (
    <View style={orderTakerHeaderStyles.container}>
      <View style={orderTakerHeaderStyles.topRow}>
        <View>
          <IconButton
            icon="arrow-left"
            size={24}
            onPress={onBackPress}
            iconColor="#333333"
          />
        </View>
        <View>
          <Text style={styles.title} numberOfLines={2}>
            Tomador de{'\n'}Pedido
          </Text>
        </View>
        <View style={orderTakerHeaderStyles.actionsContainer}>
          <TouchableOpacity
            onPress={onSearch}
            style={orderTakerHeaderStyles.actionButton}
          >
            <SearchIcon size={24} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleMenu}
            style={orderTakerHeaderStyles.actionButton}
          >
            <MenuIcon size={24} />
          </TouchableOpacity>
        </View>
      </View>
      
      <FilterButtons
        onFilter={onFilter}
        onRefresh={onRefresh}
        onSort={onSort}
        onShare={onShare}
        activeFiltersCount={activeFiltersCount}
      />
    </View>
  );
};
