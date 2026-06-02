import { NavigatorScreenParams } from '@react-navigation/native';
import { CameraAngle, EditedSwingVideo } from './swing';

export type TabParamList = {
  Home: undefined;
  Record: undefined;
  Analysis: { videoUri?: string; club?: string; cameraAngle?: CameraAngle } | undefined;
  Progress: undefined;
  MyPage: undefined;
};

export type RootStackParamList = {
  Login: undefined;
  Onboarding: undefined;
  CharacterSelect: undefined;
  MainTabs: NavigatorScreenParams<TabParamList> | undefined;
  AnalysisLoading: { videoUri?: string; club: string; cameraAngle: CameraAngle; editedVideo?: EditedSwingVideo };
  AnalysisResult: { videoUri?: string; club: string; cameraAngle: CameraAngle; editedVideo?: EditedSwingVideo };
  VideoAnalysisPlayer: { videoUri?: string; club: string; cameraAngle: CameraAngle };
  BestCompare: { currentVideoUri?: string } | undefined;
};
