import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CharacterCard } from '../components/CharacterCard';
import { PastelButton } from '../components/PastelButton';
import { characters } from '../data/characters';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { CharacterId } from '../types/character';
import { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'CharacterSelect'> & {
  selectedCharacterId: CharacterId | null;
  onSelectCharacter: (id: CharacterId) => Promise<void>;
};

export function CharacterSelectScreen({ navigation, selectedCharacterId, onSelectCharacter }: Props) {
  const [selected, setSelected] = useState<CharacterId>(selectedCharacterId ?? 'mimi');
  const handleConfirm = async () => {
    await onSelectCharacter(selected);
    navigation.replace('MainTabs', { screen: 'Home' });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>応援してもらうキャラを選ぶ</Text>
      <Text style={styles.subtitle}>あなたのゴルフを応援してくれるキャディを選んでね</Text>
      <View style={styles.cards}>{characters.map((character) => (
        <CharacterCard key={character.id} character={character} selected={selected === character.id} onPress={() => setSelected(character.id)} />
      ))}</View>
      <PastelButton label="このキャラに決める" onPress={handleConfirm} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.background, flexGrow: 1, padding: spacing.lg, paddingTop: spacing.xxl, gap: spacing.lg },
  title: { color: colors.pink, fontSize: 27, fontWeight: '900', textAlign: 'center' },
  subtitle: { color: colors.text, fontSize: 14, fontWeight: '700', lineHeight: 21, textAlign: 'center' },
  cards: { gap: spacing.md },
});
