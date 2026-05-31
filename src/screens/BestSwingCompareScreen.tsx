import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CaddieMessage } from '../components/CaddieMessage';
import { PastelButton } from '../components/PastelButton';
import { VideoComparePlayer } from '../components/VideoComparePlayer';
import { getCharacterById } from '../data/characters';
import { DUMMY_VIDEO_URI } from '../services/analysisService';
import { storageService } from '../services/storageService';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { CharacterId } from '../types/character';
import { RootStackParamList } from '../types/navigation';
import { SwingHistory } from '../types/swing';

type Props = NativeStackScreenProps<RootStackParamList, 'BestCompare'> & { selectedCharacterId: CharacterId | null };

export function BestSwingCompareScreen({ navigation, route, selectedCharacterId }: Props) {
  const character = getCharacterById(selectedCharacterId);
  const [bestSwing, setBestSwing] = useState<SwingHistory | null>(null);

  useFocusEffect(useCallback(() => {
    let mounted = true;
    storageService.getBestSwing().then((best) => { if (mounted) setBestSwing(best); });
    return () => { mounted = false; };
  }, []));

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>ベストスイング比較</Text>
      <CaddieMessage character={character} message={character.compareComment} compact />
      {bestSwing ? (
        <VideoComparePlayer currentUri={route.params?.currentVideoUri || DUMMY_VIDEO_URI} bestUri={bestSwing.videoUri} />
      ) : (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>まだベストスイングがありません</Text>
          <Text style={styles.emptyText}>まずはスイングを記録しましょう</Text>
          <PastelButton label="スイングを記録する" onPress={() => navigation.navigate('MainTabs', { screen: 'Record' })} />
          <VideoComparePlayer currentUri={route.params?.currentVideoUri || DUMMY_VIDEO_URI} bestUri={DUMMY_VIDEO_URI} />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.background, padding: spacing.lg, gap: spacing.md },
  title: { color: colors.text, fontSize: 24, fontWeight: '900', textAlign: 'center' },
  emptyCard: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg, borderWidth: 1, gap: spacing.md, padding: spacing.lg },
  emptyTitle: { color: colors.pink, fontSize: 20, fontWeight: '900', textAlign: 'center' },
  emptyText: { color: colors.muted, fontSize: 14, fontWeight: '800', textAlign: 'center' },
});
