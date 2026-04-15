import React, { useEffect, useState } from 'react';
import { LoginScreen } from '../screens/LoginScreen';
import { AuthService } from '../services/AuthService';
import { LoadingSpinner } from './LoadingSpinner';

export const AuthGuard: React.FC = () => {
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [hasValidSession, setHasValidSession] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const authService = new AuthService();
        
        const hasSession = await authService.hasActiveSession();
        if (hasSession) {
          const session = await authService.getCurrentSession();
          if (session) {
            await authService.openMainWithSession(
              session.accessToken,
              session.refreshToken,
              session.email
            );
            setHasValidSession(true);
            return;
          }
        }
        
        setIsCheckingSession(false);
      } catch (error) {
        console.error('Error checking session:', error);
        setIsCheckingSession(false);
      }
    };

    checkSession();
  }, []);

  if (isCheckingSession) {
    return <LoadingSpinner />;
  }

  if (hasValidSession) {
    return null;
  }

  return <LoginScreen />;
}; 