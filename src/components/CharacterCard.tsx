import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Character } from '../types/character';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { CaddieAvatar } from './CaddieMessage';

type Props = {
  character: Character;
  selected: boolean;
  onPress: () => void;
};

export function CharacterCard({ character, selected, onPress }: Props) {
  return (
    <Pressable onPress={onPress} style={[styles.card, { backgroundColor: character.lightColor }, selected && { borderColor: character.color }]}>
      <View style={styles.check}>{selected ? <Text style={[styles.checkText, { color: character.color }]}>✓</Text> : <Text style={styles.empty}>○</Text>}</View>
      <CaddieAvatar character={character} size={88} />
      <Text style={[styles.name, { color: character.color }]}>{character.name}</Text>
      <Text style={styles.roman}>({character.romanName})</Text>
      <Text style={[styles.role, { backgroundColor: character.color }]}>{character.role}</Text>
      <Text style={styles.description}>{character.personality}・{character.feature}</Text>
      <Text style={styles.tone}>「{character.tone}」</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 2,
    flex: 1,
    minHeight: 250,
    padding: spacing.md,
  },
  check: {
    alignSelf: 'flex-end',
    height: 24,
  },
  checkText: {
    fontSize: 22,
    fontWeight: '900',
  },
  empty: {
    color: colors.muted,
    fontSize: 18,
  },
  name: {
    fontSize: 20,
    fontWeight: '900',
    marginTop: spacing.sm,
  },
  roman: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  role: {
    borderRadius: radius.pill,
    color: colors.surface,
    fontSize: 12,
    fontWeight: '800',
    marginVertical: spacing.sm,
    overflow: 'hidden',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  description: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  tone: {
    color: colors.muted,
    fontSize: 11,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
});
