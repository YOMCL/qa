import { useCallback, useRef } from 'react';
import { Alert } from 'react-native';
import { authorize, AuthorizeResult } from 'react-native-app-auth';
import { ADMIN_ORIGIN, API_BASE_URL, MICROSOFT_CLIENT_ID, MICROSOFT_REDIRECT_URI } from '../constants/api';
import { AuthService } from '../services/AuthService';

const MICROSOFT_CONFIG = {
  serviceConfiguration: {
    authorizationEndpoint: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
    tokenEndpoint: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
  },
  clientId: MICROSOFT_CLIENT_ID,
  redirectUrl: MICROSOFT_REDIRECT_URI,
  scopes: ['User.Read'],
};

export type MicrosoftAuthProps = {
  onLogin?: (email: string) => void;
};

export const useMicrosoftAuth = () => {
  const authServiceRef = useRef<AuthService>(new AuthService());

  const handleMicrosoftLogin = useCallback(async (onLogin?: (email: string) => void) => {
    try {
      const authResult: AuthorizeResult = await authorize(MICROSOFT_CONFIG);
      
      if (!authResult.accessToken) {
        throw new Error('No se pudo obtener el token de Microsoft');
      }

      const yomApiUrl = `${API_BASE_URL}/auth/microsoft`;
      const response = await fetch(yomApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Origin: ADMIN_ORIGIN,
        },
        body: JSON.stringify({ accessToken: authResult.accessToken }),
      });


      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Usuario no registrado en YOM. Contacta al administrador.');
        }
        throw new Error('Error del servidor. Intenta nuevamente.');
      }

      const data = await response.json();
      const yomAccessToken = data.accessToken || data.jwt || data.token;
      const yomRefreshToken = data.refreshToken;
      const userEmail = data.email || data.user?.email || authResult.tokenAdditionalParameters?.email || 'usuario@microsoft.com';

      if (!yomAccessToken || !yomRefreshToken) {
        throw new Error('Respuesta inválida del servidor');
      }

      await authServiceRef.current.persistSession(yomAccessToken, yomRefreshToken, userEmail);
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      await authServiceRef.current.openMainWithSession(yomAccessToken, yomRefreshToken, userEmail);

      if (onLogin) {
        onLogin(userEmail);
      }

      Alert.alert('Éxito', 'Inicio de sesión exitoso');
    } catch (error: any) {
      console.error('Microsoft login error:', error);
      Alert.alert('Error', error.message || 'No se pudo iniciar sesión con Microsoft');
    }
  }, []);

  return {
    handleMicrosoftLogin,
  };
}; 