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


export type DrawnLine = {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  color: string;
  strokeWidth: number;
};

export type VideoDisplaySize = {
  width: number;
  height: number;
};

export type EditedSwingVideo = {
  videoUri: string;
  drawnLines: DrawnLine[];
  videoDisplaySize: VideoDisplaySize;
  videoNaturalSize?: VideoDisplaySize;
  selectedPlaybackSpeed: number;
  currentPositionMillis: number;
  updatedAt: string;
};
