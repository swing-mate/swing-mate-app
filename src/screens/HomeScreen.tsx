import React, { useEffect, useRef, useState } from 'react';
import { Alert, Animated, Image, ImageSourcePropType, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
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

type Props = CompositeScreenProps<BottomTabScreenProps<TabParamList, 'Home'>, NativeStackScreenProps<RootStackParamList>> & { selectedCharacterId: CharacterId | null };

const characterImageSources: Partial<Record<CharacterId, ImageSourcePropType>> = {};

export function HomeScreen({ navigation, selectedCharacterId }: Props) {
  const character = getCharacterById(selectedCharacterId);
  const floatAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(1)).current;
  const [messageIndex, setMessageIndex] = useState(0);
  const messages = [character.homeComment, character.comment, character.tone, character.compareComment];
  const characterImageSource = characterImageSources[character.id];

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: -10, duration: 1400, useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0, duration: 1400, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [floatAnim]);

  useEffect(() => {
    setMessageIndex(0);
  }, [selectedCharacterId]);

  const handleCharacterPress = () => {
    setMessageIndex((current: number) => (current + 1) % messages.length);
    Animated.sequence([
      Animated.spring(bounceAnim, { toValue: 1.08, friction: 3, useNativeDriver: true }),
      Animated.spring(bounceAnim, { toValue: 1, friction: 4, useNativeDriver: true }),
    ]).start();
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
      <View style={styles.scene}>
        <View style={styles.sky} />
        <View style={styles.clubHouse}>
          <Text style={styles.clubHouseText}>Swing Mate Club House</Text>
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
          <Animated.View style={[styles.standee, { transform: [{ translateY: floatAnim }, { scale: bounceAnim }] }]}>
            <View style={[styles.standeeBody, { backgroundColor: character.lightColor, borderColor: character.color }]}>
              <Text style={styles.standeeEmoji}>{character.emoji}</Text>
              <Text style={[styles.standeeName, { color: character.color }]}>{character.name}</Text>
              <Text style={styles.standeeRole}>{character.role}</Text>
              {characterImageSource ? <Image source={characterImageSource} style={styles.characterImage} resizeMode="contain" /> : null}
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
  container: { backgroundColor: colors.background, flexGrow: 1, padding: spacing.lg, gap: spacing.md },
  scene: { backgroundColor: colors.mintLight, borderColor: colors.border, borderRadius: radius.lg, borderWidth: 1, height: 560, overflow: 'hidden' },
  sky: { backgroundColor: '#DFF4FF', height: 250, left: 0, position: 'absolute', right: 0, top: 0 },
  clubHouse: { alignItems: 'center', alignSelf: 'center', backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.md, borderWidth: 1, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, position: 'absolute', top: 68 },
  clubHouseText: { color: colors.muted, fontSize: 12, fontWeight: '900' },
  green: { backgroundColor: '#BDEACD', borderTopLeftRadius: 260, borderTopRightRadius: 260, bottom: -120, height: 360, left: -80, position: 'absolute', right: -80 },
  fairway: { alignSelf: 'center', backgroundColor: '#E6F8D8', borderTopLeftRadius: 120, borderTopRightRadius: 120, bottom: -40, height: 260, position: 'absolute', width: 170 },
  flag: { fontSize: 34, position: 'absolute', right: 28, top: 260 },
  sun: { borderRadius: 40, height: 80, left: 28, opacity: 0.8, position: 'absolute', top: 30, width: 80 },
  speechBubble: { borderRadius: radius.lg, borderWidth: 2, left: spacing.md, padding: spacing.md, position: 'absolute', right: spacing.md, top: 150 },
  speechName: { fontSize: 15, fontWeight: '900', marginBottom: spacing.xs },
  speechText: { color: colors.text, fontSize: 15, fontWeight: '800', lineHeight: 22 },
  characterPressable: { alignItems: 'center', bottom: 28, left: 0, position: 'absolute', right: 0 },
  standee: { alignItems: 'center' },
  standeeBody: { alignItems: 'center', borderRadius: 110, borderWidth: 4, height: 280, justifyContent: 'center', shadowColor: colors.shadow, shadowOpacity: 0.35, shadowRadius: 16, width: 220 },
  standeeEmoji: { fontSize: 78, marginBottom: spacing.sm },
  standeeName: { fontSize: 30, fontWeight: '900' },
  standeeRole: { color: colors.text, fontSize: 13, fontWeight: '900', marginTop: spacing.xs },
  characterImage: { bottom: 0, height: 280, left: 0, position: 'absolute', right: 0, top: 0, width: 220 },
  actionCard: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg, borderWidth: 1, gap: spacing.md, padding: spacing.lg },
  actionTitle: { color: colors.text, fontSize: 18, fontWeight: '900', textAlign: 'center' },
});
