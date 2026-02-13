import { describe, it, expect } from 'vitest';
import { shuffleArray, sample, chunk } from './array';

describe('array utils', () => {
  describe('shuffleArray', () => {
    it('应该保持数组长度不变', () => {
      const arr = [1, 2, 3, 4, 5];
      const shuffled = shuffleArray(arr);
      expect(shuffled).toHaveLength(5);
    });

    it('应该包含相同的元素', () => {
      const arr = [1, 2, 3, 4, 5];
      const shuffled = shuffleArray(arr);
      expect(shuffled.sort()).toEqual(arr.sort());
    });

    it('不应该修改原数组', () => {
      const arr = [1, 2, 3, 4, 5];
      const original = [...arr];
      shuffleArray(arr);
      expect(arr).toEqual(original);
    });
  });

  describe('sample', () => {
    it('应该返回指定数量的元素', () => {
      const arr = [1, 2, 3, 4, 5];
      const result = sample(arr, 3);
      expect(result).toHaveLength(3);
    });

    it('如果请求数量超过数组长度，应该返回所有元素', () => {
      const arr = [1, 2, 3];
      const result = sample(arr, 5);
      expect(result).toHaveLength(3);
    });

    it('如果请求数量为0，应该返回空数组', () => {
      const arr = [1, 2, 3];
      const result = sample(arr, 0);
      expect(result).toHaveLength(0);
    });
  });

  describe('chunk', () => {
    it('应该正确分块', () => {
      const arr = [1, 2, 3, 4, 5, 6];
      const result = chunk(arr, 2);
      expect(result).toEqual([[1, 2], [3, 4], [5, 6]]);
    });

    it('应该处理不能整除的情况', () => {
      const arr = [1, 2, 3, 4, 5];
      const result = chunk(arr, 2);
      expect(result).toEqual([[1, 2], [3, 4], [5]]);
    });

    it('空数组应该返回空数组', () => {
      const arr: number[] = [];
      const result = chunk(arr, 2);
      expect(result).toEqual([]);
    });
  });
});
