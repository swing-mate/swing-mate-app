import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';

type Props = {
  label: string;
  score: number;
  max?: number;
  comment?: string;
  color?: string;
};

export function ScoreBar({ label, score, max = 20, comment, color = colors.pink }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.score}>{score}/{max}</Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${Math.min(100, (score / max) * 100)}%`, backgroundColor: color }]} />
      </View>
      {comment ? <Text style={styles.comment}>{comment}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '800',
  },
  score: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '800',
  },
  track: {
    backgroundColor: colors.pinkLight,
    borderRadius: radius.pill,
    height: 10,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: radius.pill,
    height: 10,
  },
  comment: {
    color: colors.muted,
    fontSize: 12,
  },
});
