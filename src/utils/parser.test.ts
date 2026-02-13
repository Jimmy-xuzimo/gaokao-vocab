import { describe, it, expect } from 'vitest';
import { parseVocabulary, generateStableId, isPhonetic, hasChinese, isPartSpeech } from './parser';
import { RAW_DATA } from '../data';

describe('parser', () => {
  describe('generateStableId', () => {
    it('应该生成稳定的ID', () => {
      expect(generateStableId('Hello')).toBe('wd_hello');
      expect(generateStableId('Test123')).toBe('wd_test123');
      expect(generateStableId('Hello World')).toBe('wd_helloworld');
    });

    it('应该处理特殊字符', () => {
      expect(generateStableId('test-word')).toBe('wd_testword');
      expect(generateStableId('test_word')).toBe('wd_testword');
    });
  });

  describe('isPhonetic', () => {
    it('应该正确识别音标', () => {
      expect(isPhonetic('[əˈbændən]')).toBe(true);
      expect(isPhonetic('/test/')).toBe(true);
      expect(isPhonetic('hello')).toBe(false);
    });
  });

  describe('hasChinese', () => {
    it('应该正确识别中文', () => {
      expect(hasChinese('中文')).toBe(true);
      expect(hasChinese('hello')).toBe(false);
      expect(hasChinese('hello中文')).toBe(true);
    });
  });

  describe('isPartSpeech', () => {
    it('应该正确识别词性标记', () => {
      expect(isPartSpeech('n. 名词')).toBe(true);
      expect(isPartSpeech('v. 动词')).toBe(true);
      expect(isPartSpeech('adj. 形容词')).toBe(true);
      expect(isPartSpeech('hello')).toBe(false);
    });
  });

  describe('parseVocabulary', () => {
    it('应该正确解析单词数据', () => {
      const rawData = `
hello
[həˈləʊ]
int. 你好
world
[wɜːld]
n. 世界
`;
      const words = parseVocabulary(rawData);

      expect(words).toHaveLength(2);
      expect(words[0]).toMatchObject({
        english: 'hello',
        phonetic: '[həˈləʊ]',
        chinese: 'int. 你好',
      });
      expect(words[1]).toMatchObject({
        english: 'world',
        phonetic: '[wɜːld]',
        chinese: 'n. 世界',
      });
    });

    it('应该处理缺失音标的情况', () => {
      const rawData = `
test
n. 测试
`;
      const words = parseVocabulary(rawData);

      expect(words).toHaveLength(1);
      expect(words[0].phonetic).toBe('');
    });

    it('应该处理多行释义', () => {
      const rawData = `
word
[wɜːd]
n. 单词
v. 说
`;
      const words = parseVocabulary(rawData);

      expect(words).toHaveLength(1);
      expect(words[0].chinese).toBe('n. 单词 v. 说');
    });

    it('应该解析完整的3500词数据', () => {
      const words = parseVocabulary(RAW_DATA);

      // 验证单词总数
      expect(words.length).toBeGreaterThan(3000);

      // 验证前几个单词
      expect(words[0].english).toBe('a (an)');
      expect(words[1].english).toBe('abandon');

      // 验证 action 单词存在
      const actionWord = words.find(w => w.english === 'action');
      expect(actionWord).toBeDefined();
      expect(actionWord?.phonetic).toBe('[ˈækʃ(ə)n]');
      expect(actionWord?.chinese).toContain('行动');

      // 验证最后一个单词
      const lastWord = words[words.length - 1];
      expect(lastWord).toBeDefined();

      // 输出一些调试信息
      console.log('Total words parsed:', words.length);
      console.log('First 10 words:', words.slice(0, 10).map(w => w.english));
      console.log('Words around action (index 40-60):', words.slice(40, 60).map(w => w.english));
      console.log('Last 10 words:', words.slice(-10).map(w => w.english));
    });

    it('所有单词应该有有效的ID', () => {
      const words = parseVocabulary(RAW_DATA);

      words.forEach(word => {
        expect(word.id).toBeDefined();
        expect(word.id).toMatch(/^wd_[a-z0-9]+$/);
        expect(word.english).toBeDefined();
        expect(word.english.length).toBeGreaterThan(0);
      });
    });

    it('应该正确处理空音标的情况', () => {
      const rawData = `
AD
[]
n. 公元
`;
      const words = parseVocabulary(rawData);

      expect(words).toHaveLength(1);
      expect(words[0]).toMatchObject({
        english: 'AD',
        phonetic: '',  // 空音标应该被转换为空字符串
        chinese: 'n. 公元',
      });
    });

    it('AD 单词不应该出现在不相关的搜索结果中', () => {
      const words = parseVocabulary(RAW_DATA);
      
      // 搜索 "hello"
      const helloResults = words.filter(w => 
        w.english.toLowerCase().includes('hello') || 
        w.chinese.includes('hello')
      );
      
      // 搜索结果中不应该包含 AD
      const hasAD = helloResults.some(w => w.english === 'AD');
      expect(hasAD).toBe(false);
      
      // 搜索 "action"
      const actionResults = words.filter(w => 
        w.english.toLowerCase().includes('action') || 
        w.chinese.includes('action')
      );
      
      // 搜索结果中不应该包含 AD
      const hasADInAction = actionResults.some(w => w.english === 'AD');
      expect(hasADInAction).toBe(false);
      
      // 验证 AD 单词本身的数据
      const adWord = words.find(w => w.english === 'AD');
      expect(adWord).toBeDefined();
      expect(adWord?.phonetic).toBe('');  // 空音标应该被转换为空字符串
      expect(adWord?.chinese).toBe('n. 公元');
      
      console.log('AD word:', adWord);
    });
  });
});
