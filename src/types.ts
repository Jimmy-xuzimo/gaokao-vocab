
export interface Word {
  id: string;
  english: string;
  phonetic: string;
  chinese: string;
}

export type AppView = 'dashboard' | 'study' | 'quiz' | 'list' | 'learned';

export interface QuizQuestion {
  word: Word;
  options: string[]; // 4 chinese definitions
  correctIndex: number;
}
