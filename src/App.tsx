import { useState, useEffect, useMemo, useCallback } from 'react';
import { RAW_DATA } from './data';
import { parseVocabulary, generateQuiz, sample } from './utils';
import { Word, AppView, QuizQuestion } from './types';
import { useLocalStorage } from './hooks';
import { Dashboard, StudyMode, QuizMode, WordList, ErrorBoundary } from './components';
import { IconHome, IconBook, IconList, IconChart, IconMenu, IconX, IconAlertCircle } from './components/Icons';

/**
 * 主应用组件 - iPad端优化版
 * 侧边栏可隐藏、布局对齐、统一设计风格
 */
export default function App() {
  // 全局状态
  const [words, setWords] = useState<Word[]>([]);
  const [learnedIds, setLearnedIds] = useLocalStorage<Set<string>>('gaokao-learned', new Set());
  const [view, setView] = useState<AppView>('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  
  // 侧边栏显示状态 - iPad和桌面端可切换
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // 学习模式状态
  const [studyQueue, setStudyQueue] = useState<Word[]>([]);

  // 测验模式状态
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);

  // 加载数据
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const parsed = parseVocabulary(RAW_DATA);
        setWords(parsed);
        setLoadError(null);
      } catch (error) {
        setLoadError('Failed to load vocabulary data. Please refresh the page.');
      } finally {
        setIsLoading(false);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // 标记单词为已学习
  const markAsLearned = useCallback((id: string) => {
    setLearnedIds(prev => {
      const newSet = new Set(prev);
      newSet.add(id);
      return newSet;
    });
  }, [setLearnedIds]);

  // 重置进度
  const resetProgress = useCallback(() => {
    if (window.confirm('确定要清空所有背诵进度吗？此操作无法撤销。\nAre you sure you want to reset all progress?')) {
      setLearnedIds(new Set());
    }
  }, [setLearnedIds]);

  // 开始学习模式
  const startStudy = useCallback(() => {
    const unlearned = words.filter(w => !learnedIds.has(w.id));
    const pool = unlearned.length > 0 ? unlearned : words;
    const session = sample(pool, 50);
    setStudyQueue(session);
    setView('study');
  }, [words, learnedIds]);

  // 开始测验模式
  const startQuiz = useCallback(() => {
    const qs = generateQuiz(words, 20);
    setQuizQuestions(qs);
    setView('quiz');
  }, [words]);

  // 获取已学习的单词
  const learnedWords = useMemo(() => {
    return words.filter(w => learnedIds.has(w.id));
  }, [words, learnedIds]);
  
  // 切换侧边栏
  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen(prev => !prev);
  }, []);

  // 错误状态显示
  if (loadError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <IconAlertCircle className="w-8 h-8 text-rose-500" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Loading Error</h2>
          <p className="text-slate-500 mb-6">{loadError}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full py-3 rounded-xl font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  // 加载中状态
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="font-medium text-slate-600">Loading 3500 Words...</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex overflow-hidden">
        {/* 侧边导航栏 - iPad和桌面端显示，可折叠 */}
        <aside 
          className={`hidden md:flex flex-col bg-white border-r border-slate-200 fixed h-full z-40 transition-all duration-300 ease-in-out ${
            isSidebarOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full overflow-hidden'
          }`}
        >
          {/* Logo */}
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2 whitespace-nowrap">
              <span className="bg-indigo-600 text-white rounded-lg p-1.5 text-sm">VM</span>
              Vocab Master
            </h1>
            {/* 关闭按钮 */}
            <button 
              onClick={toggleSidebar}
              className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors lg:hidden"
            >
              <IconX className="w-5 h-5" />
            </button>
          </div>
          
          {/* 导航菜单 */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            <button 
              onClick={() => setView('dashboard')} 
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${view === 'dashboard' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <IconHome />
              <span className="font-medium whitespace-nowrap">Home</span>
            </button>
            <button 
              onClick={startStudy} 
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${view === 'study' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <IconBook />
              <span className="font-medium whitespace-nowrap">Study</span>
            </button>
            <button 
              onClick={() => setView('list')} 
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${view === 'list' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <IconList />
              <span className="font-medium whitespace-nowrap">Dictionary</span>
            </button>
            <button 
              onClick={() => setView('learned')} 
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${view === 'learned' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <IconChart />
              <span className="font-medium whitespace-nowrap">Progress</span>
            </button>
          </nav>
          
          {/* 底部统计 */}
          <div className="p-4 border-t border-slate-100">
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-xs text-slate-500 mb-1">Learning Progress</p>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-slate-800">{learnedIds.size}</span>
                <span className="text-sm text-slate-400">/ {words.length}</span>
              </div>
              <div className="mt-2 w-full bg-slate-200 rounded-full h-1.5">
                <div 
                  className="bg-indigo-500 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${Math.round((learnedIds.size / words.length) * 100) || 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        </aside>

        {/* 主内容区域 */}
        <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'md:ml-64' : 'md:ml-0'}`}>
          {/* Header - 统一风格 */}
          <header className="bg-white shadow-sm shrink-0 z-30 relative">
            <div className="max-w-6xl mx-auto px-4 h-14 sm:h-16 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* 侧边栏切换按钮 - iPad和桌面端显示 */}
                <button
                  onClick={toggleSidebar}
                  className="hidden md:flex p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
                >
                  <IconMenu className="w-5 h-5" />
                </button>
                
                {/* Logo - 移动端显示 */}
                <h1 className="md:hidden text-lg sm:text-xl font-bold text-slate-800 flex items-center gap-2">
                  <span className="bg-indigo-600 text-white rounded-lg p-1 text-sm sm:text-base">VM</span>
                  Vocab Master
                </h1>
              </div>
              
              {view !== 'dashboard' && (
                <button
                  onClick={() => setView('dashboard')}
                  className="text-sm text-slate-500 hover:text-indigo-600 transition-colors font-medium px-3 py-1.5 rounded-md hover:bg-slate-100"
                >
                  Back Home
                </button>
              )}
            </div>
          </header>

          {/* Main Content Area - 居中对齐 */}
          <main className="flex-1 relative w-full overflow-y-auto pb-20 md:pb-0">
            <div className="max-w-6xl mx-auto min-h-full flex flex-col justify-center box-border p-4 sm:p-6 lg:p-8">
              
              {/* DASHBOARD */}
              {view === 'dashboard' && (
                <Dashboard
                  words={words}
                  learnedIds={learnedIds}
                  onStartStudy={startStudy}
                  onStartQuiz={startQuiz}
                  onViewLearned={() => setView('learned')}
                  onViewList={() => setView('list')}
                  onResetProgress={resetProgress}
                />
              )}

              {/* STUDY VIEW */}
              {view === 'study' && studyQueue.length > 0 && (
                <StudyMode
                  studyQueue={studyQueue}
                  learnedIds={learnedIds}
                  onMarkAsLearned={markAsLearned}
                  onGoHome={() => setView('dashboard')}
                />
              )}

              {/* QUIZ VIEW */}
              {view === 'quiz' && quizQuestions.length > 0 && (
                <QuizMode
                  questions={quizQuestions}
                  onGoHome={() => setView('dashboard')}
                  onRestart={startQuiz}
                />
              )}

              {/* LIST VIEW */}
              {view === 'list' && (
                <WordList
                  words={words}
                  learnedIds={learnedIds}
                  onMarkAsLearned={markAsLearned}
                  title="Dictionary"
                  showMarkButton={true}
                />
              )}

              {/* LEARNED WORDS VIEW */}
              {view === 'learned' && (
                <WordList
                  words={learnedWords}
                  learnedIds={learnedIds}
                  onMarkAsLearned={markAsLearned}
                  title="Mastered Words"
                  showMarkButton={false}
                />
              )}
            </div>
          </main>

          {/* Mobile Navigation Bar - 手机端显示 */}
          <nav className="fixed bottom-0 left-0 right-0 md:left-0 bg-white border-t border-slate-200 flex justify-around p-1 pb-safe md:hidden z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] h-16">
            <button 
              onClick={() => setView('dashboard')} 
              className={`flex-1 flex flex-col items-center justify-center p-1 rounded-lg transition-colors duration-200 ${view === 'dashboard' ? 'text-indigo-600' : 'text-slate-400 hover:bg-slate-50'}`}
            >
              <IconHome />
              <span className="text-[10px] font-medium mt-1">Home</span>
            </button>
            <button 
              onClick={startStudy} 
              className={`flex-1 flex flex-col items-center justify-center p-1 rounded-lg transition-colors duration-200 ${view === 'study' ? 'text-indigo-600' : 'text-slate-400 hover:bg-slate-50'}`}
            >
              <IconBook />
              <span className="text-[10px] font-medium mt-1">Study</span>
            </button>
            <button 
              onClick={() => setView('list')} 
              className={`flex-1 flex flex-col items-center justify-center p-1 rounded-lg transition-colors duration-200 ${view === 'list' ? 'text-indigo-600' : 'text-slate-400 hover:bg-slate-50'}`}
            >
              <IconList />
              <span className="text-[10px] font-medium mt-1">Dict</span>
            </button>
          </nav>
        </div>
      </div>
    </ErrorBoundary>
  );
}
