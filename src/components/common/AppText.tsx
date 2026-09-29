import React from 'react';
import { StyleProp, StyleSheet, Text, TextProps, TextStyle } from 'react-native';

type AppTextProps = TextProps & {
  children: React.ReactNode;
  preset?: 'default' | 'title' | 'subtitle' | 'caption' | 'button';
  style?: StyleProp<TextStyle>;
};

export function AppText({
  children,
  preset = 'default',
  style,
  ...textProps
}: AppTextProps) {
  return (
    <Text
      {...textProps}
      style={[
        styles.default,
        preset === 'title' && styles.title,
        preset === 'subtitle' && styles.subtitle,
        preset === 'caption' && styles.caption,
        preset === 'button' && styles.button,
        style,
      ]}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  default: {
    color: '#0f172a',
    fontSize: 16,
    lineHeight: 22,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 34,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 24,
  },
  caption: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 18,
  },
  button: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
  },
});
