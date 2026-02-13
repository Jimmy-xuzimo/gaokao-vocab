import React from 'react';
import { Word } from '../../types';
import { IconBook, IconCheck, IconTrophy, IconList, IconTrash } from '../Icons';

interface DashboardProps {
  words: Word[];
  learnedIds: Set<string>;
  onStartStudy: () => void;
  onStartQuiz: () => void;
  onViewLearned: () => void;
  onViewList: () => void;
  onResetProgress: () => void;
}

/**
 * 仪表盘组件 - 全设备响应式适配版
 * 支持手机、平板、桌面端，布局智能调整
 */
export const Dashboard: React.FC<DashboardProps> = ({
  words,
  learnedIds,
  onStartStudy,
  onStartQuiz,
  onViewLearned,
  onViewList,
  onResetProgress,
}) => {
  const progress = Math.round((learnedIds.size / words.length) * 100) || 0;

  return (
    <div className="w-full max-w-4xl mx-auto animate-fade-in">
      {/* 桌面端/平板：两列布局；手机：单列布局 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧：进度卡片 */}
        <div className="lg:col-span-1">
          <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg shadow-indigo-200 relative overflow-hidden h-full">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white opacity-10 rounded-full blur-3xl"></div>
            <div className="relative z-10 flex flex-col justify-center h-full">
              <p className="text-indigo-100 text-sm font-medium uppercase tracking-wider">Mastery Progress</p>
              <div className="flex items-baseline gap-2 mt-2">
                <h2 className="text-5xl font-bold">{learnedIds.size}</h2>
                <span className="text-2xl font-normal text-indigo-200">/ {words.length}</span>
              </div>
              <div className="mt-4 w-full bg-indigo-900/30 rounded-full h-3">
                <div 
                  className="bg-white h-3 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="mt-3 text-lg text-indigo-100">{progress}% Completed</p>
              
              {/* 桌面端显示圆形进度 */}
              <div className="hidden lg:flex w-20 h-20 mt-4 rounded-full border-4 border-indigo-400 items-center justify-center animate-scale-in">
                <span className="text-xl font-bold">{progress}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* 右侧：功能按钮网格 */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Study Button */}
            <button 
              onClick={onStartStudy}
              className="group bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 p-5 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 text-left flex items-center gap-4"
            >
              <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                <IconBook />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-800">Start Learning</h3>
                <p className="text-sm text-slate-500 mt-1">Flashcards for new words</p>
              </div>
            </button>

            {/* Quiz Button */}
            <button 
              onClick={onStartQuiz}
              className="group bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 p-5 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 text-left flex items-center gap-4"
            >
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                <IconCheck />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-800">Daily Quiz</h3>
                <p className="text-sm text-slate-500 mt-1">Test your knowledge</p>
              </div>
            </button>

            {/* Learned Words Button */}
            <button 
              onClick={onViewLearned}
              className="group bg-white hover:bg-amber-50 border border-slate-200 hover:border-amber-200 p-5 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 text-left flex items-center gap-4"
            >
              <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                <IconTrophy />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-800">Mastered Words</h3>
                <p className="text-sm text-slate-500 mt-1">Review what you know</p>
              </div>
            </button>

            {/* Full Dictionary Button */}
            <button 
              onClick={onViewList}
              className="group bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-200 p-5 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 text-left flex items-center gap-4"
            >
              <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                <IconList />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-800">Full Dictionary</h3>
                <p className="text-sm text-slate-500 mt-1">Browse all 3500 words</p>
              </div>
            </button>
          </div>

          {/* Reset Button */}
          <div className="flex justify-center mt-6">
            <button 
              onClick={onResetProgress}
              className="text-sm text-slate-400 hover:text-red-500 transition-colors flex items-center gap-1"
            >
              <IconTrash className="w-4 h-4" />
              Reset Progress
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
