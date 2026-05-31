import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CaddieMessage } from '../components/CaddieMessage';
import { PastelButton } from '../components/PastelButton';
import { ScoreBar } from '../components/ScoreBar';
import { ScoreCard } from '../components/ScoreCard';
import { analysisItems, dummyAnalysis } from '../data/dummyAnalysis';
import { getCharacterById } from '../data/characters';
import { analysisService } from '../services/analysisService';
import { storageService } from '../services/storageService';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { CharacterId } from '../types/character';
import { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'AnalysisResult'> & { selectedCharacterId: CharacterId | null };

export function AnalysisResultScreen({ navigation, route, selectedCharacterId }: Props) {
  const character = getCharacterById(selectedCharacterId);
  const insets = useSafeAreaInsets();
  const [savedId, setSavedId] = useState<string | null>(null);
  const saveHistory = async () => {
    const swing = analysisService.createSwingHistory({ videoUri: route.params.videoUri, club: route.params.club, cameraAngle: route.params.cameraAngle, selectedCharacterId: character.id });
    const saved = await storageService.addSwing(swing);
    setSavedId(saved.id);
    Alert.alert('保存しました', saved.isBestSwing ? '今回のスイングがベストに設定されました。' : '履歴に保存しました。');
  };
  const setBest = async () => {
    const id = savedId;
    if (!id) { Alert.alert('先に保存してください', '履歴に保存するとベスト設定できます。'); return; }
    await storageService.setBestSwingId(id);
    Alert.alert('ベストに設定しました');
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { paddingTop: insets.top + spacing.md }]}>
      <ScoreCard score={dummyAnalysis.totalScore} rank={dummyAnalysis.rank} title="総合スコア" />
      <View style={styles.card}><Text style={styles.cardTitle}>スイング評価</Text>{analysisItems.map((item) => <ScoreBar key={item.key} label={item.label} score={dummyAnalysis[item.key]} comment={item.comment} color={character.color} />)}</View>
      <CaddieMessage character={character} message={character.resultAdvice} />
      <View style={styles.card}><Text style={styles.cardTitle}>コメント</Text>{dummyAnalysis.comments.map((comment) => <Text key={comment} style={styles.comment}>• {comment}</Text>)}</View>
      <PastelButton label="詳しい分析を見る" onPress={() => Alert.alert('準備中', '詳細分析は次のMVPで追加予定です。')} />
      <PastelButton label="ベストスイングと比較" onPress={() => navigation.navigate('BestCompare', { currentVideoUri: route.params.videoUri })} variant="secondary" />
      <PastelButton label={savedId ? '保存済み' : '履歴に保存'} onPress={saveHistory} variant="ghost" disabled={!!savedId} />
      <PastelButton label="ベストに設定" onPress={setBest} variant="secondary" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.background, padding: spacing.lg, gap: spacing.md },
  card: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg, borderWidth: 1, padding: spacing.lg },
  cardTitle: { color: colors.text, fontSize: 17, fontWeight: '900', marginBottom: spacing.md },
  comment: { color: colors.text, fontSize: 14, fontWeight: '700', lineHeight: 23, marginBottom: spacing.xs },
});
