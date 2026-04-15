import React from 'react';
import { View } from 'react-native';
import { MainLogo } from '../screens/LoginScreen/components/MainLogo';
import { loadingSpinnerStyles } from '../styles/LoadingSpinner.styles';

export const LoadingSpinner: React.FC = () => {
  return (
    <View style={loadingSpinnerStyles.container}>
      <MainLogo size={120} />
    </View>
  );
}; 