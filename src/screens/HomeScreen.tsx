import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CaddieAvatar, CaddieMessage } from '../components/CaddieMessage';
import { PastelButton } from '../components/PastelButton';
import { ScoreCard } from '../components/ScoreCard';
import { getCharacterById } from '../data/characters';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { CharacterId } from '../types/character';
import { RootStackParamList, TabParamList } from '../types/navigation';

type Props = CompositeScreenProps<BottomTabScreenProps<TabParamList, 'Home'>, NativeStackScreenProps<RootStackParamList>> & { selectedCharacterId: CharacterId | null };

export function HomeScreen({ navigation, selectedCharacterId }: Props) {
  const character = getCharacterById(selectedCharacterId);
  const actions = [
    { label: 'スイング分析', action: () => navigation.navigate('Record') },
    { label: '成長グラフ', action: () => navigation.navigate('Progress') },
    { label: '履歴', action: () => navigation.navigate('Progress') },
    { label: 'キャラ変更', action: () => navigation.getParent()?.navigate('CharacterSelect') },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={[styles.hero, { backgroundColor: character.lightColor }]}>
        <CaddieAvatar character={character} size={132} />
        <View style={styles.heroText}><Text style={styles.welcome}>こんにちは！</Text><Text style={[styles.characterName, { color: character.color }]}>{character.name}が応援中</Text></View>
      </View>
      <CaddieMessage character={character} message={character.homeComment} />
      <PastelButton label="今日のスイングを撮影" onPress={() => navigation.navigate('Record')} />
      <PastelButton label="ベストスイングと比較" onPress={() => navigation.getParent()?.navigate('BestCompare')} variant="secondary" />
      <ScoreCard score={78} />
      <View style={styles.card}><Text style={styles.cardTitle}>今日の練習メニュー</Text><Text style={styles.cardText}>・7番アイアンで正面撮影 5球{`\n`}・トップ位置を確認{`\n`}・ベストスイングと重ね比較</Text></View>
      <Text style={styles.sectionTitle}>クイックアクション</Text>
      <View style={styles.grid}>{actions.map((item) => <PastelButton key={item.label} label={item.label} onPress={item.action} variant="ghost" style={styles.gridButton} />)}</View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.background, padding: spacing.lg, gap: spacing.md },
  hero: { alignItems: 'center', borderRadius: radius.lg, flexDirection: 'row', gap: spacing.lg, padding: spacing.lg },
  heroText: { flex: 1 },
  welcome: { color: colors.text, fontSize: 16, fontWeight: '800' },
  characterName: { fontSize: 24, fontWeight: '900', marginTop: spacing.xs },
  card: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg, borderWidth: 1, padding: spacing.lg },
  cardTitle: { color: colors.text, fontSize: 17, fontWeight: '900', marginBottom: spacing.sm },
  cardText: { color: colors.muted, fontSize: 14, fontWeight: '700', lineHeight: 23 },
  sectionTitle: { color: colors.text, fontSize: 18, fontWeight: '900' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  gridButton: { width: '48%' },
});
