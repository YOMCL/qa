import React, { useEffect } from 'react';
import { NativeModules } from 'react-native';
import { AuthService } from '../services/AuthService';

type SessionCheckerProps = {
  children: React.ReactNode;
  onSessionFound: () => void;
  onSessionNotFound: () => void;
};

export const SessionChecker: React.FC<SessionCheckerProps> = ({ children, onSessionFound, onSessionNotFound }) => {
  useEffect(() => {
    const checkSession = async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      try {
        const authService = new AuthService();
        
        const hasSession = await authService.hasActiveSession();
        
        if (hasSession) {
          const session = await authService.getCurrentSession();
          
          if (session) {
            if (!session.email || session.email.trim() === '') {
              await authService.clearAllRealmData();
              onSessionNotFound();
              return;
            }
            
            await authService.openMainWithSession(
              session.accessToken,
              session.refreshToken,
              session.email
            );
            onSessionFound();
            return;
          }
        }

        try {
          const { SessionBridge } = NativeModules as any;
          if (SessionBridge && typeof SessionBridge.startCommerceListActivity === 'function') {
            const hasValidTokens = await SessionBridge.hasValidTokens?.() || false;
            if (hasValidTokens) {
              await SessionBridge.startCommerceListActivity();
              onSessionFound();
              return;
            }
          }
        } catch {
        }

        onSessionNotFound();
      } catch (error) {
        const authService = new AuthService();
        await authService.clearAllRealmData();
        onSessionNotFound();
      }
    };
    
    const timer = setTimeout(() => {
      checkSession();
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [onSessionFound, onSessionNotFound]);

  return <>{children}</>;
}; 