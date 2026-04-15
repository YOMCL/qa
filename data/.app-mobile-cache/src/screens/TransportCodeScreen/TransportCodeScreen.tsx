import { FC, useState } from 'react';
import { Keyboard, SafeAreaView, ScrollView, Text } from 'react-native';

import { FormCard, ResultCard } from './components';
import { containerStyles, typographyStyles } from './styles';
import { clearError } from './utils/clearError';
import { copyToClipboard } from './utils/copyToClipboard';
import { generateCode } from './utils/generateCode';
import { handleRutChange } from './utils/handleRutChange';

const TransportCodeScreen: FC = () => {
  const [projectValue, setProjectValue] = useState('');
  const [date, setDate] = useState('');
  const [rut, setRut] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [showResult, setShowResult] = useState(false);

  const [projectError, setProjectError] = useState('');
  const [dateError, setDateError] = useState('');
  const [rutError, setRutError] = useState('');

  const handleGenerateCode = () => {
    Keyboard.dismiss();
    generateCode(
      projectValue,
      date,
      rut,
      setProjectError,
      setDateError,
      setRutError,
      setGeneratedCode,
      setShowResult
    );
  };

  const handleCopyToClipboard = async () => {
    await copyToClipboard(generatedCode);
  };

  const handleClearError = (field: string) => {
    clearError(field, setProjectError, setDateError, setRutError);
  };

  const handleRutInputChange = (text: string) => {
    handleRutChange(text, setRut);
  };

  return (
    <SafeAreaView style={containerStyles.container}>
      <ScrollView style={containerStyles.content}>
        <Text style={typographyStyles.title}>
          Módulo de Transportista
        </Text>
        <Text style={typographyStyles.subtitle}>
          Generador de Código de Transportista
        </Text>

        <FormCard
          projectValue={projectValue}
          date={date}
          rut={rut}
          projectError={projectError}
          dateError={dateError}
          rutError={rutError}
          onProjectChange={setProjectValue}
          onDateChange={setDate}
          onRutChange={handleRutInputChange}
          onProjectFocus={() => handleClearError('project')}
          onDateFocus={() => handleClearError('date')}
          onRutFocus={() => handleClearError('rut')}
          onGeneratePress={handleGenerateCode}
        />

        {showResult && (
          <ResultCard
            generatedCode={generatedCode}
            onCopyPress={handleCopyToClipboard}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default TransportCodeScreen;
