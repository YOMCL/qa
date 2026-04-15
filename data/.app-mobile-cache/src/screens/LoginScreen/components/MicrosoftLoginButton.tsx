import React from 'react';
import { Button } from 'react-native-paper';
import { useMicrosoftAuth } from '../../../hooks/useMicrosoftAuth';
import { microsoftButton } from '../styles/microsoftButton';

export type MicrosoftLoginButtonProps = {
  onLogin?: (email: string) => void;
};

export const MicrosoftLoginButton: React.FC<MicrosoftLoginButtonProps> = ({ onLogin }) => {
  const { handleMicrosoftLogin } = useMicrosoftAuth();

  const onPress = async () => {
    await handleMicrosoftLogin(onLogin);
  };

  return (
    <Button 
      mode="text"
      onPress={onPress}
      style={microsoftButton.button}
      labelStyle={microsoftButton.label}
    >
      Inicio Sesión Empresa
    </Button>
  );
}; 