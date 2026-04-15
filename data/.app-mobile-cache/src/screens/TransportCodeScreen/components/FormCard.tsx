import { FC } from 'react';
import { Text } from 'react-native';
import { Button, Card } from 'react-native-paper';
import { buttonStyles, cardStyles } from '../styles';
import DateInput from './DateInput';
import ProjectValueInput from './ProjectValueInput';
import RutInput from './RutInput';

export type FormCardProps = {
  projectValue: string;
  date: string;
  rut: string;
  projectError: string;
  dateError: string;
  rutError: string;
  onProjectChange: (text: string) => void;
  onDateChange: (text: string) => void;
  onRutChange: (text: string) => void;
  onProjectFocus: () => void;
  onDateFocus: () => void;
  onRutFocus: () => void;
  onGeneratePress: () => void;
};

const FormCard: FC<FormCardProps> = ({
  projectValue,
  date,
  rut,
  projectError,
  dateError,
  rutError,
  onProjectChange,
  onDateChange,
  onRutChange,
  onProjectFocus,
  onDateFocus,
  onRutFocus,
  onGeneratePress,
}) => {
  return (
    <Card elevation={2} style={cardStyles.card}>
      <Card.Content>
        <Text style={cardStyles.cardTitle}>
          Datos del Transportista
        </Text>

        <ProjectValueInput
          value={projectValue}
          onChangeText={onProjectChange}
          onFocus={onProjectFocus}
          error={projectError}
        />

        <DateInput
          value={date}
          onChangeText={onDateChange}
          onFocus={onDateFocus}
          error={dateError}
        />

        <RutInput
          value={rut}
          onChangeText={onRutChange}
          onFocus={onRutFocus}
          error={rutError}
        />

        <Button
          mode="contained"
          onPress={onGeneratePress}
          style={buttonStyles.generateButton}
        >
          Generar Código
        </Button>
      </Card.Content>
    </Card>
  );
};

export default FormCard;
