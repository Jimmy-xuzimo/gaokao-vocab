import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { Word } from '../../types';
import { IconSearch, IconCheck } from '../Icons';
import { useDebounce, useDebouncedCallback } from '../../hooks';

interface WordListProps {
  words: Word[];
  learnedIds: Set<string>;
  onMarkAsLearned: (id: string) => void;
  title: string;
  showMarkButton?: boolean;
}

const ITEMS_PER_PAGE = 50;

export const WordList: React.FC<WordListProps> = ({
  words,
  learnedIds,
  onMarkAsLearned,
  title,
  showMarkButton = true,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [displayCount, setDisplayCount] = useState(ITEMS_PER_PAGE);
  const [isLoading, setIsLoading] = useState(false);
  const listContainerRef = useRef<HTMLDivElement>(null);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const filteredWords = useMemo(() => {
    if (!debouncedSearchTerm) return words;
    
    const lowerTerm = debouncedSearchTerm.toLowerCase();
    return words.filter(w => 
      w.english.toLowerCase().includes(lowerTerm) || 
      w.chinese.includes(lowerTerm)
    );
  }, [words, debouncedSearchTerm]);

  const visibleWords = useMemo(() => {
    return filteredWords.slice(0, displayCount);
  }, [filteredWords, displayCount]);

  const hasMore = displayCount < filteredWords.length;

  // 加载更多单词
  const loadMore = useCallback(() => {
    if (isLoading || !hasMore) return;
    
    setIsLoading(true);
    setTimeout(() => {
      setDisplayCount(prev => {
        const next = Math.min(prev + ITEMS_PER_PAGE, filteredWords.length);
        return next;
      });
      setIsLoading(false);
    }, 100);
  }, [isLoading, hasMore, filteredWords.length]);

  // 使用防抖优化滚动处理函数，避免频繁触发
  const handleScroll = useDebouncedCallback((e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const scrollBottom = scrollTop + clientHeight;
    // 当滚动到距离底部 100px 时触发加载
    const threshold = scrollHeight - 100;
    
    if (scrollBottom >= threshold) {
      loadMore();
    }
  }, 100);

  // 搜索词变化时重置
  useEffect(() => {
    setDisplayCount(ITEMS_PER_PAGE);
    if (listContainerRef.current) {
      listContainerRef.current.scrollTop = 0;
    }
  }, [debouncedSearchTerm]);

  // 初始加载时，如果内容不够填充容器，自动加载更多
  useEffect(() => {
    const container = listContainerRef.current;
    if (!container) return;

    // 检查是否需要加载更多
    const checkAndLoadMore = () => {
      const { scrollHeight, clientHeight } = container;
      // 如果内容高度小于容器高度，且还有更多数据，则加载更多
      if (scrollHeight <= clientHeight && hasMore && !isLoading) {
        loadMore();
      }
    };

    // 延迟检查，确保 DOM 已更新
    const timer = setTimeout(checkAndLoadMore, 100);
    return () => clearTimeout(timer);
  }, [visibleWords.length, hasMore, isLoading, loadMore]);

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full animate-fade-in w-full max-w-full">
      {/* Header */}
      <div className="p-3 sm:p-4 border-b border-slate-100 bg-white sticky top-0 z-20 space-y-2 sm:space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-base sm:text-lg text-slate-800">{title}</h2>
          <span className="text-xs font-medium bg-slate-100 px-2 py-1 rounded text-slate-500">
            {filteredWords.length} words
          </span>
        </div>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <IconSearch />
          </div>
          <input 
            type="text" 
            placeholder="Search words..." 
            className="w-full pl-10 pr-4 py-2 sm:py-2.5 rounded-lg bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all duration-200 text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Word List */}
      <div 
        ref={listContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto overflow-x-hidden min-h-0"
      >
        <div className="divide-y divide-slate-50">
          {visibleWords.map((word) => {
            const isLearned = learnedIds.has(word.id);
            
            return (
              <div 
                key={word.id}
                className="p-3 sm:p-4 hover:bg-slate-50 flex items-start justify-between gap-2 sm:gap-4 group transition-colors duration-200"
              >
                <div className="flex-1 min-w-0 overflow-hidden">
                  <div className="flex items-baseline gap-1.5 sm:gap-2 flex-wrap">
                    <span className="font-bold text-slate-800 text-base sm:text-lg break-all">{word.english}</span>
                    <span className="font-mono text-slate-400 text-xs sm:text-sm shrink-0">{word.phonetic}</span>
                  </div>
                  <div className="text-sm text-slate-600 mt-1 leading-relaxed break-words">{word.chinese}</div>
                </div>
                {isLearned ? (
                  <div className="shrink-0 flex flex-col items-center gap-1">
                    <span className="w-7 h-7 sm:w-8 sm:h-8 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                      <IconCheck />
                    </span>
                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wide hidden sm:block">Mastered</span>
                  </div>
                ) : (
                  showMarkButton && (
                    <button 
                      onClick={() => onMarkAsLearned(word.id)}
                      className="shrink-0 w-7 h-7 sm:w-8 sm:h-8 text-slate-300 hover:text-indigo-500 hover:bg-indigo-50 rounded-full flex items-center justify-center transition-all duration-200"
                      title="Mark as learned"
                    >
                      <IconCheck />
                    </button>
                  )
                )}
              </div>
            );
          })}
        </div>
        
        {/* 加载指示器 */}
        {hasMore && (
          <div className="p-4 text-center">
            {isLoading ? (
              <>
                <div className="inline-block w-6 h-6 border-2 border-slate-200 border-t-indigo-500 rounded-full animate-spin"></div>
                <p className="text-xs text-slate-400 mt-2">Loading more...</p>
              </>
            ) : (
              <button
                onClick={loadMore}
                className="px-4 py-2 text-sm text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors"
              >
                Load More ({filteredWords.length - displayCount} remaining)
              </button>
            )}
          </div>
        )}
        
        {/* 全部加载完成提示 */}
        {!hasMore && filteredWords.length > 0 && (
          <div className="p-4 text-center">
            <p className="text-xs text-slate-400">
              All {filteredWords.length} words loaded
            </p>
          </div>
        )}
        
        {filteredWords.length === 0 && (
          <div className="p-10 text-center text-slate-400 flex flex-col items-center gap-2">
            <IconSearch />
            <p>No words found matching &quot;{debouncedSearchTerm}&quot;</p>
          </div>
        )}
      </div>
    </div>
  );
};
