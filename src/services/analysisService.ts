import { dummyAnalysis } from '../data/dummyAnalysis';
import { AnalysisResult } from '../types/analysis';
import { CameraAngle, SwingHistory } from '../types/swing';
import { CharacterId } from '../types/character';

export const DUMMY_VIDEO_URI = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4';

export const analysisService = {
  async analyzeSwing(): Promise<AnalysisResult> {
    return dummyAnalysis;
  },
  createSwingHistory(params: {
    videoUri?: string;
    club: string;
    cameraAngle: CameraAngle;
    selectedCharacterId: CharacterId;
  }): SwingHistory {
    return {
      id: `${Date.now()}`,
      videoUri: params.videoUri || DUMMY_VIDEO_URI,
      createdAt: new Date().toISOString(),
      club: params.club,
      cameraAngle: params.cameraAngle,
      score: dummyAnalysis.totalScore,
      selectedCharacterId: params.selectedCharacterId,
      isBestSwing: false,
      notes: 'ダミー分析結果を保存しました。',
    };
  },
};
