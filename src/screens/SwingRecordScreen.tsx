import React, { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CaddieMessage } from '../components/CaddieMessage';
import { PastelButton } from '../components/PastelButton';
import { getCharacterById } from '../data/characters';
import { DUMMY_VIDEO_URI } from '../services/analysisService';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { CharacterId } from '../types/character';
import { RootStackParamList, TabParamList } from '../types/navigation';
import { CameraAngle } from '../types/swing';

type Props = CompositeScreenProps<BottomTabScreenProps<TabParamList, 'Record'>, NativeStackScreenProps<RootStackParamList>> & { selectedCharacterId: CharacterId | null };

const clubs = ['ドライバー', '3W', '5W', '5番アイアン', '7番アイアン', '9番アイアン', 'ウェッジ', 'パター'];

export function SwingRecordScreen({ navigation, selectedCharacterId }: Props) {
  const character = getCharacterById(selectedCharacterId);
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<any>(null);
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [cameraAngle, setCameraAngle] = useState<CameraAngle>('front');
  const [club, setClub] = useState('7番アイアン');

  useEffect(() => {
    if (!permission?.granted) requestPermission();
  }, [permission?.granted, requestPermission]);

  useEffect(() => {
    if (!recording) return undefined;
    const timer = setInterval(() => setSeconds((value) => value + 1), 1000);
    return () => clearInterval(timer);
  }, [recording]);

  const goLoading = (videoUri?: string) => navigation.getParent()?.navigate('AnalysisLoading', { videoUri, club, cameraAngle });

  const startRecording = async () => {
    if (!cameraRef.current) {
      goLoading(DUMMY_VIDEO_URI);
      return;
    }
    setSeconds(0);
    setRecording(true);
    try {
      const video = await cameraRef.current.recordAsync({ maxDuration: 20 });
      goLoading(video?.uri || DUMMY_VIDEO_URI);
    } catch {
      goLoading(DUMMY_VIDEO_URI);
    } finally {
      setRecording(false);
    }
  };

  const stopRecording = () => {
    cameraRef.current?.stopRecording();
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <CaddieMessage character={character} message={character.recordAdvice} compact />
      <View style={styles.cameraWrap}>
        {permission?.granted ? <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} mode="video" facing="back" /> : <View style={styles.cameraFallback}><Text style={styles.fallbackText}>カメラ権限を確認中...</Text></View>}
        <View style={styles.grid}>{[1, 2].map((line) => <View key={`v${line}`} style={[styles.vLine, { left: `${line * 33.33}%` }]} />)}{[1, 2].map((line) => <View key={`h${line}`} style={[styles.hLine, { top: `${line * 33.33}%` }]} />)}</View>
        <Text style={styles.timer}>{new Date(seconds * 1000).toISOString().slice(11, 19)}</Text>
        <Text style={styles.tip}>全身が入るように撮影してね</Text>
      </View>
      <Text style={styles.label}>撮影角度</Text>
      <View style={styles.options}>
        <Chip label="正面" active={cameraAngle === 'front'} onPress={() => setCameraAngle('front')} />
        <Chip label="後方" active={cameraAngle === 'downTheLine'} onPress={() => setCameraAngle('downTheLine')} />
      </View>
      <Text style={styles.label}>使用クラブ</Text>
      <View style={styles.options}>{clubs.map((item) => <Chip key={item} label={item} active={club === item} onPress={() => setClub(item)} />)}</View>
      <PastelButton label={recording ? '録画停止' : '録画開始'} onPress={recording ? stopRecording : startRecording} />
      <PastelButton label="ダミー動画で分析へ進む" onPress={() => goLoading(DUMMY_VIDEO_URI)} variant="secondary" />
    </ScrollView>
  );
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return <Pressable onPress={onPress} style={[styles.chip, active && styles.chipActive]}><Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text></Pressable>;
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.background, padding: spacing.lg, gap: spacing.md },
  cameraWrap: { backgroundColor: '#B9DCD6', borderRadius: radius.lg, height: 430, overflow: 'hidden' },
  cameraFallback: { alignItems: 'center', flex: 1, justifyContent: 'center' },
  fallbackText: { color: colors.text, fontWeight: '800' },
  grid: { bottom: 0, left: 0, position: 'absolute', right: 0, top: 0 },
  vLine: { backgroundColor: 'rgba(255,255,255,0.5)', height: '100%', position: 'absolute', width: 1 },
  hLine: { backgroundColor: 'rgba(255,255,255,0.5)', height: 1, position: 'absolute', width: '100%' },
  timer: { alignSelf: 'center', backgroundColor: 'rgba(0,0,0,0.35)', borderRadius: radius.pill, color: colors.surface, fontSize: 16, fontWeight: '900', marginTop: spacing.md, overflow: 'hidden', paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  tip: { alignSelf: 'center', backgroundColor: 'rgba(255,255,255,0.85)', borderRadius: radius.pill, bottom: spacing.md, color: colors.text, fontWeight: '900', overflow: 'hidden', paddingHorizontal: spacing.md, paddingVertical: spacing.sm, position: 'absolute' },
  label: { color: colors.text, fontSize: 15, fontWeight: '900' },
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.pill, borderWidth: 1, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  chipActive: { backgroundColor: colors.pink, borderColor: colors.pink },
  chipText: { color: colors.muted, fontWeight: '800' },
  chipTextActive: { color: colors.surface },
});
