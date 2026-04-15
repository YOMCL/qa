import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { AuthService } from '../services/AuthService';

export const SessionDebugger: React.FC = () => {
  const [sessionInfo, setSessionInfo] = useState<string>('Cargando...');

  useEffect(() => {
    const checkSession = async () => {
      try {
        const authService = new AuthService();
        const hasSession = await authService.hasActiveSession();
        
        if (hasSession) {
          const session = await authService.getCurrentSession();
          if (session) {
            setSessionInfo(`✅ Sesión activa - Email: ${session.email}`);
          } else {
            setSessionInfo('❌ Sesión encontrada pero no válida');
          }
        } else {
          setSessionInfo('❌ No hay sesión activa');
        }
      } catch (error) {
        setSessionInfo(`💥 Error: ${error}`);
      }
    };

    checkSession();
  }, []);

  return (
    <View style={{ padding: 10, backgroundColor: '#f0f0f0', margin: 10 }}>
      <Text style={{ fontWeight: 'bold' }}>🔍 Debug de Sesión:</Text>
      <Text>{sessionInfo}</Text>
    </View>
  );
}; 