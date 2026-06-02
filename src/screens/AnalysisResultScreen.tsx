import React, { useEffect, useState } from 'react';
import { Alert, LayoutChangeEvent, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ResizeMode, Video } from 'expo-av';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Svg, { Line } from 'react-native-svg';
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
import { EditedSwingVideo, VideoDisplaySize } from '../types/swing';

type Props = NativeStackScreenProps<RootStackParamList, 'AnalysisResult'> & { selectedCharacterId: CharacterId | null };

export function AnalysisResultScreen({ navigation, route, selectedCharacterId }: Props) {
  const character = getCharacterById(selectedCharacterId);
  const insets = useSafeAreaInsets();
  const [savedId, setSavedId] = useState<string | null>(null);
  const [editedVideo, setEditedVideo] = useState<EditedSwingVideo | null>(route.params.editedVideo ?? null);
  const [previewSize, setPreviewSize] = useState<VideoDisplaySize>({ height: 1, width: 1 });

  useEffect(() => {
    if (route.params.editedVideo) return;
    let mounted = true;
    storageService.getLatestEditedSwingVideo().then((latest) => {
      if (mounted && latest && latest.videoUri === route.params.videoUri) setEditedVideo(latest);
    });
    return () => { mounted = false; };
  }, [route.params.editedVideo, route.params.videoUri]);

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
  const onPreviewLayout = (event: LayoutChangeEvent) => setPreviewSize({ height: event.nativeEvent.layout.height || 1, width: event.nativeEvent.layout.width || 1 });

  return (
    <ScrollView contentContainerStyle={[styles.container, { paddingTop: insets.top + spacing.lg }]}>
      <ScoreCard score={dummyAnalysis.totalScore} rank={dummyAnalysis.rank} title="総合スコア" />
      {editedVideo ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>補助線つき動画</Text>
          <View style={styles.videoPreview} onLayout={onPreviewLayout}>
            <Video source={{ uri: editedVideo.videoUri }} resizeMode={ResizeMode.CONTAIN} shouldPlay={false} style={StyleSheet.absoluteFill} />
            <Svg height="100%" width="100%" style={StyleSheet.absoluteFill}>
              {editedVideo.drawnLines.map((line, index) => {
                const scaleX = previewSize.width / Math.max(1, editedVideo.videoDisplaySize.width);
                const scaleY = previewSize.height / Math.max(1, editedVideo.videoDisplaySize.height);
                return <Line key={`${line.startX}-${line.startY}-${index}`} x1={line.startX * scaleX} y1={line.startY * scaleY} x2={line.endX * scaleX} y2={line.endY * scaleY} stroke={line.color} strokeLinecap="round" strokeWidth={line.strokeWidth} />;
              })}
            </Svg>
          </View>
          <Text style={styles.editedMeta}>再生速度 {editedVideo.selectedPlaybackSpeed}x・{Math.round(editedVideo.currentPositionMillis / 1000)}秒地点・補助線 {editedVideo.drawnLines.length}本</Text>
        </View>
      ) : null}
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
  videoPreview: { backgroundColor: '#111827', borderRadius: radius.md, height: 310, overflow: 'hidden' },
  editedMeta: { color: colors.muted, fontSize: 12, fontWeight: '800', marginTop: spacing.sm, textAlign: 'center' },
});
