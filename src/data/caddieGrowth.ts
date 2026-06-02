import { ImageSourcePropType } from 'react-native';
import { CharacterId } from '../types/character';
import { CaddieExpReason, CaddieGrowthProgress } from '../types/caddieGrowth';

declare const require: (path: string) => ImageSourcePropType;

export const maxCaddieLevel = 100;

export const caddieExpRewards: Record<CaddieExpReason, number> = {
  recordingComplete: 5,
  analysisComplete: 10,
  missionComplete: 20,
  bestSwingUpdated: 50,
  sevenDayStreak: 100,
};

export const caddieOutfitUnlocks = [
  { level: 1, name: '通常衣装' },
  { level: 10, name: '新人キャディ衣装' },
  { level: 20, name: 'レッスン衣装' },
  { level: 30, name: 'クラブハウス衣装' },
  { level: 40, name: '大会サポート衣装' },
  { level: 50, name: '上級キャディ衣装' },
  { level: 60, name: 'プロキャディ衣装' },
  { level: 70, name: 'エリート衣装' },
  { level: 80, name: 'プレミアム衣装' },
  { level: 90, name: 'VIP衣装' },
  { level: 100, name: 'レジェンド衣装' },
] as const;

type OutfitLevel = (typeof caddieOutfitUnlocks)[number]['level'];

type OutfitImageRegistry = Partial<Record<CharacterId, Partial<Record<OutfitLevel, ImageSourcePropType>>>>;

const normalOutfitImages: Record<CharacterId, ImageSourcePropType> = {
  mimi: require('../../assets/characters/mimi.png'),
  rina: require('../../assets/characters/rina.png'),
  yuna: require('../../assets/characters/yuna.png'),
};

// Future outfit PNGs can be registered here as static requires, e.g.
// mimi: { 10: require('../../assets/characters/mimi/mimi_lv10.png') }.
// Missing entries intentionally fall back to the normal character outfit.
const outfitImageRegistry: OutfitImageRegistry = {
  mimi: { 1: normalOutfitImages.mimi },
  rina: { 1: normalOutfitImages.rina },
  yuna: { 1: normalOutfitImages.yuna },
};

const getExpForLevel = (level: number) => Math.max(0, (level - 1) * level * 15);
const getExpForNextLevel = (level: number) => level * 30;

export const getCaddieGrowthProgress = (characterId: CharacterId, totalExp = 0): CaddieGrowthProgress => {
  const safeExp = Math.max(0, Math.floor(totalExp));
  let level = 1;
  while (level < maxCaddieLevel && safeExp >= getExpForLevel(level + 1)) {
    level += 1;
  }

  const levelStartExp = getExpForLevel(level);
  const currentLevelExp = level >= maxCaddieLevel ? 0 : safeExp - levelStartExp;
  const nextLevelExp = level >= maxCaddieLevel ? 0 : getExpForNextLevel(level);
  const unlockedOutfits = caddieOutfitUnlocks.filter((outfit) => outfit.level <= level);
  const currentOutfit = unlockedOutfits[unlockedOutfits.length - 1] ?? caddieOutfitUnlocks[0];
  const nextOutfit = caddieOutfitUnlocks.find((outfit) => outfit.level > level) ?? null;

  return {
    characterId,
    totalExp: safeExp,
    level,
    currentLevelExp,
    nextLevelExp,
    progressRatio: level >= maxCaddieLevel ? 1 : Math.min(1, currentLevelExp / Math.max(1, nextLevelExp)),
    currentOutfitLevel: currentOutfit.level,
    currentOutfitName: currentOutfit.name,
    nextOutfitLevel: nextOutfit?.level ?? null,
    nextOutfitName: nextOutfit?.name ?? null,
    unlockedOutfit: level === currentOutfit.level && level !== 1,
  };
};

export const getCaddieOutfitImageSource = (characterId: CharacterId, level: number): ImageSourcePropType => {
  const outfit = [...caddieOutfitUnlocks].reverse().find((item) => item.level <= level) ?? caddieOutfitUnlocks[0];
  return outfitImageRegistry[characterId]?.[outfit.level] ?? normalOutfitImages[characterId];
};
