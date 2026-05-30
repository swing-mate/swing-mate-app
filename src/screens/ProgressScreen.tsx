import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CaddieMessage } from '../components/CaddieMessage';
import { ProgressChart } from '../components/ProgressChart';
import { dummyHistory, metricProgress, progressLabels, scoreProgress } from '../data/dummyProgress';
import { getCharacterById } from '../data/characters';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { CharacterId } from '../types/character';
import { TabParamList } from '../types/navigation';

type Props = BottomTabScreenProps<TabParamList, 'Progress'> & { selectedCharacterId: CharacterId | null };
const filters = ['すべて', 'ドライバー', '7番アイアン', 'ウェッジ', 'パター'];

export function ProgressScreen({ selectedCharacterId }: Props) {
  const character = getCharacterById(selectedCharacterId);
  const [filter, setFilter] = useState('すべて');
  const history = filter === 'すべて' ? dummyHistory : dummyHistory.filter((item) => item.club === filter);
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>成長グラフ</Text>
      <CaddieMessage character={character} message={character.progressComment} compact />
      <View style={styles.filters}>{filters.map((item) => <Pressable key={item} onPress={() => setFilter(item)} style={[styles.chip, filter === item && styles.chipActive]}><Text style={[styles.chipText, filter === item && styles.chipTextActive]}>{item}</Text></Pressable>)}</View>
      <ProgressChart values={scoreProgress} labels={progressLabels} />
      <View style={styles.card}><Text style={styles.cardTitle}>項目別推移</Text>{metricProgress.map((item) => <View key={item.label} style={styles.metric}><View style={[styles.dot, { backgroundColor: item.color }]} /><Text style={styles.metricLabel}>{item.label}</Text><Text style={styles.metricValue}>{item.value}</Text></View>)}</View>
      <View style={styles.card}><Text style={styles.cardTitle}>最近の練習履歴</Text>{history.map((item) => <View key={`${item.date}-${item.club}`} style={styles.history}><Text style={styles.historyText}>{item.date}・{item.club}</Text><Text style={styles.historyScore}>{item.score}点</Text></View>)}</View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.background, padding: spacing.lg, gap: spacing.md },
  title: { color: colors.text, fontSize: 24, fontWeight: '900', textAlign: 'center' },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.pill, borderWidth: 1, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  chipActive: { backgroundColor: colors.pink, borderColor: colors.pink },
  chipText: { color: colors.muted, fontWeight: '800' },
  chipTextActive: { color: colors.surface },
  card: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg, borderWidth: 1, padding: spacing.lg },
  cardTitle: { color: colors.text, fontSize: 17, fontWeight: '900', marginBottom: spacing.md },
  metric: { alignItems: 'center', flexDirection: 'row', marginBottom: spacing.md },
  dot: { borderRadius: 6, height: 12, marginRight: spacing.sm, width: 12 },
  metricLabel: { color: colors.text, flex: 1, fontWeight: '800' },
  metricValue: { color: colors.pink, fontWeight: '900' },
  history: { alignItems: 'center', borderTopColor: colors.border, borderTopWidth: 1, flexDirection: 'row', paddingVertical: spacing.md },
  historyText: { color: colors.text, flex: 1, fontWeight: '800' },
  historyScore: { color: colors.pink, fontWeight: '900' },
});
