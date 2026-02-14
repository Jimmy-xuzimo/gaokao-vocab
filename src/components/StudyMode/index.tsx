import React, { useState, useCallback, useRef } from 'react';
import { Word } from '../../types';
import { IconArrowLeft, IconArrowRight, IconCheck, IconClock, IconBookOpen } from '../Icons';

interface StudyModeProps {
  studyQueue: Word[];
  learnedIds: Set<string>;
  onMarkAsLearned: (id: string) => void;
  onGoHome: () => void;
}

/**
 * 学习模式组件 - 简洁优雅单词卡片设计版
 * 参考现代审美，大气、高级的视觉效果
 */
export const StudyMode: React.FC<StudyModeProps> = ({
  studyQueue,
  learnedIds,
  onMarkAsLearned,
  onGoHome,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  
  // 使用 ref 防止快速点击导致的重复操作
  const isProcessingRef = useRef(false);

  const currentWord = studyQueue[currentIndex];
  const progress = studyQueue.length > 0 ? ((currentIndex + 1) / studyQueue.length) * 100 : 0;

  const handlePrev = useCallback(() => {
    if (currentIndex > 0 && !isProcessingRef.current) {
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex(prev => prev - 1), 150);
    }
  }, [currentIndex]);

  const handleNext = useCallback(() => {
    if (isProcessingRef.current) return;
    
    if (currentIndex < studyQueue.length - 1) {
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex(prev => prev + 1), 150);
    } else {
      onGoHome();
    }
  }, [currentIndex, studyQueue.length, onGoHome]);

  const handleMarkLearned = useCallback(() => {
    // 防止快速重复点击
    if (isProcessingRef.current) return;
    
    isProcessingRef.current = true;
    
    // 标记为已学习
    onMarkAsLearned(currentWord.id);
    
    // 跳转到下一个
    handleNext();
    
    // 300ms 后重置处理状态，允许下一次操作
    setTimeout(() => {
      isProcessingRef.current = false;
    }, 300);
  }, [currentWord.id, onMarkAsLearned, handleNext]);

  // 空状态 - 优化设计
  if (!currentWord) {
    return (
      <div className="h-full flex flex-col items-center justify-center max-w-md mx-auto px-6 animate-fade-in">
        <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
          <IconBookOpen className="w-10 h-10 text-indigo-400" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">No Words to Study</h2>
        <p className="text-slate-500 text-center mb-6">
          You&apos;ve mastered all the words in this session. Great job!
        </p>
        <button
          onClick={onGoHome}
          className="px-8 py-3 rounded-xl font-semibold bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all duration-200"
        >
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col items-center justify-center max-w-2xl mx-auto w-full animate-slide-up px-6">
      {/* Progress Bar - 简洁进度指示器 */}
      <div className="w-full max-w-md mb-6">
        <div className="flex justify-between items-center mb-2">
          <button 
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className={`p-2 text-slate-400 hover:text-indigo-600 transition-colors duration-200 ${currentIndex === 0 ? 'opacity-30 cursor-not-allowed' : ''}`}
          >
            <IconArrowLeft className="w-6 h-6" />
          </button>
          <div className="text-slate-500 text-sm font-medium">
            {currentIndex + 1} / {studyQueue.length}
          </div>
          <button 
            onClick={handleNext}
            className="p-2 text-slate-400 hover:text-indigo-600 transition-colors duration-200"
          >
            <IconArrowRight className="w-6 h-6" />
          </button>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-1.5">
          <div 
            className="bg-indigo-500 h-1.5 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
      
      {/* Flashcard - 简洁优雅单词卡片 */}
      <div 
        className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-slate-200/50 relative overflow-hidden cursor-pointer hover:shadow-2xl hover:shadow-slate-200/60 transition-all duration-300 mb-6"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        {/* Status Badge - 右上角状态标签 */}
        <div className="absolute top-5 right-5 z-10">
          {learnedIds.has(currentWord.id) ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-xs font-medium border border-emerald-100">
              <IconCheck className="w-3.5 h-3.5" />
              Mastered
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 text-amber-600 text-xs font-medium border border-amber-100">
              <IconClock className="w-3.5 h-3.5" />
              Reviewing
            </span>
          )}
        </div>

        {/* Card Content - 居中对齐布局 */}
        <div className="flex flex-col items-center justify-center py-16 px-10 text-center min-h-[360px]">
          {/* English Word - 大号粗体标题 */}
          <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-3 break-words animate-fade-in">
            {currentWord.english}
          </h2>
          
          {/* Phonetic - 紫色音标 */}
          <p className="text-lg text-indigo-500 font-mono mb-8">
            {currentWord.phonetic}
          </p>
          
          {/* Divider - 细线分隔 */}
          <div className={`w-12 h-px bg-slate-200 mb-8 transition-all duration-300 ${isFlipped ? 'opacity-100' : 'opacity-0'}`}></div>

          {/* Chinese Meaning - 中文释义 */}
          <div className={`transition-all duration-300 ${isFlipped ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <p className="text-xl text-slate-700 leading-relaxed">
              {currentWord.chinese}
            </p>
          </div>

          {/* Tap Hint - 点击提示 */}
          {!isFlipped && (
            <p className="absolute bottom-8 left-0 right-0 text-slate-300 text-xs uppercase tracking-wider">
              Tap to reveal
            </p>
          )}
        </div>
      </div>

      {/* Action Buttons - 简洁按钮设计 */}
      <div className="flex gap-3 w-full max-w-md">
        <button 
          onClick={handleNext}
          className="flex-1 py-3.5 px-6 rounded-xl font-semibold bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 text-sm"
        >
          Review Later
        </button>
        <button 
          onClick={handleMarkLearned}
          className="flex-1 py-3.5 px-6 rounded-xl font-semibold bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all duration-200 text-sm"
        >
          Mastered!
        </button>
      </div>
    </div>
  );
};
