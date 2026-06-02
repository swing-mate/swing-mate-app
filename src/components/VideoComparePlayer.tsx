import React, { useRef, useState } from 'react';
import { LayoutChangeEvent, Pressable, StyleSheet, Text, View } from 'react-native';
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

const opacityOptions = [0, 0.25, 0.5, 0.75];
const speedOptions = [0.25, 0.5, 1.0];

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
  const [guideVisible, setGuideVisible] = useState(true);
  const [currentLayout, setCurrentLayout] = useState<VideoDisplaySize>({ height: 1, width: 1 });
  const [bestLayout, setBestLayout] = useState<VideoDisplaySize>({ height: 1, width: 1 });
  const currentRef = useRef<Video>(null);
  const bestRef = useRef<Video>(null);

  const togglePlay = async () => {
    const refs = [currentRef.current, bestRef.current];
    if (playing) {
      await Promise.all(refs.map((ref) => ref?.pauseAsync()));
      setPlaying(false);
      return;
    }
    await Promise.all(refs.map((ref) => ref?.setRateAsync(speed, true)));
    await Promise.all(refs.map((ref) => ref?.playAsync()));
    setPlaying(true);
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

  const renderVideo = (
    uri: string,
    label: string,
    faded: boolean | undefined,
    ref: React.RefObject<Video | null>,
    editedVideo: EditedSwingVideo | null | undefined,
    layout: VideoDisplaySize,
    onLayout: (event: LayoutChangeEvent) => void,
  ) => (
    <View style={styles.videoBox} onLayout={onLayout}>
      <Video
        ref={ref}
        source={{ uri }}
        resizeMode={ResizeMode.COVER}
        isLooping
        shouldPlay={false}
        style={[StyleSheet.absoluteFill, faded && { opacity }]}
      />
      <View style={[styles.videoFallback, faded && { opacity }]}>
        <Text style={styles.videoEmoji}>🏌️‍♀️</Text>
        <Text style={styles.videoLabel}>{label}</Text>
      </View>
      {renderGuideLines(editedVideo, layout, faded)}
    </View>
  );

  return (
    <View style={styles.card}>
      <Text style={styles.description}>過去のベストを薄く重ねて、フォームの違いを確認しよう</Text>
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
          {renderVideo(currentUri, '現在のスイング', false, currentRef, currentEditedVideo, currentLayout, (event) => setCurrentLayout({ height: event.nativeEvent.layout.height || 1, width: event.nativeEvent.layout.width || 1 }))}
          {renderVideo(bestUri, '過去のベスト', true, bestRef, bestEditedVideo, bestLayout, (event) => setBestLayout({ height: event.nativeEvent.layout.height || 1, width: event.nativeEvent.layout.width || 1 }))}
        </View>
      ) : (
        <View style={styles.overlayBox}>
          {renderVideo(currentUri, '現在のスイング', false, currentRef, undefined, currentLayout, (event) => setCurrentLayout({ height: event.nativeEvent.layout.height || 1, width: event.nativeEvent.layout.width || 1 }))}
          <View style={StyleSheet.absoluteFill}>{renderVideo(bestUri, '過去のベスト（半透明）', true, bestRef, bestEditedVideo, bestLayout, (event) => setBestLayout({ height: event.nativeEvent.layout.height || 1, width: event.nativeEvent.layout.width || 1 }))}</View>
          {renderGuideLines(currentEditedVideo, currentLayout)}
        </View>
      )}

      <Text style={styles.controlLabel}>透明度</Text>
      <View style={styles.options}>{opacityOptions.map((option) => (
        <Pressable key={option} onPress={() => setOpacity(option)} style={[styles.chip, opacity === option && styles.chipActive]}>
          <Text style={[styles.chipText, opacity === option && styles.chipActiveText]}>{Math.round(option * 100)}%</Text>
        </Pressable>
      ))}</View>

      <Text style={styles.controlLabel}>再生速度</Text>
      <View style={styles.options}>{speedOptions.map((option) => (
        <Pressable key={option} onPress={() => setSpeed(option)} style={[styles.chip, speed === option && styles.chipActive]}>
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
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.md,
  },
  description: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 21,
    textAlign: 'center',
  },
  segment: {
    backgroundColor: colors.pinkLight,
    borderRadius: radius.pill,
    flexDirection: 'row',
    marginVertical: spacing.md,
    padding: 3,
  },
  segmentButton: {
    alignItems: 'center',
    borderRadius: radius.pill,
    flex: 1,
    paddingVertical: spacing.sm,
  },
  active: {
    backgroundColor: colors.pink,
  },
  segmentText: {
    color: colors.muted,
    fontWeight: '800',
  },
  activeText: {
    color: colors.surface,
  },
  guideToggle: {
    alignSelf: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.pill,
    borderWidth: 1,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  guideToggleActive: {
    backgroundColor: colors.mint,
    borderColor: colors.mint,
  },
  guideToggleText: {
    color: colors.muted,
    fontWeight: '900',
  },
  guideToggleTextActive: {
    color: colors.surface,
  },
  sideBySide: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  overlayBox: {
    height: 300,
  },
  videoBox: {
    backgroundColor: '#DCEEEA',
    borderRadius: radius.md,
    flex: 1,
    height: 300,
    overflow: 'hidden',
  },
  videoFallback: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    alignItems: 'center',
    backgroundColor: 'rgba(123,216,190,0.25)',
    justifyContent: 'center',
  },
  videoEmoji: {
    fontSize: 38,
  },
  videoLabel: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '900',
    marginTop: spacing.sm,
  },
  controlLabel: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '900',
    marginTop: spacing.md,
  },
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  chip: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  chipActive: {
    backgroundColor: colors.lavender,
    borderColor: colors.lavender,
  },
  chipText: {
    color: colors.muted,
    fontWeight: '800',
  },
  chipActiveText: {
    color: colors.surface,
  },
  playButton: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: colors.pink,
    borderRadius: 36,
    height: 72,
    justifyContent: 'center',
    marginTop: spacing.md,
    width: 72,
  },
  playText: {
    color: colors.surface,
    fontWeight: '900',
  },
});
