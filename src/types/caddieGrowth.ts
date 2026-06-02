import { CharacterId } from './character';

export type CaddieExpReason = 'recordingComplete' | 'analysisComplete' | 'missionComplete' | 'bestSwingUpdated' | 'sevenDayStreak';

export type CaddieGrowthProgress = {
  characterId: CharacterId;
  totalExp: number;
  level: number;
  currentLevelExp: number;
  nextLevelExp: number;
  progressRatio: number;
  currentOutfitLevel: number;
  currentOutfitName: string;
  nextOutfitLevel: number | null;
  nextOutfitName: string | null;
  unlockedOutfit: boolean;
};

export type CaddieGrowthMap = Partial<Record<CharacterId, number>>;
