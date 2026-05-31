import React, { useEffect, useRef, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PastelButton } from '../components/PastelButton';
import { DUMMY_VIDEO_URI } from '../services/analysisService';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { CharacterId } from '../types/character';
import { RootStackParamList, TabParamList } from '../types/navigation';
import { CameraAngle } from '../types/swing';

type Props = CompositeScreenProps<BottomTabScreenProps<TabParamList, 'Record'>, NativeStackScreenProps<RootStackParamList>> & { selectedCharacterId: CharacterId | null };

const clubs = ['ドライバー', 'ウッド', 'ユーティリティ', 'アイアン', 'ウェッジ', 'パター'];

export function SwingRecordScreen({ navigation }: Props) {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<any>(null);
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [cameraAngle, setCameraAngle] = useState<CameraAngle>('front');
  const [club, setClub] = useState('アイアン');

  useEffect(() => {
    if (!permission?.granted) requestPermission();
  }, [permission?.granted, requestPermission]);

  useEffect(() => {
    if (!recording) return undefined;
    const timer = setInterval(() => setSeconds((value) => value + 1), 1000);
    return () => clearInterval(timer);
  }, [recording]);

  const goLoading = (videoUri?: string) => navigation.getParent()?.navigate('AnalysisLoading', { videoUri, club, cameraAngle });

  const pickVideo = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('動画を選択できません', 'スマホ内の動画を選ぶには写真ライブラリへのアクセス許可が必要です。');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['videos'],
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled && result.assets[0]?.uri) {
      goLoading(result.assets[0].uri);
    }
  };

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

  const handleBack = () => {
    if (recording) {
      stopRecording();
      return;
    }
    navigation.navigate('Home');
  };

  return (
    <View style={styles.container}>
      {permission?.granted ? <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} mode="video" facing="back" /> : <View style={styles.cameraFallback}><Text style={styles.fallbackText}>カメラ権限を確認中...</Text></View>}
      <View style={styles.overlay}>
        <View style={styles.grid}>{[1, 2].map((line) => <View key={`v${line}`} style={[styles.vLine, { left: `${line * 33.33}%` }]} />)}{[1, 2].map((line) => <View key={`h${line}`} style={[styles.hLine, { top: `${line * 33.33}%` }]} />)}</View>

        <View style={styles.topBar}>
          <Pressable onPress={handleBack} style={styles.backButton}><Text style={styles.backText}>‹ 戻る</Text></Pressable>
          <Text style={styles.timer}>{new Date(seconds * 1000).toISOString().slice(11, 19)}</Text>
          <View style={styles.topSpacer} />
        </View>

        <Text style={styles.tip}>全身が入るように撮影してね</Text>

        <View style={styles.controls}>
          <Text style={styles.label}>撮影角度</Text>
          <View style={styles.options}>
            <Chip label="正面" active={cameraAngle === 'front'} onPress={() => setCameraAngle('front')} />
            <Chip label="後方" active={cameraAngle === 'downTheLine'} onPress={() => setCameraAngle('downTheLine')} />
          </View>
          <Text style={styles.label}>使用クラブ</Text>
          <View style={styles.options}>{clubs.map((item) => <Chip key={item} label={item} active={club === item} onPress={() => setClub(item)} />)}</View>
          <Pressable onPress={recording ? stopRecording : startRecording} style={[styles.recordButton, recording && styles.stopButton]}>
            <View style={[styles.recordInner, recording && styles.stopInner]} />
          </Pressable>
          <View style={styles.bottomActions}>
            <PastelButton label="動画を選択" onPress={pickVideo} variant="ghost" style={styles.actionButton} />
            <PastelButton label="ダミー分析" onPress={() => goLoading(DUMMY_VIDEO_URI)} variant="secondary" style={styles.actionButton} />
          </View>
        </View>
      </View>
    </View>
  );
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return <Pressable onPress={onPress} style={[styles.chip, active && styles.chipActive]}><Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text></Pressable>;
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#111827', flex: 1 },
  cameraFallback: { alignItems: 'center', backgroundColor: '#B9DCD6', flex: 1, justifyContent: 'center' },
  fallbackText: { color: colors.text, fontWeight: '800' },
  overlay: { flex: 1 },
  grid: { bottom: 0, left: 0, position: 'absolute', right: 0, top: 0 },
  vLine: { backgroundColor: 'rgba(255,255,255,0.35)', height: '100%', position: 'absolute', width: 1 },
  hLine: { backgroundColor: 'rgba(255,255,255,0.35)', height: 1, position: 'absolute', width: '100%' },
  topBar: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingTop: spacing.xxl },
  backButton: { backgroundColor: 'rgba(255,255,255,0.82)', borderRadius: radius.pill, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  backText: { color: colors.text, fontSize: 15, fontWeight: '900' },
  timer: { backgroundColor: 'rgba(0,0,0,0.42)', borderRadius: radius.pill, color: colors.surface, fontSize: 16, fontWeight: '900', overflow: 'hidden', paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  topSpacer: { width: 76 },
  tip: { alignSelf: 'center', backgroundColor: 'rgba(255,255,255,0.86)', borderRadius: radius.pill, color: colors.text, fontWeight: '900', marginTop: spacing.md, overflow: 'hidden', paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  controls: { backgroundColor: 'rgba(255,248,251,0.92)', borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg, bottom: 0, gap: spacing.sm, left: 0, padding: spacing.lg, position: 'absolute', right: 0 },
  label: { color: colors.text, fontSize: 14, fontWeight: '900' },
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.pill, borderWidth: 1, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  chipActive: { backgroundColor: colors.pink, borderColor: colors.pink },
  chipText: { color: colors.muted, fontWeight: '800' },
  chipTextActive: { color: colors.surface },
  recordButton: { alignItems: 'center', alignSelf: 'center', backgroundColor: colors.surface, borderColor: colors.pink, borderRadius: 42, borderWidth: 5, height: 84, justifyContent: 'center', marginTop: spacing.sm, width: 84 },
  stopButton: { borderColor: colors.danger },
  recordInner: { backgroundColor: colors.pink, borderRadius: 30, height: 58, width: 58 },
  stopInner: { backgroundColor: colors.danger, borderRadius: radius.sm, height: 34, width: 34 },
  bottomActions: { flexDirection: 'row', gap: spacing.sm },
  actionButton: { flex: 1 },
});
