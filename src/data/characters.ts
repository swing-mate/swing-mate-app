import { colors } from '../theme/colors';
import { Character, CharacterId } from '../types/character';

export const characters: Character[] = [
  {
    id: 'mimi',
    name: 'ミミ',
    romanName: 'Mimi',
    color: colors.mint,
    lightColor: colors.mintLight,
    role: 'サポート担当',
    personality: '明るく優しい',
    feature: '褒めて伸ばす',
    tone: '一緒にがんばろうね♪',
    emoji: '🌿',
    comment: '今日も一緒に楽しく練習しようね♪',
    homeComment: '今日も一緒に楽しく練習しようね♪',
    recordAdvice: '全身が入るようにカメラを置いてね♪',
    loadingComment: 'がんばったスイングをチェックしてるよ♪',
    resultAdvice: '全体的にいい感じだよ♪ 次は頭の位置を少し意識してみよう！',
    compareComment: 'ベストの動きと重ねて、いいところを見つけようね♪',
    progressComment: 'スコアが上がってきてるよ♪ この調子！',
  },
  {
    id: 'rina',
    name: 'リナ',
    romanName: 'Rina',
    color: colors.pink,
    lightColor: colors.pinkLight,
    role: '原因分析担当',
    personality: '元気いっぱいのムードメーカー',
    feature: 'ミスの原因を見つける',
    tone: '原因を見つけるよ♪',
    emoji: '💗',
    comment: 'スイングの原因を一緒に見つけよっ♪',
    homeComment: '今日はスイングの原因を一緒に見つけよっ♪',
    recordAdvice: '正面と後方、どっちも撮ると原因が見つけやすいよ！',
    loadingComment: 'ミスの原因を探してるよ♪',
    resultAdvice: 'ミスの原因はトップで少し体が開いているところかも！',
    compareComment: '違いが出る瞬間を一緒に探していこう♪',
    progressComment: 'ミスのパターンが見えてきたね！',
  },
  {
    id: 'yuna',
    name: 'ユナ',
    romanName: 'Yuna',
    color: colors.lavender,
    lightColor: colors.lavenderLight,
    role: 'データ分析担当',
    personality: '冷静で頼れる頭脳派',
    feature: '数値で説明する',
    tone: 'データから上達を導きます。',
    emoji: '💜',
    comment: 'スコアの変化から成長を見ていきましょう。',
    homeComment: '前回のデータと比べながら確認しましょう。',
    recordAdvice: 'カメラ位置を固定すると、比較精度が上がります。',
    loadingComment: 'スイングデータを解析しています。',
    resultAdvice: '前回よりインパクト姿勢が8%改善しています。',
    compareComment: '半透明表示でフォーム差分を定量的に確認しましょう。',
    progressComment: '直近6回でスコアが26点改善しています。',
  },
];

export const getCharacterById = (id?: string | null): Character =>
  characters.find((character) => character.id === id) ?? characters[0];

export const isCharacterId = (id: string | null): id is CharacterId =>
  id === 'mimi' || id === 'rina' || id === 'yuna';
