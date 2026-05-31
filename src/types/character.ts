export type CharacterId = 'mimi' | 'rina' | 'yuna';

export type Character = {
  id: CharacterId;
  name: string;
  romanName: string;
  color: string;
  lightColor: string;
  role: string;
  personality: string;
  feature: string;
  tone: string;
  emoji: string;
  comment: string;
  homeComment: string;
  recordAdvice: string;
  loadingComment: string;
  resultAdvice: string;
  compareComment: string;
  progressComment: string;
};
