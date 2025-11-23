import { Word } from './types';

export function parseVocabulary(rawData: string): Word[] {
  // Split by lines and remove empty ones
  const lines = rawData.split('\n').map(l => l.trim()).filter(l => l);
  const words: Word[] = [];
  let currentWord: Partial<Word> = {};

  // Helper to identify line types
  const isPhonetic = (line: string) => line.startsWith('[') || line.startsWith('/');
  const hasChinese = (line: string) => /[\u4e00-\u9fa5]/.test(line);
  // Common parts of speech indicators to help identify definitions
  const isPartSpeech = (line: string) => /^(n\.|v\.|vi\.|vt\.|adj\.|adv\.|prep\.|conj\.|pron\.|int\.|art\.|num\.)/.test(line);

  // Helper to generate a stable ID based on the English word
  // This ensures that progress is saved correctly across reloads
  const generateStableId = (englishWord: string) => {
    // Remove special chars and spaces to create a clean key
    const cleanKey = englishWord.toLowerCase().replace(/[^a-z0-9]/g, '');
    // Add a prefix to ensure it's a string
    return `wd_${cleanKey}`;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (isPhonetic(line)) {
      currentWord.phonetic = line;
    } else if (hasChinese(line) || isPartSpeech(line)) {
      // If we already have a definition line, append it (for multi-line definitions)
      if (currentWord.chinese) {
        currentWord.chinese += ' ' + line;
      } else {
        currentWord.chinese = line;
      }
    } else {
      // This line is likely an English word.
      // If we have a previous word that is sufficiently formed, save it.
      if (currentWord.english) {
        // Generate stable ID before pushing
        if (!currentWord.id) currentWord.id = generateStableId(currentWord.english);
        if (!currentWord.phonetic) currentWord.phonetic = '';
        if (!currentWord.chinese) currentWord.chinese = '暂无释义'; // Fallback
        
        words.push(currentWord as Word);
        currentWord = {};
      }

      // Start new word
      currentWord.english = line;
      // Don't generate ID here immediately, wait until we are sure it's a word block or generate it now
      currentWord.id = generateStableId(line);
    }
  }

  // Push the final word
  if (currentWord.english) {
    if (!currentWord.id) currentWord.id = generateStableId(currentWord.english);
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
  
  // Pick 'count' random words as questions
  const shuffled = shuffleArray(allWords);
  const selectedWords = shuffled.slice(0, count);

  return selectedWords.map(word => {
    // For each word, pick 3 random distractors
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
