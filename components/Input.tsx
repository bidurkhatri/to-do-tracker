import React from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import { colors } from '@/constants/colors';
import { useSettingsStore } from '@/hooks/use-settings-store';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  containerStyle,
  leftIcon,
  rightIcon,
  ...props
}) => {
  const { darkMode } = useSettingsStore();
  
  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={[styles.label, darkMode && styles.darkLabel]}>{label}</Text>}
      
      <View
        style={[
          styles.inputContainer,
          darkMode && styles.darkInputContainer,
          error ? styles.inputError : null,
          props.editable === false ? styles.inputDisabled : null,
          darkMode && props.editable === false && styles.darkInputDisabled,
        ]}
      >
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
        
        <TextInput
          style={[
            styles.input,
            darkMode && styles.darkInput,
            leftIcon ? styles.inputWithLeftIcon : null,
            rightIcon ? styles.inputWithRightIcon : null,
          ]}
          placeholderTextColor={darkMode ? colors.gray[400] : colors.gray[400]}
          {...props}
        />
        
        {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
      </View>
      
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 6,
  },
  darkLabel: {
    color: colors.white,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 8,
    backgroundColor: colors.white,
  },
  darkInputContainer: {
    borderColor: colors.gray[600],
    backgroundColor: colors.gray[700],
  },
  input: {
    flex: 1,
    height: 44,
    paddingHorizontal: 12,
    fontSize: 14,
    color: colors.text,
  },
  darkInput: {
    color: colors.white,
  },
  inputWithLeftIcon: {
    paddingLeft: 0,
  },
  inputWithRightIcon: {
    paddingRight: 0,
  },
  leftIcon: {
    paddingLeft: 12,
  },
  rightIcon: {
    paddingRight: 12,
  },
  inputError: {
    borderColor: colors.error,
  },
  inputDisabled: {
    backgroundColor: colors.gray[100],
    borderColor: colors.gray[300],
  },
  darkInputDisabled: {
    backgroundColor: colors.gray[600],
    borderColor: colors.gray[500],
  },
  errorText: {
    fontSize: 12,
    color: colors.error,
    marginTop: 4,
  },
});