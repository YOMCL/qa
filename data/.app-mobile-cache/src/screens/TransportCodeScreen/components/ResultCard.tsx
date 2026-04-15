import { FC } from 'react';
import { Text } from 'react-native';
import { Button, Card } from 'react-native-paper';
import { buttonStyles, cardStyles, typographyStyles } from '../styles';

export type ResultCardProps = {
  generatedCode: string;
  onCopyPress: () => void;
};

const ResultCard: FC<ResultCardProps> = ({ generatedCode, onCopyPress }) => {
  return (
    <Card elevation={2} style={cardStyles.resultCard}>
      <Card.Content>
        <Text style={typographyStyles.resultTitle}>
          Código Generado
        </Text>
        <Text style={typographyStyles.resultCode}>
          {generatedCode}
        </Text>
        <Button
          mode="contained"
          onPress={onCopyPress}
          style={buttonStyles.copyButton}
        >
          Copiar Código
        </Button>
      </Card.Content>
    </Card>
  );
};

export default ResultCard;
