import React, { useRef, useState } from 'react';
import { GestureResponderEvent, LayoutChangeEvent, PanResponder, Pressable, StyleSheet, Text, View } from 'react-native';
import { ResizeMode, Video } from 'expo-av';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Svg, { Line } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DUMMY_VIDEO_URI } from '../services/analysisService';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'VideoAnalysisPlayer'>;
type Point = { x: number; y: number };
type GuideLine = { id: string; start: Point; end: Point };

const speedOptions = [0.25, 0.5, 1.0, 2.0];

const snapLine = (start: Point, end: Point): GuideLine => {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  if (Math.abs(dx) < Math.abs(dy) * 0.25) {
    return { id: `${Date.now()}`, start, end: { x: start.x, y: end.y } };
  }
  if (Math.abs(dy) < Math.abs(dx) * 0.25) {
    return { id: `${Date.now()}`, start, end: { x: end.x, y: start.y } };
  }
  return { id: `${Date.now()}`, start, end };
};

const formatTime = (millis: number) => {
  const totalSeconds = Math.floor(millis / 1000);
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
};

export function VideoAnalysisPlayerScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const videoRef = useRef<Video>(null);
  const [playing, setPlaying] = useState(false);
  const [positionMillis, setPositionMillis] = useState(0);
  const [durationMillis, setDurationMillis] = useState(1);
  const [speed, setSpeed] = useState(1.0);
  const [finished, setFinished] = useState(false);
  const [drawingEnabled, setDrawingEnabled] = useState(false);
  const [guideLines, setGuideLines] = useState<GuideLine[]>([]);
  const [previewLine, setPreviewLine] = useState<GuideLine | null>(null);
  const [seekWidth, setSeekWidth] = useState(1);
  const activeStartRef = useRef<Point | null>(null);
  const previewLineRef = useRef<GuideLine | null>(null);
  const videoUri = route.params.videoUri || DUMMY_VIDEO_URI;

  const getEventPoint = (event?: GestureResponderEvent): Point | null => {
    const nativeEvent = event?.nativeEvent;
    if (!nativeEvent) return null;
    return { x: nativeEvent.locationX, y: nativeEvent.locationY };
  };

  const setPreviewGuideLine = (line: GuideLine | null) => {
    previewLineRef.current = line;
    setPreviewLine(line);
  };

  const updatePreviewLine = (event: GestureResponderEvent) => {
    const point = getEventPoint(event);
    const start = activeStartRef.current;
    if (!point || !start) return;
    setPreviewGuideLine(snapLine(start, point));
  };

  const finishGuideLine = (event?: GestureResponderEvent) => {
    const point = getEventPoint(event);
    const current = previewLineRef.current;
    if (!current) return;
    const completedLine = point ? snapLine(current.start, point) : current;
    setGuideLines((lines) => [...lines, completedLine]);
    activeStartRef.current = null;
    setPreviewGuideLine(null);
  };

  const clearGuideLines = () => {
    setGuideLines([]);
    activeStartRef.current = null;
    setPreviewGuideLine(null);
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => drawingEnabled,
    onMoveShouldSetPanResponder: () => drawingEnabled,
    onPanResponderGrant: (event: GestureResponderEvent) => {
      const start = getEventPoint(event);
      if (!start) return;
      activeStartRef.current = start;
      setPreviewGuideLine({ id: `${Date.now()}`, start, end: start });
    },
    onPanResponderMove: updatePreviewLine,
    onPanResponderRelease: finishGuideLine,
    onPanResponderTerminate: finishGuideLine,
  });

  const togglePlay = async () => {
    if (playing) {
      await videoRef.current?.pauseAsync();
      setPlaying(false);
      return;
    }
    if (finished || positionMillis >= durationMillis - 250) {
      await videoRef.current?.setPositionAsync(0);
      setPositionMillis(0);
      setFinished(false);
    }
    await videoRef.current?.setRateAsync(speed, true);
    await videoRef.current?.playAsync();
    setPlaying(true);
  };

  const changeSpeed = async (nextSpeed: number) => {
    setSpeed(nextSpeed);
    await videoRef.current?.setRateAsync(nextSpeed, true);
  };

  const seekTo = async (x: number) => {
    const nextPosition = Math.max(0, Math.min(1, x / seekWidth)) * durationMillis;
    await videoRef.current?.setPositionAsync(nextPosition);
    setPositionMillis(nextPosition);
    setFinished(false);
  };

  const handleSeekLayout = (event: LayoutChangeEvent) => setSeekWidth(event.nativeEvent.layout.width || 1);

  return (
    <View style={styles.container}>
      <View style={[styles.topBar, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable onPress={() => navigation.goBack()} style={styles.topButton}><Text style={styles.topButtonText}>‹ 戻る</Text></Pressable>
        <Pressable onPress={() => setDrawingEnabled((current) => !current)} style={[styles.topButton, drawingEnabled && styles.topButtonActive]}><Text style={[styles.topButtonText, drawingEnabled && styles.topButtonActiveText]}>描画{drawingEnabled ? 'ON' : 'OFF'}</Text></Pressable>
        <Pressable onPress={clearGuideLines} style={styles.topButton}><Text style={styles.topButtonText}>クリア</Text></Pressable>
      </View>

      <View style={styles.videoWrap}>
        <Video
          ref={videoRef}
          source={{ uri: videoUri }}
          resizeMode={ResizeMode.CONTAIN}
          shouldPlay={false}
          style={StyleSheet.absoluteFill}
          onPlaybackStatusUpdate={(status: any) => {
            if (!status?.isLoaded) return;
            if (status.didJustFinish) {
              setPlaying(false);
              setFinished(true);
              setPositionMillis(status.durationMillis || status.positionMillis || 0);
              setDurationMillis(status.durationMillis || 1);
              return;
            }
            setPlaying(!!status.isPlaying);
            setFinished(false);
            setPositionMillis(status.positionMillis || 0);
            setDurationMillis(status.durationMillis || 1);
          }}
        />
        <View pointerEvents={drawingEnabled ? 'auto' : 'none'} style={StyleSheet.absoluteFill} {...panResponder.panHandlers}>
          <Svg height="100%" width="100%">
            {guideLines.map((line) => <Line key={line.id} x1={line.start.x} y1={line.start.y} x2={line.end.x} y2={line.end.y} stroke={colors.pink} strokeLinecap="round" strokeWidth={3} />)}
            {previewLine ? <Line x1={previewLine.start.x} y1={previewLine.start.y} x2={previewLine.end.x} y2={previewLine.end.y} stroke={colors.pink} strokeLinecap="round" strokeOpacity={0.75} strokeWidth={3} /> : null}
          </Svg>
        </View>
      </View>

      <View style={[styles.controls, { paddingBottom: insets.bottom + spacing.md }]}>
        <View style={styles.playRow}>
          <Pressable onPress={togglePlay} style={styles.playButton}><Text style={styles.playText}>{playing ? '停止' : '再生'}</Text></Pressable>
          <Text style={styles.timeText}>{formatTime(positionMillis)} / {formatTime(durationMillis)}</Text>
        </View>
        <Pressable style={styles.seekTrack} onLayout={handleSeekLayout} onPress={(event) => seekTo(event.nativeEvent.locationX)}>
          <View style={[styles.seekFill, { width: `${Math.min(100, (positionMillis / durationMillis) * 100)}%` }]} />
          <View style={[styles.seekThumb, { left: `${Math.min(98, (positionMillis / durationMillis) * 100)}%` }]} />
        </Pressable>
        <Text style={styles.sectionLabel}>再生速度</Text>
        <View style={styles.speedRow}>{speedOptions.map((option) => (
          <Pressable key={option} onPress={() => changeSpeed(option)} style={[styles.speedChip, speed === option && styles.speedChipActive]}>
            <Text style={[styles.speedText, speed === option && styles.speedTextActive]}>{option.toFixed(option === 1 || option === 2 ? 1 : 2)}x</Text>
          </Pressable>
        ))}</View>
        <Pressable onPress={() => navigation.replace('AnalysisLoading', { videoUri, club: route.params.club, cameraAngle: route.params.cameraAngle })} style={styles.analysisButton}>
          <Text style={styles.analysisButtonText}>この動画を分析する</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#111827', flex: 1 },
  topBar: { alignItems: 'center', backgroundColor: 'rgba(17,24,39,0.92)', flexDirection: 'row', gap: spacing.sm, justifyContent: 'space-between', paddingHorizontal: spacing.md, paddingBottom: spacing.sm },
  topButton: { backgroundColor: 'rgba(255,255,255,0.16)', borderRadius: radius.pill, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  topButtonActive: { backgroundColor: colors.pink },
  topButtonText: { color: colors.surface, fontSize: 13, fontWeight: '900' },
  topButtonActiveText: { color: colors.surface },
  videoWrap: { backgroundColor: '#000', flex: 1, overflow: 'hidden' },
  controls: { backgroundColor: 'rgba(17,24,39,0.96)', gap: spacing.md, padding: spacing.md },
  playRow: { alignItems: 'center', flexDirection: 'row', gap: spacing.md },
  playButton: { alignItems: 'center', backgroundColor: colors.pink, borderRadius: radius.pill, height: 52, justifyContent: 'center', width: 86 },
  playText: { color: colors.surface, fontSize: 15, fontWeight: '900' },
  timeText: { color: colors.surface, flex: 1, fontSize: 15, fontWeight: '800', textAlign: 'right' },
  seekTrack: { backgroundColor: 'rgba(255,255,255,0.28)', borderRadius: radius.pill, height: 12, justifyContent: 'center' },
  seekFill: { backgroundColor: colors.pink, borderRadius: radius.pill, bottom: 0, left: 0, position: 'absolute', top: 0 },
  seekThumb: { backgroundColor: colors.surface, borderRadius: 14, height: 28, marginLeft: -14, position: 'absolute', width: 28 },
  sectionLabel: { color: colors.surface, fontSize: 13, fontWeight: '900' },
  speedRow: { flexDirection: 'row', gap: spacing.sm },
  speedChip: { backgroundColor: 'rgba(255,255,255,0.14)', borderColor: 'rgba(255,255,255,0.24)', borderRadius: radius.pill, borderWidth: 1, flex: 1, paddingVertical: spacing.sm },
  speedChipActive: { backgroundColor: colors.lavender, borderColor: colors.lavender },
  speedText: { color: colors.surface, fontWeight: '900', textAlign: 'center' },
  speedTextActive: { color: colors.surface },
  analysisButton: { alignItems: 'center', backgroundColor: colors.mint, borderRadius: radius.pill, paddingVertical: spacing.md },
  analysisButtonText: { color: colors.surface, fontSize: 15, fontWeight: '900' },
});
