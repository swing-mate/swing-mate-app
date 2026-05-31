import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PastelButton } from '../components/PastelButton';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { RootStackParamList } from '../types/navigation';

export function OnboardingScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'Onboarding'>) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.course}>
        <Text style={styles.flag}>⛳️</Text>
        <Text style={styles.english}>Swing Mate</Text>
        <Text style={styles.title}>スイングメイト</Text>
        <Text style={styles.catch}>かわいいキャディとスイング上達</Text>
        <Text style={styles.description}>スイングメイトは、かわいいキャディに応援してもらいながら、スイングを撮影・分析・比較できるゴルフ練習サポートアプリです。</Text>
        <View style={styles.characters}><Text style={styles.avatar}>🌿</Text><Text style={styles.avatar}>💗</Text><Text style={styles.avatar}>💜</Text></View>
      </View>
      <PastelButton label="はじめる" onPress={() => navigation.replace('CharacterSelect')} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.background, flexGrow: 1, justifyContent: 'center', padding: spacing.lg, gap: spacing.xl },
  course: { alignItems: 'center', backgroundColor: colors.mintLight, borderRadius: radius.lg, padding: spacing.xl, borderColor: colors.border, borderWidth: 1 },
  flag: { fontSize: 54 },
  english: { color: colors.mint, fontSize: 18, fontWeight: '900' },
  title: { color: colors.pink, fontSize: 34, fontWeight: '900', marginTop: spacing.sm },
  catch: { color: colors.lavender, fontSize: 20, fontWeight: '900', marginTop: spacing.sm, textAlign: 'center' },
  description: { color: colors.text, fontSize: 15, fontWeight: '600', lineHeight: 24, marginTop: spacing.lg, textAlign: 'center' },
  characters: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.xl },
  avatar: { backgroundColor: colors.surface, borderRadius: 36, fontSize: 36, overflow: 'hidden', padding: spacing.md },
});
