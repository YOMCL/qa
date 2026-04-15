import React, { createContext, useContext, useEffect, useState } from 'react';
import { NativeModules } from 'react-native';
import { JavaRealmNativeService } from '../services/JavaRealmNativeService';

type JavaRealmContextType = {
  javaRealmService: JavaRealmNativeService | null;
  isLoading: boolean;
  error: string | null;
  isConnected: boolean;
};

const JavaRealmContext = createContext<JavaRealmContextType>({
  javaRealmService: null,
  isLoading: true,
  error: null,
  isConnected: false,
});

export const useJavaRealm = () => {
  const context = useContext(JavaRealmContext);
  if (!context) {
    throw new Error('useJavaRealm must be used within a JavaRealmProvider');
  }
  return context;
};

type JavaRealmProviderProps = {
  children: React.ReactNode;
};

export const JavaRealmProvider: React.FC<JavaRealmProviderProps> = ({ children }) => {
  const [javaRealmService, setJavaRealmService] = useState<JavaRealmNativeService | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const initJavaRealm = async () => {
      try {
        setError(null);
        
        
        if (!NativeModules.JavaRealmModule) {
          setError('JavaRealmModule not found - Module may not be registered');
          setIsLoading(false);
          return;
        }
        
        const service = JavaRealmNativeService.getInstance();
        
        const initialized = await service.initialize();
        
        if (initialized) {
          setJavaRealmService(service);
          setIsConnected(true);
        } else {
          setError('Failed to initialize Native Module');
          setJavaRealmService(null);
          setIsConnected(false);
        }
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        setError(`Initialization error: ${errorMessage}`);
        setJavaRealmService(null);
        setIsConnected(false);
      } finally {
        setIsLoading(false);
      }
    };

    initJavaRealm();

    return () => {
      if (javaRealmService) {
        javaRealmService.close();
      }
    };
  }, [javaRealmService]);

  return (
    <JavaRealmContext.Provider value={{ javaRealmService, isLoading, error, isConnected }}>
      {children}
    </JavaRealmContext.Provider>
  );
};


// Hook para verificar la conexión y obtener estadísticas
export const useJavaRealmStats = () => {
  const { javaRealmService, isConnected } = useJavaRealm();
  const [stats, setStats] = useState<{
    orders: number;
    products: number;
    commerces: number;
    schemas: string[];
  } | null>(null);

  useEffect(() => {
    if (javaRealmService && isConnected) {
      try {
        const realmInfo = javaRealmService.getRealmInfo();
        if (realmInfo && realmInfo.schemas) {
          const schemas = realmInfo.schemas.map((s: any) => s.name);
          
          let orders = 0;
          let products = 0;
          let commerces = 0;
          
          realmInfo.schemas.forEach((schema: any) => {
            if (schema.name.includes('Order')) {
              orders += schema.count;
            } else if (schema.name.includes('Product')) {
              products += schema.count;
            } else if (schema.name.includes('Commerce')) {
              commerces += schema.count;
            }
          });
          
          setStats({ orders, products, commerces, schemas });
        }
      } catch {
        setStats({ orders: 0, products: 0, commerces: 0, schemas: [] });
      }
    } else {
      setStats(null);
    }
  }, [javaRealmService, isConnected]);

  return stats;
}; 