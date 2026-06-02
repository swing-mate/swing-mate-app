import React, { useEffect, useState } from 'react';
import { Alert, Image, ImageBackground, ImageSourcePropType, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { cancelAnimation, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withSpring, withTiming } from 'react-native-reanimated';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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

const homeBackgroundImage = require('../../assets/backgrounds/home_golf_clubhouse.png');

export function HomeScreen({ navigation, selectedCharacterId }: Props) {
  const character = getCharacterById(selectedCharacterId);
  const insets = useSafeAreaInsets();
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
        club: 'アイアン',
        cameraAngle: 'front',
      });
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ImageBackground source={homeBackgroundImage} style={styles.scene} imageStyle={styles.sceneImage} resizeMode="cover">
        <View style={[styles.speechBubble, { backgroundColor: character.lightColor, borderColor: character.color, top: insets.top + spacing.md }]}>
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
      </ImageBackground>

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
  scene: { backgroundColor: colors.mintLight, height: 640, overflow: 'hidden', width: '100%' },
  sceneImage: { height: '100%', width: '100%' },
  speechBubble: { borderRadius: radius.lg, borderWidth: 2, left: spacing.lg, padding: spacing.sm, position: 'absolute', right: spacing.lg, top: spacing.lg, zIndex: 4 },
  speechName: { fontSize: 14, fontWeight: '900', marginBottom: 2 },
  speechText: { color: colors.text, fontSize: 14, fontWeight: '800', lineHeight: 20 },
  characterPressable: { alignItems: 'center', bottom: -8, left: 0, position: 'absolute', right: 0, zIndex: 3 },
  standee: { alignItems: 'center', width: '100%' },
  standeeBody: { alignItems: 'center', height: 560, justifyContent: 'flex-end', shadowColor: colors.shadow, shadowOpacity: 0.35, shadowRadius: 16, width: '100%' },
  placeholderStandee: { alignItems: 'center', borderRadius: 120, borderWidth: 4, height: 300, justifyContent: 'center', marginBottom: spacing.xl, width: 240 },
  standeeEmoji: { fontSize: 96, marginBottom: spacing.sm },
  standeeName: { fontSize: 30, fontWeight: '900' },
  standeeRole: { color: colors.text, fontSize: 13, fontWeight: '900', marginTop: spacing.xs },
  characterImage: { bottom: 0, height: 560, position: 'absolute', width: '100%' },
  actionCard: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg, borderWidth: 1, gap: spacing.md, marginHorizontal: spacing.lg, padding: spacing.lg },
  actionTitle: { color: colors.text, fontSize: 18, fontWeight: '900', textAlign: 'center' },
});
