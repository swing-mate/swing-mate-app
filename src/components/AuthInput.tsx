import React from 'react';
import { StyleSheet, TextInput, TextInputProps } from 'react-native';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';

export function AuthInput(props: TextInputProps) {
  return <TextInput placeholderTextColor={colors.muted} {...props} style={[styles.input, props.style]} />;
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    color: colors.text,
    fontSize: 15,
    minHeight: 50,
    paddingHorizontal: spacing.lg,
  },
});
