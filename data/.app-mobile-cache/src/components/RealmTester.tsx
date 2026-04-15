import React, { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useJavaRealm } from '../contexts/JavaRealmContext';

export const RealmTester: React.FC = () => {
  const { javaRealmService, isLoading, isConnected } = useJavaRealm();
  const [testResult, setTestResult] = useState<string>('Esperando...');

  const testRealm = () => {
    if (!javaRealmService || !isConnected) {
      setTestResult('❌ Realm no disponible');
      return;
    }

    try {
      setTestResult('✅ Test exitoso - Realm conectado');
    } catch (error) {
      setTestResult(`💥 Error en test: ${error}`);
    }
  };

  return (
    <View style={{ padding: 10, backgroundColor: '#e0e0e0', margin: 10 }}>
      <Text style={{ fontWeight: 'bold' }}>🧪 Test de Realm:</Text>
      <Text>Estado: {testResult}</Text>
      <Text>Realm: {javaRealmService ? '✅' : '❌'}</Text>
      <Text>Conectado: {isConnected ? '✅' : '❌'}</Text>
      <Text>Loading: {isLoading ? '⏳' : '✅'}</Text>
      <TouchableOpacity onPress={testRealm} style={{ marginTop: 10, padding: 5, backgroundColor: '#007AFF' }}>
        <Text style={{ color: 'white', textAlign: 'center' }}>Ejecutar Test</Text>
      </TouchableOpacity>
    </View>
  );
}; 