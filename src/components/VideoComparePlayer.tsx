import React, { useRef, useState } from 'react';
import { GestureResponderEvent, LayoutChangeEvent, Pressable, StyleSheet, Text, View } from 'react-native';
import { ResizeMode, Video } from 'expo-av';
import Svg, { Line } from 'react-native-svg';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { DUMMY_VIDEO_URI } from '../services/analysisService';
import { EditedSwingVideo, VideoDisplaySize } from '../types/swing';

type Props = {
  currentUri?: string;
  bestUri?: string;
  currentEditedVideo?: EditedSwingVideo | null;
  bestEditedVideo?: EditedSwingVideo | null;
};

type Mode = 'sideBySide' | 'overlay';
type VideoRect = VideoDisplaySize & { x: number; y: number };
type OverlayAdjust = { x: number; y: number; scale: number };

const opacityOptions = [0, 0.25, 0.5, 0.75];
const speedOptions = [0.25, 0.5, 1.0];
const adjustStep = 12;
const scaleStep = 0.1;

const formatTime = (millis: number) => {
  const totalSeconds = Math.floor(millis / 1000);
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
};

const getPlayableDuration = (currentDuration: number, bestDuration: number) => {
  const durations = [currentDuration, bestDuration].filter((duration) => duration > 1);
  return durations.length ? Math.min(...durations) : 1;
};

const getSeekPercent = (position: number, duration: number) => Math.min(100, Math.max(0, (position / Math.max(1, duration)) * 100));

const getContainVideoRect = (displaySize: VideoDisplaySize, naturalSize?: VideoDisplaySize): VideoRect => {
  if (!naturalSize?.width || !naturalSize.height || !displaySize.width || !displaySize.height) {
    return { x: 0, y: 0, width: Math.max(1, displaySize.width), height: Math.max(1, displaySize.height) };
  }

  const displayAspectRatio = displaySize.width / displaySize.height;
  const videoAspectRatio = naturalSize.width / naturalSize.height;

  if (displayAspectRatio > videoAspectRatio) {
    const height = displaySize.height;
    const width = height * videoAspectRatio;
    return { x: (displaySize.width - width) / 2, y: 0, width, height };
  }

  const width = displaySize.width;
  const height = width / videoAspectRatio;
  return { x: 0, y: (displaySize.height - height) / 2, width, height };
};

const getCoverVideoRect = (displaySize: VideoDisplaySize, naturalSize?: VideoDisplaySize): VideoRect => {
  if (!naturalSize?.width || !naturalSize.height || !displaySize.width || !displaySize.height) {
    return { x: 0, y: 0, width: Math.max(1, displaySize.width), height: Math.max(1, displaySize.height) };
  }

  const displayAspectRatio = displaySize.width / displaySize.height;
  const videoAspectRatio = naturalSize.width / naturalSize.height;

  if (displayAspectRatio > videoAspectRatio) {
    const width = displaySize.width;
    const height = width / videoAspectRatio;
    return { x: 0, y: (displaySize.height - height) / 2, width, height };
  }

  const height = displaySize.height;
  const width = height * videoAspectRatio;
  return { x: (displaySize.width - width) / 2, y: 0, width, height };
};

export function VideoComparePlayer({ currentUri = DUMMY_VIDEO_URI, bestUri = DUMMY_VIDEO_URI, currentEditedVideo, bestEditedVideo }: Props) {
  const [mode, setMode] = useState<Mode>('sideBySide');
  const [opacity, setOpacity] = useState(0.5);
  const [speed, setSpeed] = useState(1.0);
  const [playing, setPlaying] = useState(false);
  const [finished, setFinished] = useState(false);
  const [guideVisible, setGuideVisible] = useState(true);
  const [currentLayout, setCurrentLayout] = useState<VideoDisplaySize>({ height: 1, width: 1 });
  const [bestLayout, setBestLayout] = useState<VideoDisplaySize>({ height: 1, width: 1 });
  const [seekWidth, setSeekWidth] = useState(1);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [bestPosition, setBestPosition] = useState(0);
  const [currentDuration, setCurrentDuration] = useState(1);
  const [bestDuration, setBestDuration] = useState(1);
  const [overlayAdjust, setOverlayAdjust] = useState<OverlayAdjust>({ x: 0, y: 0, scale: 1 });
  const currentRef = useRef<Video>(null);
  const bestRef = useRef<Video>(null);

  const playableDuration = getPlayableDuration(currentDuration, bestDuration);
  const displayPosition = Math.min(currentPosition, bestPosition || currentPosition, playableDuration);

  const togglePlay = async () => {
    const refs = [currentRef.current, bestRef.current];
    if (playing) {
      await Promise.all(refs.map((ref) => ref?.pauseAsync()));
      setPlaying(false);
      return;
    }
    if (finished || displayPosition >= playableDuration - 250) {
      await Promise.all(refs.map((ref) => ref?.setPositionAsync(0)));
      setCurrentPosition(0);
      setBestPosition(0);
      setFinished(false);
    }
    await Promise.all(refs.map((ref) => ref?.setRateAsync(speed, true)));
    await Promise.all(refs.map((ref) => ref?.playAsync()));
    setPlaying(true);
  };

  const changeSpeed = async (nextSpeed: number) => {
    setSpeed(nextSpeed);
    await Promise.all([currentRef.current, bestRef.current].map((ref) => ref?.setRateAsync(nextSpeed, true)));
  };

  const seekTo = async (x: number) => {
    const nextPosition = Math.max(0, Math.min(1, x / seekWidth)) * playableDuration;
    await Promise.all([currentRef.current, bestRef.current].map((ref) => ref?.setPositionAsync(nextPosition)));
    setCurrentPosition(nextPosition);
    setBestPosition(nextPosition);
    setFinished(false);
  };

  const updateOverlayAdjust = (nextAdjust: Partial<OverlayAdjust>) => setOverlayAdjust((current: OverlayAdjust) => ({ ...current, ...nextAdjust }));
  const resetOverlayAdjust = () => setOverlayAdjust({ x: 0, y: 0, scale: 1 });

  const handleStatusUpdate = (side: 'current' | 'best', status: any) => {
    if (!status?.isLoaded) return;
    const nextPosition = Math.min(status.positionMillis || 0, playableDuration);
    if (side === 'current') {
      setCurrentPosition(nextPosition);
      setCurrentDuration(status.durationMillis || 1);
    } else {
      setBestPosition(nextPosition);
      setBestDuration(status.durationMillis || 1);
    }
    if (status.didJustFinish || nextPosition >= playableDuration - 250) {
      setPlaying(false);
      setFinished(true);
    }
  };

  const renderGuideLines = (editedVideo: EditedSwingVideo | null | undefined, layout: VideoDisplaySize, faded?: boolean) => {
    if (!guideVisible || !editedVideo?.drawnLines.length) return null;

    const naturalSize = editedVideo.videoNaturalSize ?? editedVideo.videoDisplaySize;
    const sourceRect = getContainVideoRect(editedVideo.videoDisplaySize, editedVideo.videoNaturalSize);
    const targetRect = getCoverVideoRect(layout, naturalSize);

    return (
      <Svg height="100%" style={StyleSheet.absoluteFill} width="100%">
        {editedVideo.drawnLines.map((line, index) => {
          const x1 = targetRect.x + ((line.startX - sourceRect.x) / Math.max(1, sourceRect.width)) * targetRect.width;
          const y1 = targetRect.y + ((line.startY - sourceRect.y) / Math.max(1, sourceRect.height)) * targetRect.height;
          const x2 = targetRect.x + ((line.endX - sourceRect.x) / Math.max(1, sourceRect.width)) * targetRect.width;
          const y2 = targetRect.y + ((line.endY - sourceRect.y) / Math.max(1, sourceRect.height)) * targetRect.height;
          return <Line key={`${line.startX}-${line.startY}-${index}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke={line.color} strokeLinecap="round" strokeOpacity={faded ? opacity : 1} strokeWidth={line.strokeWidth} />;
        })}
      </Svg>
    );
  };

  const renderVideoLayer = (
    uri: string,
    label: string,
    faded: boolean | undefined,
    ref: React.RefObject<Video | null>,
    side: 'current' | 'best',
  ) => (
    <>
      <View pointerEvents="none" style={[styles.videoFallback, faded && { opacity }]}>
        <Text style={styles.videoEmoji}>🏌️‍♀️</Text>
        <Text style={styles.videoLabel}>{label}</Text>
      </View>
      <Video
        ref={ref}
        source={{ uri }}
        resizeMode={ResizeMode.COVER}
        shouldPlay={false}
        style={[StyleSheet.absoluteFill, faded && { opacity }]}
        onPlaybackStatusUpdate={(status: any) => handleStatusUpdate(side, status)}
      />
    </>
  );

  const renderVideo = (
    uri: string,
    label: string,
    faded: boolean | undefined,
    ref: React.RefObject<Video | null>,
    side: 'current' | 'best',
    editedVideo: EditedSwingVideo | null | undefined,
    layout: VideoDisplaySize,
    onLayout: (event: LayoutChangeEvent) => void,
  ) => (
    <View style={styles.videoBox} onLayout={onLayout}>
      {renderVideoLayer(uri, label, faded, ref, side)}
      {renderGuideLines(editedVideo, layout, faded)}
    </View>
  );

  return (
    <View style={styles.card}>
      <Text style={styles.description}>過去のベストを基準に、現在のスイングを重ねて確認しよう</Text>
      <View style={styles.segment}>
        <Pressable onPress={() => setMode('sideBySide')} style={[styles.segmentButton, mode === 'sideBySide' && styles.active]}>
          <Text style={[styles.segmentText, mode === 'sideBySide' && styles.activeText]}>横並び比較</Text>
        </Pressable>
        <Pressable onPress={() => setMode('overlay')} style={[styles.segmentButton, mode === 'overlay' && styles.active]}>
          <Text style={[styles.segmentText, mode === 'overlay' && styles.activeText]}>重ね比較</Text>
        </Pressable>
      </View>
      <Pressable onPress={() => setGuideVisible((current: boolean) => !current)} style={[styles.guideToggle, guideVisible && styles.guideToggleActive]}>
        <Text style={[styles.guideToggleText, guideVisible && styles.guideToggleTextActive]}>補助線 {guideVisible ? 'ON' : 'OFF'}</Text>
      </Pressable>

      {mode === 'sideBySide' ? (
        <View style={styles.sideBySide}>
          {renderVideo(currentUri, '現在のスイング', false, currentRef, 'current', currentEditedVideo, currentLayout, (event) => setCurrentLayout({ height: event.nativeEvent.layout.height || 1, width: event.nativeEvent.layout.width || 1 }))}
          {renderVideo(bestUri, '過去のベスト', true, bestRef, 'best', bestEditedVideo, bestLayout, (event) => setBestLayout({ height: event.nativeEvent.layout.height || 1, width: event.nativeEvent.layout.width || 1 }))}
        </View>
      ) : (
        <>
          <View style={styles.overlayBox} onLayout={(event: LayoutChangeEvent) => { const layout = { height: event.nativeEvent.layout.height || 1, width: event.nativeEvent.layout.width || 1 }; setCurrentLayout(layout); setBestLayout(layout); }}>
            <View style={StyleSheet.absoluteFill}>{renderVideoLayer(bestUri, '過去のベスト', false, bestRef, 'best')}</View>
            {renderGuideLines(bestEditedVideo, bestLayout)}
            <View style={[StyleSheet.absoluteFill, { opacity, transform: [{ translateX: overlayAdjust.x }, { translateY: overlayAdjust.y }, { scale: overlayAdjust.scale }] }]}>
              {renderVideoLayer(currentUri, '現在のスイング（半透明）', false, currentRef, 'current')}
              {renderGuideLines(currentEditedVideo, currentLayout)}
            </View>
          </View>
          <Text style={styles.controlLabel}>現在のスイング位置調整</Text>
          <View style={styles.adjustGrid}>
            <Pressable onPress={() => updateOverlayAdjust({ y: overlayAdjust.y - adjustStep })} style={styles.adjustButton}><Text style={styles.adjustText}>上へ</Text></Pressable>
            <Pressable onPress={() => updateOverlayAdjust({ x: overlayAdjust.x - adjustStep })} style={styles.adjustButton}><Text style={styles.adjustText}>左へ</Text></Pressable>
            <Pressable onPress={resetOverlayAdjust} style={[styles.adjustButton, styles.resetButton]}><Text style={styles.adjustText}>リセット</Text></Pressable>
            <Pressable onPress={() => updateOverlayAdjust({ x: overlayAdjust.x + adjustStep })} style={styles.adjustButton}><Text style={styles.adjustText}>右へ</Text></Pressable>
            <Pressable onPress={() => updateOverlayAdjust({ y: overlayAdjust.y + adjustStep })} style={styles.adjustButton}><Text style={styles.adjustText}>下へ</Text></Pressable>
            <Pressable onPress={() => updateOverlayAdjust({ scale: Math.max(0.6, overlayAdjust.scale - scaleStep) })} style={styles.adjustButton}><Text style={styles.adjustText}>縮小</Text></Pressable>
            <Pressable onPress={() => updateOverlayAdjust({ scale: Math.min(1.6, overlayAdjust.scale + scaleStep) })} style={styles.adjustButton}><Text style={styles.adjustText}>拡大</Text></Pressable>
          </View>
        </>
      )}

      <View style={styles.seekHeader}>
        <Text style={styles.controlLabel}>共通シーク</Text>
        <Text style={styles.timeText}>{formatTime(displayPosition)} / {formatTime(playableDuration)}</Text>
      </View>
      <Pressable style={styles.seekTrack} onLayout={(event: LayoutChangeEvent) => setSeekWidth(event.nativeEvent.layout.width || 1)} onPress={(event: GestureResponderEvent) => seekTo(event.nativeEvent.locationX)}>
        <View style={[styles.seekFill, { width: `${getSeekPercent(displayPosition, playableDuration)}%` }]} />
        <View style={[styles.seekThumb, { left: `${Math.min(98, getSeekPercent(displayPosition, playableDuration))}%` }]} />
      </Pressable>

      <Text style={styles.controlLabel}>{mode === 'overlay' ? '現在動画の透明度' : '透明度'}</Text>
      <View style={styles.options}>{opacityOptions.map((option) => (
        <Pressable key={option} onPress={() => setOpacity(option)} style={[styles.chip, opacity === option && styles.chipActive]}>
          <Text style={[styles.chipText, opacity === option && styles.chipActiveText]}>{Math.round(option * 100)}%</Text>
        </Pressable>
      ))}</View>

      <Text style={styles.controlLabel}>再生速度</Text>
      <View style={styles.options}>{speedOptions.map((option) => (
        <Pressable key={option} onPress={() => changeSpeed(option)} style={[styles.chip, speed === option && styles.chipActive]}>
          <Text style={[styles.chipText, speed === option && styles.chipActiveText]}>{option.toFixed(option === 1 ? 1 : 2)}x</Text>
        </Pressable>
      ))}</View>

      <Pressable onPress={togglePlay} style={styles.playButton}>
        <Text style={styles.playText}>{playing ? '停止' : '再生'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg, borderWidth: 1, padding: spacing.md },
  description: { color: colors.text, fontSize: 14, fontWeight: '800', lineHeight: 21, textAlign: 'center' },
  segment: { backgroundColor: colors.pinkLight, borderRadius: radius.pill, flexDirection: 'row', marginVertical: spacing.md, padding: 3 },
  segmentButton: { alignItems: 'center', borderRadius: radius.pill, flex: 1, paddingVertical: spacing.sm },
  active: { backgroundColor: colors.pink },
  segmentText: { color: colors.muted, fontWeight: '800' },
  activeText: { color: colors.surface },
  guideToggle: { alignSelf: 'center', backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.pill, borderWidth: 1, marginBottom: spacing.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  guideToggleActive: { backgroundColor: colors.mint, borderColor: colors.mint },
  guideToggleText: { color: colors.muted, fontWeight: '900' },
  guideToggleTextActive: { color: colors.surface },
  sideBySide: { flexDirection: 'row', gap: spacing.sm },
  overlayBox: { backgroundColor: '#DCEEEA', borderRadius: radius.md, height: 360, overflow: 'hidden' },
  videoBox: { backgroundColor: '#DCEEEA', borderRadius: radius.md, flex: 1, height: 300, overflow: 'hidden' },
  videoFallback: { alignItems: 'center', backgroundColor: 'rgba(123,216,190,0.25)', bottom: 0, justifyContent: 'center', left: 0, position: 'absolute', right: 0, top: 0 },
  videoEmoji: { fontSize: 38 },
  videoLabel: { color: colors.text, fontSize: 12, fontWeight: '900', marginTop: spacing.sm },
  controlLabel: { color: colors.text, fontSize: 13, fontWeight: '900', marginTop: spacing.md },
  seekHeader: { alignItems: 'flex-end', flexDirection: 'row', justifyContent: 'space-between' },
  timeText: { color: colors.muted, fontSize: 12, fontWeight: '900' },
  seekTrack: { backgroundColor: colors.pinkLight, borderRadius: radius.pill, height: 12, justifyContent: 'center', marginTop: spacing.sm },
  seekFill: { backgroundColor: colors.pink, borderRadius: radius.pill, bottom: 0, left: 0, position: 'absolute', top: 0 },
  seekThumb: { backgroundColor: colors.surface, borderColor: colors.pink, borderRadius: 12, borderWidth: 2, height: 24, marginLeft: -12, position: 'absolute', width: 24 },
  adjustGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.sm },
  adjustButton: { alignItems: 'center', backgroundColor: colors.pinkLight, borderColor: colors.border, borderRadius: radius.pill, borderWidth: 1, minWidth: 74, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  resetButton: { backgroundColor: colors.lavender },
  adjustText: { color: colors.text, fontSize: 12, fontWeight: '900' },
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.sm },
  chip: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.pill, borderWidth: 1, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  chipActive: { backgroundColor: colors.lavender, borderColor: colors.lavender },
  chipText: { color: colors.muted, fontWeight: '800' },
  chipActiveText: { color: colors.surface },
  playButton: { alignItems: 'center', alignSelf: 'center', backgroundColor: colors.pink, borderRadius: 36, height: 72, justifyContent: 'center', marginTop: spacing.md, width: 72 },
  playText: { color: colors.surface, fontWeight: '900' },
});
