import { Word } from './types';

export function parseVocabulary(rawData: string): Word[] {
  const lines = rawData.split('\n').map(l => l.trim()).filter(l => l);
  const words: Word[] = [];
  let currentWord: Partial<Word> = {};

  const isPhonetic = (line: string) => line.startsWith('[') || line.startsWith('/');
  const hasChinese = (line: string) => /[\u4e00-\u9fa5]/.test(line);
  const isPartSpeech = (line: string) => /^(n\.|v\.|vi\.|vt\.|adj\.|adv\.|prep\.|conj\.|pron\.|int\.|art\.|num\.)/.test(line);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (isPhonetic(line)) {
      currentWord.phonetic = line;
    } else if (hasChinese(line) || isPartSpeech(line)) {
      if (currentWord.chinese) {
        currentWord.chinese += ' ' + line;
      } else {
        currentWord.chinese = line;
      }
    } else {
      if (currentWord.english) {
        if (!currentWord.id) currentWord.id = Math.random().toString(36).substring(2, 9);
        if (!currentWord.phonetic) currentWord.phonetic = '';
        if (!currentWord.chinese) currentWord.chinese = '暂无释义';
        words.push(currentWord as Word);
        currentWord = {};
      }
      currentWord.english = line;
      currentWord.id = Math.random().toString(36).substring(2, 9);
    }
  }

  if (currentWord.english) {
    if (!currentWord.phonetic) currentWord.phonetic = '';
    if (!currentWord.chinese) currentWord.chinese = '暂无释义';
    words.push(currentWord as Word);
  }

  return words;
}

export function shuffleArray<T>(array: T[]): T[] {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
}

export function generateQuiz(allWords: Word[], count: number = 20) {
  if (allWords.length === 0) return [];
  const shuffled = shuffleArray(allWords);
  const selectedWords = shuffled.slice(0, count);

  return selectedWords.map(word => {
    const distractors = shuffleArray(allWords.filter(w => w.id !== word.id))
      .slice(0, 3)
      .map(w => w.chinese);
    const options = shuffleArray([word.chinese, ...distractors]);
    return {
      word,
      options,
      correctIndex: options.indexOf(word.chinese)
    };
  });
}
