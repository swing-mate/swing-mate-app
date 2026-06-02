import { CharacterId } from '../types/character';
import { CaddieExpReason } from '../types/caddieGrowth';
import { caddieExpRewards, getCaddieGrowthProgress } from '../data/caddieGrowth';
import { storageService } from './storageService';

export const caddieGrowthService = {
  async getProgress(characterId: CharacterId) {
    const totalExp = await storageService.getCaddieExp(characterId);
    return getCaddieGrowthProgress(characterId, totalExp);
  },
  async addExp(characterId: CharacterId, reason: CaddieExpReason) {
    const before = await caddieGrowthService.getProgress(characterId);
    const totalExp = await storageService.addCaddieExp(characterId, caddieExpRewards[reason]);
    const after = getCaddieGrowthProgress(characterId, totalExp);
    return { before, after, gainedExp: caddieExpRewards[reason], leveledUp: after.level > before.level, outfitUnlocked: after.currentOutfitLevel > before.currentOutfitLevel };
  },
};
