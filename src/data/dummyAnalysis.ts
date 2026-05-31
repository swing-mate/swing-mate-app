import { AnalysisResult } from '../types/analysis';

export const dummyAnalysis: AnalysisResult = {
  totalScore: 78,
  rank: 'B+',
  address: 18,
  backswing: 17,
  top: 14,
  downswing: 16,
  impact: 12,
  followThrough: 18,
  comments: [
    'アドレスは安定した構えです。',
    'トップで肩の回転をもう少し深くしましょう。',
    'インパクトで左足に体重を乗せる意識が効果的です。',
  ],
};

export const analysisItems = [
  { key: 'address', label: 'アドレス', comment: '安定した構えができています！' },
  { key: 'backswing', label: 'バックスイング', comment: 'トップの位置がGood！' },
  { key: 'top', label: 'トップ', comment: '少し体が開き気味です。' },
  { key: 'downswing', label: 'ダウンスイング', comment: 'クラブ軌道が整っています。' },
  { key: 'impact', label: 'インパクト', comment: '体重移動を意識しましょう。' },
  { key: 'followThrough', label: 'フォロー', comment: 'フィニッシュまできれいです♪' },
] as const;
