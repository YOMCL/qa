import { NativeModules } from 'react-native';
import { ADMIN_ORIGIN, API_BASE_URL } from '../constants/api';
import { AuthSession } from '../models/AuthSession';

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
}

export interface MicrosoftLoginResponse {
  accessToken: string;
  refreshToken: string;
  email?: string;
}

export class AuthService {
  private get sessionBridge() {
    const { SessionBridge } = NativeModules as any;
    return SessionBridge;
  }

  async login(email: string, password: string): Promise<LoginResponse> {
    const url = `${API_BASE_URL}/auth/local`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Origin: ADMIN_ORIGIN,
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Credenciales incorrectas. Por favor verifica tu correo y contraseña.');
      }
      
      throw new Error('Error en autenticación. Por favor intenta nuevamente.');
    }

    const data = await response.json();
    const accessToken: string | undefined = data.accessToken || data.jwt || data.token;
    const refreshToken: string | undefined = data.refreshToken;

    if (!accessToken || !refreshToken) {
      throw new Error('Respuesta inválida del servidor: tokens ausentes');
    }

    return { accessToken, refreshToken };
  }

  async loginWithMicrosoft(accessToken: string): Promise<MicrosoftLoginResponse> {
    const url = `${API_BASE_URL}/auth/microsoft`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Origin: ADMIN_ORIGIN,
      },
      body: JSON.stringify({ accessToken }),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Token de Microsoft inválido. Por favor intenta nuevamente.');
      }
      
      throw new Error('Error en autenticación con Microsoft. Por favor intenta nuevamente.');
    }

    const data = await response.json();
    const yomAccessToken: string | undefined = data.accessToken || data.jwt || data.token;
    const yomRefreshToken: string | undefined = data.refreshToken;
    const email: string | undefined = data.email || data.user?.email;

    if (!yomAccessToken || !yomRefreshToken) {
      throw new Error('Respuesta inválida del servidor: tokens ausentes');
    }

    return { 
      accessToken: yomAccessToken, 
      refreshToken: yomRefreshToken,
      email 
    };
  }

  async persistSession(accessToken: string, refreshToken: string, email: string): Promise<void> {
    try {
      if (this.sessionBridge && typeof this.sessionBridge.saveSession === 'function') {
        await this.sessionBridge.saveSession(accessToken, refreshToken, email);
      }
    } catch (error) {
      console.error('Error persisting session:', error);
      throw error;
    }
  }

  async openMainWithSession(accessToken: string, refreshToken: string, email: string): Promise<void> {
    try {
      if (this.sessionBridge && typeof this.sessionBridge.openMainWithSession === 'function') {
        await this.sessionBridge.openMainWithSession(accessToken, refreshToken, email);
      }
    } catch (error) {
      console.error('Error opening main with session:', error);
      throw error;
    }
  }

  async forgotPassword(email: string): Promise<boolean> {
    const url = `${API_BASE_URL}/users/forgot-password`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Origin: ADMIN_ORIGIN,
      },
      body: JSON.stringify({ mobile: true, email }),
    });

    if (!response.ok) {
      try {
        const err = await response.json();
        if (err && typeof err.errorCode === 'string') {
          const codePrefix = err.errorCode.substring(0, 3);
          if (codePrefix === 'kz5') {
            throw new Error('No pudimos enviar el email de recuperación.');
          }
        }
      } catch {}
      return false;
    }

    return true;
  }

  validateEmail(email: string): boolean {
    const trimmedEmail = email.trim();
    return trimmedEmail.includes('@') && trimmedEmail.includes('.');
  }

  async hasActiveSession(): Promise<boolean> {
    try {
      if (this.sessionBridge && typeof this.sessionBridge.hasValidTokens === 'function') {
        const hasValidTokens = await this.sessionBridge.hasValidTokens();
        return hasValidTokens;
      }
      return false;
    } catch (error) {
      console.error('Error checking active session:', error);
      return false;
    }
  }

  async getCurrentSession(): Promise<AuthSession | null> {
    try {
      if (this.sessionBridge && typeof this.sessionBridge.getSession === 'function') {
        const session = await this.sessionBridge.getSession();
        if (session && session.accessToken && session.refreshToken && session.email) {
          return {
            accessToken: session.accessToken,
            refreshToken: session.refreshToken,
            email: session.email,
          } as AuthSession;
        }
      }
      return null;
    } catch (error) {
      console.error('Error getting current session:', error);
      return null;
    }
  }

  async clearSession(): Promise<void> {
    try {
      if (this.sessionBridge && typeof this.sessionBridge.handleLogout === 'function') {
        await this.sessionBridge.handleLogout();
      }
    } catch (error) {
      console.error('Error clearing session:', error);
      throw error;
    }
  }

  async clearAllRealmData(): Promise<void> {
    try {
      if (this.sessionBridge && typeof this.sessionBridge.clearAllRealmData === 'function') {
        await this.sessionBridge.clearAllRealmData();
      }
    } catch (error) {
      console.error('Error clearing all realm data:', error);
      throw error;
    }
  }

  async request(method: string, path: string, body?: any): Promise<{ status: number; data: any }> {
    try {
      const { ApiClientModule } = NativeModules as any;
      
      if (!ApiClientModule) {
        throw new Error('ApiClientModule not available');
      }

      const response = await ApiClientModule.request(method, path, body || null);
      
      let parsedData;
      try {
        parsedData = JSON.parse(response.data);
      } catch (e) {
        parsedData = response.data;
      }

      return {
        status: response.status,
        data: parsedData,
      };
    } catch (error) {
      console.error('Error en request:', error);
      throw error;
    }
  }

} 