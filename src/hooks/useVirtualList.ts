import { useState, useRef, useCallback, useMemo } from 'react';

interface UseVirtualListOptions<T> {
  items: T[];
  itemHeight: number;
  overscan?: number;
  containerHeight?: number;
}

interface VirtualListState {
  startIndex: number;
  endIndex: number;
  offsetY: number;
}

/**
 * 自定义 Hook：实现虚拟滚动，优化长列表性能
 * @param options - 配置选项
 * @returns 虚拟滚动状态和渲染所需的计算值
 */
export function useVirtualList<T>({
  items,
  itemHeight,
  overscan = 5,
  containerHeight = 600,
}: UseVirtualListOptions<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);

  // 计算总高度
  const totalHeight = useMemo(() => items.length * itemHeight, [items.length, itemHeight]);

  // 计算可见区域的起始和结束索引
  const virtualState = useMemo<VirtualListState>(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const endIndex = Math.min(items.length, startIndex + visibleCount + overscan * 2);
    const offsetY = startIndex * itemHeight;

    return { startIndex, endIndex, offsetY };
  }, [scrollTop, itemHeight, containerHeight, items.length, overscan]);

  // 获取当前可见的列表项
  const visibleItems = useMemo(() => {
    return items.slice(virtualState.startIndex, virtualState.endIndex);
  }, [items, virtualState.startIndex, virtualState.endIndex]);

  // 处理滚动事件
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  // 滚动到指定索引
  const scrollToIndex = useCallback((index: number) => {
    if (containerRef.current) {
      containerRef.current.scrollTop = index * itemHeight;
    }
  }, [itemHeight]);

  return {
    containerRef,
    visibleItems,
    totalHeight,
    virtualState,
    handleScroll,
    scrollToIndex,
  };
}
