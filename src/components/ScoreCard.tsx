import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';

type Props = {
  score: number;
  rank?: string;
  title?: string;
};

export function ScoreCard({ score, rank = 'B+', title = '最近のスコア' }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.row}>
        <Text style={styles.score}>{score}</Text>
        <Text style={styles.unit}>点 / 100</Text>
        <View style={styles.rank}><Text style={styles.rankText}>{rank}</Text></View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.lg,
  },
  title: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '800',
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: spacing.sm,
  },
  score: {
    color: colors.pink,
    fontSize: 46,
    fontWeight: '900',
  },
  unit: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '800',
    marginLeft: spacing.xs,
  },
  rank: {
    backgroundColor: colors.mintLight,
    borderRadius: radius.pill,
    marginLeft: 'auto',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  rankText: {
    color: colors.green,
    fontSize: 18,
    fontWeight: '900',
  },
});
