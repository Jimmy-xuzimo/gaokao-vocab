import { Word } from '../types';

/**
 * 生成稳定的单词ID
 * @param englishWord - 英文单词
 * @returns 稳定的ID字符串
 */
export function generateStableId(englishWord: string): string {
  const cleanKey = englishWord.toLowerCase().replace(/[^a-z0-9]/g, '');
  return `wd_${cleanKey}`;
}

/**
 * 判断字符串是否为音标
 * @param line - 输入字符串
 * @returns 是否为音标
 */
export function isPhonetic(line: string): boolean {
  return line.startsWith('[') || line.startsWith('/');
}

/**
 * 判断字符串是否包含中文
 * @param line - 输入字符串
 * @returns 是否包含中文
 */
export function hasChinese(line: string): boolean {
  return /[\u4e00-\u9fa5]/.test(line);
}

/**
 * 判断字符串是否为词性标记
 * @param line - 输入字符串
 * @returns 是否为词性标记
 */
export function isPartSpeech(line: string): boolean {
  return /^(n\.|v\.|vi\.|vt\.|adj\.|adv\.|prep\.|conj\.|pron\.|int\.|art\.|num\.)/.test(line);
}

/**
 * 解析词汇数据
 * @param rawData - 原始文本数据
 * @returns 解析后的单词数组
 */
export function parseVocabulary(rawData: string): Word[] {
  const lines = rawData.split('\n').map(l => l.trim()).filter(l => l);
  const words: Word[] = [];
  let currentWord: Partial<Word> = {};

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (isPhonetic(line)) {
      // 处理空音标的情况，如 "[]" 或 "//"
      const isEmptyPhonetic = line === '[]' || line === '//'; 
      currentWord.phonetic = isEmptyPhonetic ? '' : line;
    } else if (hasChinese(line) || isPartSpeech(line)) {
      if (currentWord.chinese) {
        currentWord.chinese += ' ' + line;
      } else {
        currentWord.chinese = line;
      }
    } else {
      if (currentWord.english) {
        if (!currentWord.id) currentWord.id = generateStableId(currentWord.english);
        if (!currentWord.phonetic) currentWord.phonetic = '';
        if (!currentWord.chinese) currentWord.chinese = '暂无释义';
        
        words.push(currentWord as Word);
        currentWord = {};
      }

      currentWord.english = line;
      currentWord.id = generateStableId(line);
    }
  }

  if (currentWord.english) {
    if (!currentWord.id) currentWord.id = generateStableId(currentWord.english);
    if (!currentWord.phonetic) currentWord.phonetic = '';
    if (!currentWord.chinese) currentWord.chinese = '暂无释义';
    words.push(currentWord as Word);
  }

  return words;
}
