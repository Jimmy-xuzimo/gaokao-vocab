import { useState, useEffect, useCallback } from 'react';

/**
 * 自定义 Hook：使用 localStorage 实现状态持久化
 * @param key - localStorage 键名
 * @param initialValue - 初始值
 * @returns [storedValue, setValue] - 存储的值和更新函数
 */
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  // 获取初始值
  const readValue = useCallback((): T => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      if (!item) return initialValue;

      const parsed = JSON.parse(item);
      
      // 特殊处理：将数组转换为 Set（用于 learnedIds）
      if (initialValue instanceof Set && Array.isArray(parsed)) {
        return new Set(parsed) as T;
      }
      
      return parsed as T;
    } catch {
      // 静默处理错误，避免泄露内部信息到控制台
      return initialValue;
    }
  }, [initialValue, key]);

  const [storedValue, setStoredValue] = useState<T>(readValue);

  // 返回一个包装后的 setState 函数，同时更新 localStorage
  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      // 允许 value 是一个函数
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // 保存到 state
      setStoredValue(valueToStore);
      
      // 保存到 localStorage（Set 转换为数组）
      if (typeof window !== 'undefined') {
        const valueToSave = valueToStore instanceof Set 
          ? Array.from(valueToStore)
          : valueToStore;
        window.localStorage.setItem(key, JSON.stringify(valueToSave));
      }
    } catch {
      // 静默处理错误，避免泄露内部信息到控制台
    }
  }, [key, storedValue]);

  // 监听其他标签页的存储变化
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === key && event.newValue) {
        try {
          const parsed = JSON.parse(event.newValue);
          if (initialValue instanceof Set && Array.isArray(parsed)) {
            setStoredValue(new Set(parsed) as T);
          } else {
            setStoredValue(parsed);
          }
        } catch {
          // 静默处理解析错误
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, initialValue]);

  return [storedValue, setValue];
}
