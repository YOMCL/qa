import { FC } from 'react';
import { Text } from 'react-native';
import { TextInput } from 'react-native-paper';
import { inputStyles, typographyStyles } from '../styles';

export type RutInputProps = {
  value: string;
  onChangeText: (text: string) => void;
  onFocus: () => void;
  error: string;
};

const RutInput: FC<RutInputProps> = ({
  value,
  onChangeText,
  onFocus,
  error,
}) => {
  return (
    <>
      <Text style={[inputStyles.label, typographyStyles.label]}>
        RUT
      </Text>
      <TextInput
        placeholder="123456789"
        value={value}
        onChangeText={onChangeText}
        onFocus={onFocus}
        style={[
          inputStyles.textField,
          error && inputStyles.textFieldError,
        ]}
        mode="outlined"
      />
      {error ? (
        <Text style={typographyStyles.errorText}>
          {error}
        </Text>
      ) : null}
    </>
  );
};

export default RutInput;
