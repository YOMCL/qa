import React from 'react';
import { Text, View } from 'react-native';
import { Button } from 'react-native-paper';
import { AuthService } from '../../services/AuthService';
import { container } from './styles/container';
import { logoutButton } from './styles/logoutButton';
import { title } from './styles/title';

export type LoggedInScreenProps = Record<string, never>;

export const LoggedInScreen: React.FC<LoggedInScreenProps> = () => {
  const authService = new AuthService();

  const handleLogout = async () => {
    await authService.clearSession();
  };

  return (
    <View style={container.container}>
      <Text style={title.title}>Estás logeado</Text>
      <Button mode="contained" style={logoutButton.logoutButton} onPress={handleLogout}>
        Cerrar sesión
      </Button>
    </View>
  );
}; 