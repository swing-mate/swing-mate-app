import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CaddieAvatar, CaddieMessage } from '../components/CaddieMessage';
import { getCharacterById } from '../data/characters';
import { caddieGrowthService } from '../services/caddieGrowthService';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { CharacterId } from '../types/character';
import { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'AnalysisLoading'> & { selectedCharacterId: CharacterId | null };

export function AnalysisLoadingScreen({ navigation, route, selectedCharacterId }: Props) {
  const character = getCharacterById(selectedCharacterId);
  const spin = useRef(new Animated.Value(0)).current;
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    Animated.loop(Animated.timing(spin, { toValue: 1, duration: 1100, useNativeDriver: true })).start();
    const interval = setInterval(() => setProgress((value) => Math.min(100, value + 10)), 180);
    const timeout = setTimeout(() => {
      caddieGrowthService.addExp(character.id, 'analysisComplete').finally(() => navigation.replace('AnalysisResult', route.params));
    }, 2000);
    return () => { clearInterval(interval); clearTimeout(timeout); };
  }, [character.id, navigation, route.params, spin]);

  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <View style={styles.container}>
      <CaddieAvatar character={character} size={120} />
      <Text style={styles.title}>分析中…</Text>
      <CaddieMessage character={character} message={character.loadingComment} compact />
      <Animated.View style={[styles.loader, { borderColor: character.lightColor, borderTopColor: character.color, transform: [{ rotate }] }]} />
      <Text style={[styles.percent, { color: character.color }]}>{progress}%</Text>
      <View style={styles.track}><View style={[styles.fill, { width: `${progress}%`, backgroundColor: character.color }]} /></View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', backgroundColor: colors.background, flex: 1, gap: spacing.lg, justifyContent: 'center', padding: spacing.lg },
  title: { color: colors.text, fontSize: 26, fontWeight: '900' },
  loader: { borderRadius: 70, borderWidth: 12, height: 140, width: 140 },
  percent: { fontSize: 34, fontWeight: '900' },
  track: { backgroundColor: colors.surface, borderRadius: radius.pill, height: 14, overflow: 'hidden', width: '100%' },
  fill: { borderRadius: radius.pill, height: 14 },
});
