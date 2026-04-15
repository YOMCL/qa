import { FC } from 'react';
import { Text } from 'react-native';
import { TextInput } from 'react-native-paper';
import { inputStyles, typographyStyles } from '../styles';

export type DateInputProps = {
  value: string;
  onChangeText: (text: string) => void;
  onFocus: () => void;
  error: string;
};

const DateInput: FC<DateInputProps> = ({
  value,
  onChangeText,
  onFocus,
  error,
}) => {
  return (
    <>
      <Text style={[inputStyles.label, typographyStyles.label]}>
        Fecha
      </Text>
      <TextInput
        placeholder="DD/MM/YYYY"
        value={value}
        onChangeText={onChangeText}
        onFocus={onFocus}
        maxLength={10}
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

export default DateInput;
