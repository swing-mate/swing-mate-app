import AsyncStorage from '@react-native-async-storage/async-storage';
import { CharacterId } from '../types/character';
import { CaddieGrowthMap } from '../types/caddieGrowth';
import { EditedSwingVideo, SwingHistory } from '../types/swing';
import { isCharacterId } from '../data/characters';

const keys = {
  isLoggedIn: 'isLoggedIn',
  selectedCharacterId: 'selectedCharacterId',
  swingHistory: 'swingHistory',
  bestSwingId: 'bestSwingId',
  latestEditedSwingVideo: 'latestEditedSwingVideo',
  caddieGrowth: 'caddieGrowth',
};

export const storageService = {
  async getIsLoggedIn(): Promise<boolean> {
    return (await AsyncStorage.getItem(keys.isLoggedIn)) === 'true';
  },
  async setIsLoggedIn(value: boolean): Promise<void> {
    await AsyncStorage.setItem(keys.isLoggedIn, String(value));
  },
  async getSelectedCharacterId(): Promise<CharacterId | null> {
    const value = await AsyncStorage.getItem(keys.selectedCharacterId);
    return isCharacterId(value) ? value : null;
  },
  async setSelectedCharacterId(id: CharacterId): Promise<void> {
    await AsyncStorage.setItem(keys.selectedCharacterId, id);
  },
  async getCaddieGrowth(): Promise<CaddieGrowthMap> {
    const raw = await AsyncStorage.getItem(keys.caddieGrowth);
    return raw ? (JSON.parse(raw) as CaddieGrowthMap) : {};
  },
  async saveCaddieGrowth(value: CaddieGrowthMap): Promise<void> {
    await AsyncStorage.setItem(keys.caddieGrowth, JSON.stringify(value));
  },
  async getCaddieExp(id: CharacterId): Promise<number> {
    const growth = await storageService.getCaddieGrowth();
    return growth[id] ?? 0;
  },
  async addCaddieExp(id: CharacterId, exp: number): Promise<number> {
    const growth = await storageService.getCaddieGrowth();
    const totalExp = Math.max(0, (growth[id] ?? 0) + exp);
    await storageService.saveCaddieGrowth({ ...growth, [id]: totalExp });
    return totalExp;
  },
  async getSwingHistory(): Promise<SwingHistory[]> {
    const raw = await AsyncStorage.getItem(keys.swingHistory);
    return raw ? (JSON.parse(raw) as SwingHistory[]) : [];
  },
  async saveSwingHistory(history: SwingHistory[]): Promise<void> {
    await AsyncStorage.setItem(keys.swingHistory, JSON.stringify(history));
  },
  async addSwing(swing: SwingHistory): Promise<SwingHistory> {
    const history = await storageService.getSwingHistory();
    const currentBest = history.find((item) => item.isBestSwing);
    const shouldBeBest = !currentBest || swing.score >= currentBest.score;
    const nextSwing = { ...swing, isBestSwing: shouldBeBest };
    const nextHistory = shouldBeBest
      ? history.map((item) => ({ ...item, isBestSwing: false })).concat(nextSwing)
      : history.concat(nextSwing);
    await storageService.saveSwingHistory(nextHistory);
    if (shouldBeBest) {
      await storageService.setBestSwingId(nextSwing.id);
    }
    return nextSwing;
  },
  async getBestSwingId(): Promise<string | null> {
    return AsyncStorage.getItem(keys.bestSwingId);
  },
  async setBestSwingId(id: string): Promise<void> {
    const history = await storageService.getSwingHistory();
    await storageService.saveSwingHistory(history.map((item) => ({ ...item, isBestSwing: item.id === id })));
    await AsyncStorage.setItem(keys.bestSwingId, id);
  },
  async getBestSwing(): Promise<SwingHistory | null> {
    const history = await storageService.getSwingHistory();
    const bestId = await storageService.getBestSwingId();
    return history.find((item) => item.id === bestId) ?? history.find((item) => item.isBestSwing) ?? null;
  },
  async setLatestEditedSwingVideo(value: EditedSwingVideo): Promise<void> {
    await AsyncStorage.setItem(keys.latestEditedSwingVideo, JSON.stringify(value));
  },
  async getLatestEditedSwingVideo(): Promise<EditedSwingVideo | null> {
    const raw = await AsyncStorage.getItem(keys.latestEditedSwingVideo);
    return raw ? (JSON.parse(raw) as EditedSwingVideo) : null;
  },
  async clearPracticeData(): Promise<void> {
    await AsyncStorage.multiRemove([keys.swingHistory, keys.bestSwingId, keys.latestEditedSwingVideo, keys.caddieGrowth]);
  },
  async logout(): Promise<void> {
    await storageService.setIsLoggedIn(false);
  },
};
