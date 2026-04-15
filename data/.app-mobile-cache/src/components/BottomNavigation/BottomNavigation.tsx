import React from 'react';
import { NativeModules, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { bottomNavigationStyles } from './styles';

const { MenuModule } = NativeModules;

// Icono de comercios (tienda/edificio)
const CommerceIcon = ({ size = 24, color = "#333333" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2L2 7L12 12L22 7L12 2Z"
      fill={color}
    />
    <Path
      d="M2 17L12 22L22 17"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M2 12L12 17L22 12"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Icono de pedidos (carrito de compras)
const OrderIcon = ({ size = 24, color = "#333333" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M7 18C5.9 18 5.01 18.9 5.01 20S5.9 22 7 22 9 21.1 9 20 8.1 18 7 18ZM1 2V4H3L6.6 11.59L5.25 14.04C5.09 14.32 5 14.65 5 15C5 16.1 5.9 17 7 17H19V15H7.42C7.28 15 7.17 14.89 7.17 14.75L7.2 14.63L8.1 13H15.55C16.3 13 16.96 12.59 17.3 11.97L20.88 5H5.21L4.27 3H1V2ZM17 18C15.9 18 15.01 18.9 15.01 20S15.9 22 17 22 19 21.1 19 20 18.1 18 17 18Z"
      fill={color}
    />
  </Svg>
);

// Icono de cobranza (tarjeta de crédito)
const PaymentIcon = ({ size = 24, color = "#333333" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M20 4H4C2.89 4 2.01 4.89 2.01 6L2 18C2 19.11 2.89 20 4 20H20C21.11 20 22 19.11 22 18V6C22 4.89 21.11 4 20 4ZM20 18H4V12H20V18ZM20 8H4V6H20V8Z"
      fill={color}
    />
  </Svg>
);

export type BottomNavigationProps = Record<string, never>;

const BottomNavigation: React.FC<BottomNavigationProps> = () => {
  const handleNavigateToCommerces = () => {
    if (MenuModule) {
      MenuModule.navigateToCommerceList();
    } else {
      console.log('MenuModule no disponible');
    }
  };

  const handleNavigateToOrders = () => {
    if (MenuModule) {
      MenuModule.navigateToOrderList();
    } else {
      console.log('MenuModule no disponible');
    }
  };

  const handleNavigateToPayments = () => {
    if (MenuModule) {
      MenuModule.navigateToCollectionPayments();
    } else {
      console.log('MenuModule no disponible');
    }
  };

  return (
    <View style={bottomNavigationStyles.container}>
      <TouchableOpacity
        style={bottomNavigationStyles.button}
        onPress={handleNavigateToCommerces}
      >
        <CommerceIcon size={20} color="#007AFF" />
        <Text style={bottomNavigationStyles.buttonText}>COMERCIOS</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={bottomNavigationStyles.button}
        onPress={handleNavigateToOrders}
      >
        <OrderIcon size={20} color="#007AFF" />
        <Text style={bottomNavigationStyles.buttonText}>PEDIDOS</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={bottomNavigationStyles.button}
        onPress={handleNavigateToPayments}
      >
        <PaymentIcon size={20} color="#007AFF" />
        <Text style={bottomNavigationStyles.buttonText}>COBRANZA</Text>
      </TouchableOpacity>
    </View>
  );
};

export default BottomNavigation; 