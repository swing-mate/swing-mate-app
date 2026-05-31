import React, { useRef, useState } from 'react';
import { FlatList, Image, ImageSourcePropType, NativeScrollEvent, NativeSyntheticEvent, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring } from 'react-native-reanimated';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PastelButton } from '../components/PastelButton';
import { characters } from '../data/characters';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { Character, CharacterId } from '../types/character';
import { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'CharacterSelect'> & {
  selectedCharacterId: CharacterId | null;
  onSelectCharacter: (id: CharacterId) => Promise<void>;
};

const characterImageSources: Partial<Record<CharacterId, ImageSourcePropType>> = {};
// 後から画像を追加する場合は assets/characters/mimi.png / rina.png / yuna.png を配置し、ここに require を追加します。

export function CharacterSelectScreen({ navigation, selectedCharacterId, onSelectCharacter }: Props) {
  const initialIndex = Math.max(0, characters.findIndex((character) => character.id === selectedCharacterId));
  const [selectedIndex, setSelectedIndex] = useState(initialIndex);
  const { width } = useWindowDimensions();
  const listRef = useRef<FlatList<Character>>(null);
  const bounceScale = useSharedValue(1);
  const cardWidth = Math.min(width * 0.78, 340);
  const snapInterval = cardWidth + spacing.md;
  const selected = characters[selectedIndex] ?? characters[0];

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: bounceScale.value }],
  }));

  const handleConfirm = async () => {
    await onSelectCharacter(selected.id);
    navigation.replace('MainTabs', { screen: 'Home' });
  };

  const bounceCard = () => {
    bounceScale.value = withSequence(
      withSpring(1.04, { damping: 8, stiffness: 220 }),
      withSpring(1, { damping: 9, stiffness: 180 }),
    );
  };

  const handleMomentumEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const nextIndex = Math.round(event.nativeEvent.contentOffset.x / snapInterval);
    setSelectedIndex(Math.min(characters.length - 1, Math.max(0, nextIndex)));
  };

  const handleCardPress = (index: number) => {
    setSelectedIndex(index);
    listRef.current?.scrollToIndex({ index, animated: true });
    bounceCard();
  };

  return (
    <View style={styles.container}>
      <View style={styles.sky} />
      <View style={styles.clubHouse}>
        <Text style={styles.clubHouseText}>Swing Mate Club</Text>
        <View style={styles.windowRow}><View style={styles.window} /><View style={styles.window} /><View style={styles.window} /></View>
      </View>
      <View style={styles.green} />
      <View style={styles.fairway} />
      <Text style={styles.flag}>⛳️</Text>

      <View style={styles.header}>
        <Text style={styles.title}>キャディ選択</Text>
        <Text style={styles.subtitle}>一緒にゴルフをサポートしてくれるAIキャディを選んでね</Text>
      </View>

      <FlatList
        ref={listRef}
        data={characters}
        horizontal
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        snapToInterval={snapInterval}
        decelerationRate="fast"
        contentContainerStyle={[styles.carousel, { paddingHorizontal: (width - cardWidth) / 2 }]}
        getItemLayout={(_, index) => ({ length: snapInterval, offset: snapInterval * index, index })}
        initialScrollIndex={initialIndex}
        onMomentumScrollEnd={handleMomentumEnd}
        renderItem={({ item, index }) => {
          const isSelected = selected.id === item.id;
          const imageSource = characterImageSources[item.id];
          return (
            <Pressable onPress={() => handleCardPress(index)} style={[styles.cardWrap, { width: cardWidth, marginRight: spacing.md }]}>
              <Animated.View style={[styles.characterCard, { backgroundColor: item.lightColor, borderColor: isSelected ? item.color : colors.border }, isSelected && cardAnimatedStyle]}>
                <View style={styles.checkBadge}>{isSelected ? <Text style={[styles.checkText, { color: item.color }]}>✓</Text> : <Text style={styles.emptyCheck}>○</Text>}</View>
                <View style={[styles.standeeArea, { borderColor: item.color }]}>
                  <Text style={styles.standeeEmoji}>{item.emoji}</Text>
                  {imageSource ? <Image source={imageSource} style={styles.characterImage} resizeMode="contain" /> : null}
                </View>
                <Text style={[styles.name, { color: item.color }]}>{item.name}</Text>
                <Text style={styles.romanName}>{item.romanName}</Text>
                <Text style={[styles.role, { backgroundColor: item.color }]}>{item.role}</Text>
                <Text style={styles.personality}>{item.personality}・{item.feature}</Text>
                <Text style={styles.tone}>「{item.tone}」</Text>
              </Animated.View>
            </Pressable>
          );
        }}
      />

      <View style={styles.dots}>{characters.map((character, index) => (
        <Pressable key={character.id} onPress={() => handleCardPress(index)} style={[styles.dot, selectedIndex === index && { backgroundColor: character.color, width: 24 }]} />
      ))}</View>

      <View style={styles.footer}>
        <PastelButton label="このキャラで始める" onPress={handleConfirm} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.background, flex: 1, overflow: 'hidden', paddingBottom: spacing.lg, paddingTop: spacing.xxl },
  sky: { backgroundColor: '#DFF4FF', height: '45%', left: 0, position: 'absolute', right: 0, top: 0 },
  clubHouse: { alignItems: 'center', alignSelf: 'center', backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg, borderWidth: 1, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, position: 'absolute', top: 106 },
  clubHouseText: { color: colors.muted, fontSize: 12, fontWeight: '900' },
  windowRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  window: { backgroundColor: colors.lavenderLight, borderColor: colors.border, borderRadius: radius.sm, borderWidth: 1, height: 18, width: 28 },
  green: { backgroundColor: '#BDEACD', borderTopLeftRadius: 320, borderTopRightRadius: 320, bottom: -130, height: '48%', left: -80, position: 'absolute', right: -80 },
  fairway: { alignSelf: 'center', backgroundColor: '#E6F8D8', borderTopLeftRadius: 140, borderTopRightRadius: 140, bottom: -50, height: '36%', position: 'absolute', width: 190 },
  flag: { fontSize: 34, position: 'absolute', right: spacing.xl, top: 174 },
  header: { paddingHorizontal: spacing.lg },
  title: { color: colors.pink, fontSize: 30, fontWeight: '900', textAlign: 'center' },
  subtitle: { color: colors.text, fontSize: 14, fontWeight: '800', lineHeight: 22, marginTop: spacing.sm, textAlign: 'center' },
  carousel: { alignItems: 'center', paddingVertical: spacing.lg },
  cardWrap: { justifyContent: 'center' },
  characterCard: { alignItems: 'center', borderRadius: radius.lg, borderWidth: 3, minHeight: 460, padding: spacing.lg, shadowColor: colors.shadow, shadowOpacity: 0.28, shadowRadius: 16 },
  checkBadge: { alignItems: 'center', alignSelf: 'flex-end', backgroundColor: colors.surface, borderRadius: 18, height: 36, justifyContent: 'center', width: 36 },
  checkText: { fontSize: 24, fontWeight: '900' },
  emptyCheck: { color: colors.muted, fontSize: 18, fontWeight: '900' },
  standeeArea: { alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.72)', borderRadius: 95, borderWidth: 2, height: 190, justifyContent: 'center', marginBottom: spacing.md, overflow: 'hidden', width: 190 },
  standeeEmoji: { fontSize: 82 },
  characterImage: { bottom: 0, height: 190, left: 0, position: 'absolute', right: 0, top: 0, width: 190 },
  name: { fontSize: 30, fontWeight: '900' },
  romanName: { color: colors.muted, fontSize: 14, fontWeight: '800', marginTop: spacing.xs },
  role: { borderRadius: radius.pill, color: colors.surface, fontSize: 13, fontWeight: '900', marginTop: spacing.md, overflow: 'hidden', paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  personality: { color: colors.text, fontSize: 14, fontWeight: '800', lineHeight: 21, marginTop: spacing.md, textAlign: 'center' },
  tone: { color: colors.text, fontSize: 15, fontWeight: '900', lineHeight: 22, marginTop: spacing.md, textAlign: 'center' },
  dots: { alignItems: 'center', flexDirection: 'row', gap: spacing.sm, justifyContent: 'center', marginBottom: spacing.md },
  dot: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.pill, borderWidth: 1, height: 10, width: 10 },
  footer: { paddingHorizontal: spacing.lg },
});
