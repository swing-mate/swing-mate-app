import { CharacterId } from './character';

export type CameraAngle = 'front' | 'downTheLine';

export type SwingHistory = {
  id: string;
  videoUri: string;
  createdAt: string;
  club: string;
  cameraAngle: CameraAngle;
  score: number;
  selectedCharacterId: CharacterId;
  isBestSwing: boolean;
  notes?: string;
};
