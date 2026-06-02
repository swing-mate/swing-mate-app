import React from 'react';
import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';

type Props = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  style?: ViewStyle;
  disabled?: boolean;
};

export function PastelButton({ label, onPress, variant = 'primary', style, disabled }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        disabled && styles.disabled,
        pressed && styles.pressed,
        style,
      ]}
    >
      <Text style={[styles.text, (variant === 'secondary' || variant === 'ghost') && styles.secondaryText]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    borderRadius: radius.pill,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  primary: {
    backgroundColor: colors.pink,
    shadowColor: colors.shadow,
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 3,
  },
  secondary: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
  },
  ghost: {
    backgroundColor: colors.pinkLight,
  },
  danger: {
    backgroundColor: colors.danger,
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    transform: [{ scale: 0.98 }],
  },
  text: {
    color: colors.surface,
    fontSize: 15,
    fontWeight: '800',
  },
  secondaryText: {
    color: colors.pink,
  },
});
