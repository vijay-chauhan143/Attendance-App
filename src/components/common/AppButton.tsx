import {
  Pressable,
  StyleProp,
  StyleSheet,
  TextStyle,
  ViewStyle,
} from 'react-native';

import { AppText } from './AppText';

type AppButtonProps = {
  title: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

export function AppButton({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  style,
  textStyle,
}: AppButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.button,
        variant === 'primary' ? styles.primary : styles.secondary,
        disabled && styles.disabled,
        style,
      ]}
    >
      <AppText
        preset="button"
        style={[variant === 'primary' ? styles.primaryText : styles.secondaryText, textStyle]}
      >
        {title}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 18,
    minHeight: 48,
  },
  primary: {
    backgroundColor: '#2563eb',
  },
  secondary: {
    backgroundColor: '#e2e8f0',
  },
  disabled: {
    opacity: 0.6,
  },
  primaryText: {
    color: '#ffffff',
  },
  secondaryText: {
    color: '#0f172a',
  },
});
