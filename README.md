# スイングメイト (Swing Mate)

## アプリ名

スイングメイト

## 概要

スイングメイトは、かわいいキャディに応援してもらいながら、ゴルフスイングを撮影・分析・比較できる練習サポートアプリです。

ユーザーは「ミミ」「リナ」「ユナ」の3人から、応援してもらうキャディを1人選びます。選んだキャラはホーム、撮影、分析中、分析結果、成長グラフ、マイページでコメントやアドバイスを表示します。

最大の特徴は、過去の自分のベストスイングを薄く透かして、現在のスイングと比較できることです。今回のMVPでは本物のPose Detectionや採点ロジックは入れず、ダミーデータで画面遷移と保存フローを確認できます。

## 起動方法

```bash
npm install
npx expo start
```

Expo GoでQRコードを読み取るか、iOS Simulator / Android Emulatorで起動してください。

## 必要なコマンド

```bash
npm install
npm run start
npm run typecheck
npm run ios
npm run android
npm run web
```

## 画面一覧

1. LoginScreen
2. OnboardingScreen
3. CharacterSelectScreen
4. HomeScreen
5. SwingRecordScreen
6. AnalysisLoadingScreen
7. AnalysisResultScreen
8. BestSwingCompareScreen
9. ProgressScreen
10. MyPageScreen

## 今回実装済みの機能

- React Native + Expo + TypeScript構成
- React Navigationによるスタック遷移と下部タブナビゲーション
- 日本語UIのパステル系デザイン
- ダミーログイン、新規登録、ゲスト開始UI
- AsyncStorageによるログイン状態、選択キャラ、スイング履歴、ベストスイングID保存
- 3人のキャディキャラ選択
  - ミミ: サポート担当
  - リナ: 原因分析担当
  - ユナ: データ分析担当
- 選択キャラに応じた吹き出しコメント
- expo-cameraによる動画撮影画面
- カメラ権限リクエスト、録画開始/停止、録画時間表示
- 撮影角度と使用クラブの選択
- ダミー動画URIで分析へ進めるフォールバック
- 2秒間の分析中画面、円形ローディング、進捗バー
- ダミースコアによる分析結果表示
- 履歴保存と最高スコアの自動ベスト設定
- 手動の「ベストに設定」ボタン
- ベストスイング比較画面
  - 横並び比較
  - 重ね比較
  - ベスト動画の半透明表示
  - 透明度切り替え: 0%、25%、50%、75%
  - 再生速度切り替え: 0.25x、0.5x、1.0x
  - 再生/停止
- react-native-svgによる簡易成長グラフ
- クラブ別フィルターと最近の練習履歴
- マイページのキャラ変更、ログアウト、データ削除確認
- 後から `assets/characters/mimi.png`, `rina.png`, `yuna.png` を差し替えやすいプレースホルダー設計

## 今後追加予定の機能

- 本物のPose Detection
- 動画フレーム抽出
- スイング採点ロジック
- AIコメント生成
- クラウド保存
- 有料プラン
