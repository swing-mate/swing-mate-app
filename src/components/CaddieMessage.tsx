import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Character } from '../types/character';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';

type Props = {
  character: Character;
  message: string;
  compact?: boolean;
};

export function CaddieAvatar({ character, size = 88 }: { character: Character; size?: number }) {
  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2, backgroundColor: character.lightColor }]}>
      <Text style={[styles.avatarEmoji, { fontSize: size * 0.36 }]}>{character.emoji}</Text>
      <Text style={[styles.avatarName, { color: character.color }]}>{character.name}</Text>
    </View>
  );
}

export function CaddieMessage({ character, message, compact }: Props) {
  return (
    <View style={[styles.row, compact && styles.compactRow]}>
      <CaddieAvatar character={character} size={compact ? 58 : 78} />
      <View style={[styles.bubble, { borderColor: character.color, backgroundColor: character.lightColor }]}>
        <Text style={[styles.name, { color: character.color }]}>{character.name}</Text>
        <Text style={styles.message}>{message}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  compactRow: {
    gap: spacing.sm,
  },
  avatar: {
    alignItems: 'center',
    borderColor: colors.surface,
    borderWidth: 4,
    justifyContent: 'center',
    shadowColor: colors.shadow,
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  avatarEmoji: {
    marginBottom: 2,
  },
  avatarName: {
    fontSize: 12,
    fontWeight: '900',
  },
  bubble: {
    borderRadius: radius.lg,
    borderWidth: 1,
    flex: 1,
    padding: spacing.md,
  },
  name: {
    fontSize: 14,
    fontWeight: '900',
    marginBottom: spacing.xs,
  },
  message: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 21,
  },
});
