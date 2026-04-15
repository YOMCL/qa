import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Keyboard } from 'react-native';
import { AuthService } from '../services/AuthService';

export const useAuth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotMessage, setShowForgotMessage] = useState(false);
  const [forgotSeconds, setForgotSeconds] = useState(0);
  
  const forgotIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const authServiceRef = useRef<AuthService>(new AuthService());

  useEffect(() => {
    return () => {
      if (forgotIntervalRef.current) {
        clearInterval(forgotIntervalRef.current);
      }
    };
  }, []);

  const startForgotCountdown = useCallback(() => {
    setShowForgotMessage(true);
    setForgotSeconds(60);
    if (forgotIntervalRef.current) {
      clearInterval(forgotIntervalRef.current);
    }
    forgotIntervalRef.current = setInterval(() => {
      setForgotSeconds((prev) => {
        if (prev <= 1) {
          if (forgotIntervalRef.current) {
            clearInterval(forgotIntervalRef.current);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const handleLogin = useCallback(async (onLogin?: (email: string, password: string) => void) => {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    try {
      const { accessToken, refreshToken } = await authServiceRef.current.login(email, password);
      
      await authServiceRef.current.persistSession(accessToken, refreshToken, email);
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      if (onLogin) {
        onLogin(email, password);
      }

      await authServiceRef.current.openMainWithSession(accessToken, refreshToken, email);
    } catch (error: any) {
      console.error('Login error:', error);
      Alert.alert('Error', error.message || 'No se pudo iniciar sesión');
    }
  }, [email, password]);

  const handleForgotPassword = useCallback(async () => {
    const trimmedEmail = email.trim();
    if (!authServiceRef.current.validateEmail(trimmedEmail)) {
      Alert.alert('Recuperar contraseña', 'Por favor ingresa un correo válido');
      return;
    }

    try {
      Keyboard.dismiss();
      const success = await authServiceRef.current.forgotPassword(trimmedEmail);
      
      if (success) {
        startForgotCountdown();
      } else {
        Alert.alert('Error', 'No se pudo enviar el email de recuperación');
      }
    } catch (error: any) {
      if (error.message === 'No pudimos enviar el email de recuperación.') {
        Alert.alert('Recuperar contraseña', error.message);
      } else {
        Alert.alert('Error', 'Error de conexión');
      }
    }
  }, [email, startForgotCountdown]);

  const resetForgotMessage = useCallback(() => {
    setShowForgotMessage(false);
    setForgotSeconds(0);
  }, []);

  return {
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    showForgotMessage,
    forgotSeconds,
    handleLogin,
    handleForgotPassword,
    resetForgotMessage,
  };
}; 