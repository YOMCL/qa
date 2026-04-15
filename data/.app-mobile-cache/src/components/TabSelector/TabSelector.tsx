import React from 'react';
import { View } from 'react-native';
import { Button } from 'react-native-paper';
import { tabSelectorStyles } from '../../styles/TabSelector.styles';

export type TabSelectorProps = {
  activeTab: 'suggestions' | 'order';
  onTabChange: (tab: 'suggestions' | 'order') => void;
  cartProductsCount: number;
};

export const TabSelector: React.FC<TabSelectorProps> = ({
  activeTab,
  onTabChange,
  cartProductsCount
}) => {
  return (
    <View style={tabSelectorStyles.container}>
      <Button
        mode={activeTab === 'suggestions' ? 'contained' : 'outlined'}
        onPress={() => onTabChange('suggestions')}
        style={[
          tabSelectorStyles.tabButton,
          { flex: 1, marginRight: 12 }
        ]}
        contentStyle={{ paddingVertical: 8 }}
        labelStyle={{ color: activeTab === 'suggestions' ? '#FFFFFF' : '#333333' }}
        buttonColor={activeTab === 'suggestions' ? '#007AFF' : 'transparent'}
      >
        Sugerencias
      </Button>
      <Button
        mode={activeTab === 'order' ? 'contained' : 'outlined'}
        onPress={() => onTabChange('order')}
        style={[
          tabSelectorStyles.tabButton,
          { flex: 1, marginLeft: 12 }
        ]}
        contentStyle={{ paddingVertical: 8 }}
        labelStyle={{ color: activeTab === 'order' ? '#FFFFFF' : '#333333' }}
        buttonColor={activeTab === 'order' ? '#007AFF' : 'transparent'}
      >
        {`Mi pedido${cartProductsCount > 0 ? ` (${cartProductsCount})` : ''}`}
      </Button>
    </View>
  );
};
