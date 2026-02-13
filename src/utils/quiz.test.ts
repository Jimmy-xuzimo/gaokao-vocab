import { describe, it, expect } from 'vitest';
import { generateQuiz, calculateScore, getScoreRating } from './quiz';
import type { Word } from '../types';

describe('quiz utils', () => {
  const mockWords: Word[] = [
    { id: '1', english: 'hello', phonetic: '[həˈləʊ]', chinese: '你好' },
    { id: '2', english: 'world', phonetic: '[wɜːld]', chinese: '世界' },
    { id: '3', english: 'test', phonetic: '[test]', chinese: '测试' },
    { id: '4', english: 'word', phonetic: '[wɜːd]', chinese: '单词' },
    { id: '5', english: 'book', phonetic: '[bʊk]', chinese: '书' },
  ];

  describe('generateQuiz', () => {
    it('应该生成指定数量的题目', () => {
      const quiz = generateQuiz(mockWords, 3);
      expect(quiz).toHaveLength(3);
    });

    it('每个题目应该有4个选项', () => {
      const quiz = generateQuiz(mockWords, 1);
      expect(quiz[0].options).toHaveLength(4);
    });

    it('正确答案应该在选项中', () => {
      const quiz = generateQuiz(mockWords, 1);
      const question = quiz[0];
      expect(question.options).toContain(question.word.chinese);
    });

    it('correctIndex 应该在有效范围内', () => {
      const quiz = generateQuiz(mockWords, 3);
      quiz.forEach(q => {
        expect(q.correctIndex).toBeGreaterThanOrEqual(0);
        expect(q.correctIndex).toBeLessThan(4);
      });
    });

    it('空数组应该返回空数组', () => {
      const quiz = generateQuiz([], 5);
      expect(quiz).toHaveLength(0);
    });

    it('单词数量不足应该抛出错误', () => {
      expect(() => generateQuiz(mockWords.slice(0, 2), 5)).toThrow();
    });
  });

  describe('calculateScore', () => {
    it('应该正确计算得分', () => {
      const questions = generateQuiz(mockWords, 3);
      // 第一个答案正确，其他两个答案错误（使用不同的错误答案）
      const wrongAnswer1 = (questions[1].correctIndex + 1) % 4;
      const wrongAnswer2 = (questions[2].correctIndex + 2) % 4;
      const answers = [questions[0].correctIndex, wrongAnswer1, wrongAnswer2];
      const score = calculateScore(answers, questions);
      expect(score).toBe(1);
    });

    it('全对应该返回满分', () => {
      const questions = generateQuiz(mockWords, 3);
      const answers = questions.map(q => q.correctIndex);
      const score = calculateScore(answers, questions);
      expect(score).toBe(3);
    });

    it('全错应该返回0', () => {
      const questions = generateQuiz(mockWords, 3);
      const wrongAnswers = questions.map(q => (q.correctIndex + 1) % 4);
      const score = calculateScore(wrongAnswers, questions);
      expect(score).toBe(0);
    });
  });

  describe('getScoreRating', () => {
    it('90%以上应该返回A+', () => {
      const rating = getScoreRating(9, 10);
      expect(rating.grade).toBe('A+');
    });

    it('80-89%应该返回A', () => {
      const rating = getScoreRating(8, 10);
      expect(rating.grade).toBe('A');
    });

    it('70-79%应该返回B', () => {
      const rating = getScoreRating(7, 10);
      expect(rating.grade).toBe('B');
    });

    it('60-69%应该返回C', () => {
      const rating = getScoreRating(6, 10);
      expect(rating.grade).toBe('C');
    });

    it('60%以下应该返回D', () => {
      const rating = getScoreRating(5, 10);
      expect(rating.grade).toBe('D');
    });
  });
});
