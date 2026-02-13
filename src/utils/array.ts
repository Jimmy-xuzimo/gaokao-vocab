/**
 * Fisher-Yates 洗牌算法：随机打乱数组
 * @param array - 输入数组
 * @returns 打乱后的新数组
 */
export function shuffleArray<T>(array: T[]): T[] {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
}

/**
 * 从数组中随机选择指定数量的元素
 * @param array - 输入数组
 * @param count - 选择数量
 * @returns 随机选择的元素数组
 */
export function sample<T>(array: T[], count: number): T[] {
  if (count >= array.length) {
    return shuffleArray(array);
  }
  return shuffleArray(array).slice(0, count);
}

/**
 * 将数组分块
 * @param array - 输入数组
 * @param size - 每块大小
 * @returns 分块后的数组
 */
export function chunk<T>(array: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
}
