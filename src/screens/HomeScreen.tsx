import React, { useEffect, useState } from 'react';
import { Alert, Image, ImageSourcePropType, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { cancelAnimation, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withSpring, withTiming } from 'react-native-reanimated';
import * as ImagePicker from 'expo-image-picker';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PastelButton } from '../components/PastelButton';
import { getCharacterById } from '../data/characters';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { CharacterId } from '../types/character';
import { RootStackParamList, TabParamList } from '../types/navigation';

declare const require: (path: string) => ImageSourcePropType;

type Props = CompositeScreenProps<BottomTabScreenProps<TabParamList, 'Home'>, NativeStackScreenProps<RootStackParamList>> & { selectedCharacterId: CharacterId | null };

const characterImageSources: Record<CharacterId, ImageSourcePropType> = {
  mimi: require('../../assets/characters/mimi.png'),
  rina: require('../../assets/characters/rina.png'),
  yuna: require('../../assets/characters/yuna.png'),
};

export function HomeScreen({ navigation, selectedCharacterId }: Props) {
  const character = getCharacterById(selectedCharacterId);
  const floatY = useSharedValue(0);
  const bounceScale = useSharedValue(1);
  const [messageIndex, setMessageIndex] = useState(0);
  const [imageLoadFailed, setImageLoadFailed] = useState(false);
  const messages = [character.homeComment, character.comment, character.tone, character.compareComment];
  const characterImageSource = characterImageSources[character.id];

  useEffect(() => {
    floatY.value = withRepeat(
      withSequence(
        withTiming(-10, { duration: 1400 }),
        withTiming(0, { duration: 1400 }),
      ),
      -1,
      false,
    );

    return () => cancelAnimation(floatY);
  }, [floatY]);

  const characterAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: floatY.value }, { scale: bounceScale.value }],
  }));

  useEffect(() => {
    setMessageIndex(0);
    setImageLoadFailed(false);
  }, [selectedCharacterId]);

  const handleCharacterPress = () => {
    setMessageIndex((current: number) => (current + 1) % messages.length);
    bounceScale.value = withSequence(
      withSpring(1.08, { damping: 8, stiffness: 220 }),
      withSpring(1, { damping: 9, stiffness: 180 }),
    );
  };

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
      navigation.getParent()?.navigate('AnalysisLoading', {
        videoUri: result.assets[0].uri,
        club: '7番アイアン',
        cameraAngle: 'front',
      });
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.homeTitle}>ホーム</Text>
      <View style={styles.scene}>
        <View style={styles.sky} />
        <View style={styles.clubHouse}>
          <View style={styles.windowRow}>
            <View style={styles.window} />
            <View style={styles.window} />
            <View style={styles.window} />
            <View style={styles.window} />
          </View>
        </View>
        <View style={styles.green} />
        <View style={styles.fairway} />
        <Text style={styles.flag}>⛳️</Text>
        <View style={[styles.sun, { backgroundColor: character.lightColor }]} />

        <View style={[styles.speechBubble, { backgroundColor: character.lightColor, borderColor: character.color }]}>
          <Text style={[styles.speechName, { color: character.color }]}>{character.name}</Text>
          <Text style={styles.speechText}>{messages[messageIndex]}</Text>
        </View>

        <Pressable onPress={handleCharacterPress} style={styles.characterPressable}>
          <Animated.View style={[styles.standee, characterAnimatedStyle]}>
            <View style={styles.standeeBody}>
              {!imageLoadFailed ? <Image source={characterImageSource} style={styles.characterImage} resizeMode="contain" onError={() => setImageLoadFailed(true)} /> : (
                <View style={[styles.placeholderStandee, { backgroundColor: character.lightColor, borderColor: character.color }]}>
                  <Text style={styles.standeeEmoji}>{character.emoji}</Text>
                  <Text style={[styles.standeeName, { color: character.color }]}>{character.name}</Text>
                  <Text style={styles.standeeRole}>{character.role}</Text>
                </View>
              )}
            </View>
          </Animated.View>
        </Pressable>
      </View>

      <View style={styles.actionCard}>
        <Text style={styles.actionTitle}>今日の練習をはじめよう</Text>
        <PastelButton label="撮影する" onPress={() => navigation.navigate('Record')} />
        <PastelButton label="動画を選択" onPress={pickVideo} variant="ghost" />
        <PastelButton label="ベストスイングと比較" onPress={() => navigation.getParent()?.navigate('BestCompare')} variant="secondary" />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.background, flexGrow: 1, gap: spacing.md },
  homeTitle: { color: colors.text, fontSize: 24, fontWeight: '900', paddingHorizontal: spacing.lg, paddingTop: spacing.lg, textAlign: 'center' },
  scene: { backgroundColor: colors.mintLight, height: 620, overflow: 'hidden' },
  sky: { backgroundColor: '#DFF4FF', height: 300, left: 0, position: 'absolute', right: 0, top: 0 },
  clubHouse: { alignItems: 'center', alignSelf: 'center', backgroundColor: 'rgba(255,255,255,0.45)', borderColor: 'rgba(255,255,255,0.75)', borderRadius: radius.lg, borderWidth: 1, height: 130, justifyContent: 'center', paddingHorizontal: spacing.lg, position: 'absolute', top: 74, width: '72%' },
  windowRow: { flexDirection: 'row', gap: spacing.sm },
  window: { backgroundColor: 'rgba(239,234,253,0.82)', borderColor: colors.surface, borderRadius: radius.sm, borderWidth: 1, height: 42, width: 38 },
  green: { backgroundColor: '#BDEACD', borderTopLeftRadius: 300, borderTopRightRadius: 300, bottom: -120, height: 390, left: -80, position: 'absolute', right: -80 },
  fairway: { alignSelf: 'center', backgroundColor: '#E6F8D8', borderTopLeftRadius: 150, borderTopRightRadius: 150, bottom: -52, height: 300, position: 'absolute', width: 210 },
  flag: { fontSize: 34, position: 'absolute', right: 28, top: 300 },
  sun: { borderRadius: 40, height: 80, left: 28, opacity: 0.8, position: 'absolute', top: 30, width: 80 },
  speechBubble: { borderRadius: radius.lg, borderWidth: 2, left: spacing.lg, padding: spacing.md, position: 'absolute', right: spacing.lg, top: 18, zIndex: 4 },
  speechName: { fontSize: 15, fontWeight: '900', marginBottom: spacing.xs },
  speechText: { color: colors.text, fontSize: 15, fontWeight: '800', lineHeight: 22 },
  characterPressable: { alignItems: 'center', bottom: -8, left: 0, position: 'absolute', right: 0, zIndex: 3 },
  standee: { alignItems: 'center', width: '100%' },
  standeeBody: { alignItems: 'center', height: 540, justifyContent: 'flex-end', shadowColor: colors.shadow, shadowOpacity: 0.35, shadowRadius: 16, width: '100%' },
  placeholderStandee: { alignItems: 'center', borderRadius: 120, borderWidth: 4, height: 300, justifyContent: 'center', marginBottom: spacing.xl, width: 240 },
  standeeEmoji: { fontSize: 96, marginBottom: spacing.sm },
  standeeName: { fontSize: 30, fontWeight: '900' },
  standeeRole: { color: colors.text, fontSize: 13, fontWeight: '900', marginTop: spacing.xs },
  characterImage: { bottom: 0, height: 540, position: 'absolute', width: '100%' },
  actionCard: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg, borderWidth: 1, gap: spacing.md, marginHorizontal: spacing.lg, padding: spacing.lg },
  actionTitle: { color: colors.text, fontSize: 18, fontWeight: '900', textAlign: 'center' },
});
