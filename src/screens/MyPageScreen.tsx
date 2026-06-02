import React, { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { CompositeScreenProps, useFocusEffect } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CaddieAvatar } from '../components/CaddieMessage';
import { PastelButton } from '../components/PastelButton';
import { getCharacterById } from '../data/characters';
import { caddieExpRewards, getCaddieGrowthProgress } from '../data/caddieGrowth';
import { caddieGrowthService } from '../services/caddieGrowthService';
import { storageService } from '../services/storageService';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { CharacterId } from '../types/character';
import { RootStackParamList, TabParamList } from '../types/navigation';

type Props = CompositeScreenProps<BottomTabScreenProps<TabParamList, 'MyPage'>, NativeStackScreenProps<RootStackParamList>> & { selectedCharacterId: CharacterId | null; onLogout: () => Promise<void> };

export function MyPageScreen({ navigation, selectedCharacterId, onLogout }: Props) {
  const character = getCharacterById(selectedCharacterId);
  const insets = useSafeAreaInsets();
  const [growth, setGrowth] = useState(() => getCaddieGrowthProgress(character.id, 0));

  useFocusEffect(useCallback(() => {
    let mounted = true;
    caddieGrowthService.getProgress(character.id).then((progress) => { if (mounted) setGrowth(progress); });
    return () => { mounted = false; };
  }, [character.id]));
  const handleDelete = () => {
    Alert.alert('データ削除', '練習履歴とベストスイングを削除しますか？', [
      { text: 'キャンセル', style: 'cancel' },
      { text: '削除する', style: 'destructive', onPress: () => storageService.clearPracticeData() },
    ]);
  };
  const handleLogout = async () => {
    await onLogout();
    navigation.getParent()?.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { paddingTop: insets.top + spacing.md }]}>
      <View style={[styles.profile, { backgroundColor: character.lightColor }]}>
        <CaddieAvatar character={character} size={118} />
        <Text style={[styles.name, { color: character.color }]}>{character.name}</Text>
        <Text style={styles.role}>{character.role}</Text>
        <View style={styles.levelPill}><Text style={styles.levelText}>Lv.{growth.level}</Text></View>
      </View>
      <View style={styles.card}>
        <View style={styles.levelHeader}>
          <Text style={styles.cardTitle}>キャディ成長</Text>
          <Text style={[styles.outfitLabel, { color: character.color }]}>{growth.currentOutfitName}</Text>
        </View>
        <View style={styles.expTrack}><View style={[styles.expFill, { backgroundColor: character.color, width: `${growth.progressRatio * 100}%` }]} /></View>
        <Text style={styles.text}>{growth.level >= 100 ? 'Lv.100到達！レジェンド衣装まで解放済みです。' : `EXP ${growth.currentLevelExp} / ${growth.nextLevelExp} ・ 次の衣装解放: Lv.${growth.nextOutfitLevel} ${growth.nextOutfitName}`}</Text>
        <Text style={styles.rewardText}>EXP獲得: 撮影 +{caddieExpRewards.recordingComplete} / 分析 +{caddieExpRewards.analysisComplete} / ベスト更新 +{caddieExpRewards.bestSwingUpdated}</Text>
      </View>
      <PastelButton label="キャラ変更" onPress={() => navigation.getParent()?.navigate('CharacterSelect')} />
      <View style={styles.card}><Text style={styles.cardTitle}>アプリ説明</Text><Text style={styles.text}>スイングメイトは、かわいいキャディに応援してもらいながら、ゴルフスイングを撮影・分析・比較できる練習サポートアプリです。</Text></View>
      <View style={styles.card}><Text style={styles.cardTitle}>設定</Text><Text style={styles.text}>通知、表示、保存先などの設定は今後追加予定です。</Text></View>
      <PastelButton label="ログアウト" onPress={handleLogout} variant="secondary" />
      <PastelButton label="データ削除" onPress={handleDelete} variant="danger" />
      <Text style={styles.version}>Version 1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.background, padding: spacing.lg, gap: spacing.md },
  profile: { alignItems: 'center', borderRadius: radius.lg, padding: spacing.xl },
  name: { fontSize: 26, fontWeight: '900', marginTop: spacing.sm },
  role: { color: colors.text, fontSize: 14, fontWeight: '800', marginTop: spacing.xs },
  levelPill: { backgroundColor: colors.surface, borderRadius: radius.pill, marginTop: spacing.md, paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
  levelText: { color: colors.text, fontSize: 15, fontWeight: '900' },
  card: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg, borderWidth: 1, padding: spacing.lg },
  cardTitle: { color: colors.text, fontSize: 17, fontWeight: '900', marginBottom: spacing.sm },
  levelHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  outfitLabel: { fontSize: 13, fontWeight: '900', marginBottom: spacing.sm },
  expTrack: { backgroundColor: colors.pinkLight, borderRadius: radius.pill, height: 14, marginBottom: spacing.sm, overflow: 'hidden' },
  expFill: { borderRadius: radius.pill, height: '100%' },
  text: { color: colors.muted, fontSize: 14, fontWeight: '700', lineHeight: 22 },
  rewardText: { color: colors.text, fontSize: 12, fontWeight: '800', lineHeight: 19, marginTop: spacing.sm },
  version: { color: colors.muted, fontWeight: '800', textAlign: 'center' },
});
