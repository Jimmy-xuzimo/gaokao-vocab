import React, { useState, useEffect, useMemo, useRef } from 'react';
import { RAW_DATA } from './data';
import { parseVocabulary, generateQuiz } from './utils';
import { Word, AppView, QuizQuestion } from './types';

// Icons
const IconBook = ({ className = "w-5 h-5" }: { className?: string }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>;
const IconCheck = ({ className = "w-5 h-5" }: { className?: string }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const IconList = ({ className = "w-5 h-5" }: { className?: string }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>;
const IconHome = ({ className = "w-5 h-5" }: { className?: string }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;
const IconSearch = ({ className = "w-5 h-5" }: { className?: string }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
const IconXCircle = ({ className = "w-5 h-5" }: { className?: string }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const IconTrophy = ({ className = "w-5 h-5" }: { className?: string }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>;
const IconArrowLeft = ({ className = "w-6 h-6" }: { className?: string }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>;
const IconArrowRight = ({ className = "w-6 h-6" }: { className?: string }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>;
const IconClock = ({ className = "w-5 h-5" }: { className?: string }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;

export default function App() {
  const [words, setWords] = useState<Word[]>([]);
  const [learnedIds, setLearnedIds] = useState<Set<string>>(new Set());
  const [view, setView] = useState<AppView>('dashboard');
  const [isLoading, setIsLoading] = useState(true);

  // Study Mode State
  const [studyQueue, setStudyQueue] = useState<Word[]>([]);
  const [currentStudyIndex, setCurrentStudyIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Quiz Mode State
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  // List View State
  const [searchTerm, setSearchTerm] = useState('');
  const [displayLimit, setDisplayLimit] = useState(50);
  const listContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTimeout(() => {
      const parsed = parseVocabulary(RAW_DATA);
      setWords(parsed);
      const savedProgress = localStorage.getItem('gaokao-learned');
      if (savedProgress) {
        setLearnedIds(new Set(JSON.parse(savedProgress)));
      }
      setIsLoading(false);
    }, 100); 
  }, []);

  const getFilteredWords = (onlyLearned: boolean = false) => {
    let list = onlyLearned ? words.filter(w => learnedIds.has(w.id)) : words;
    if (!searchTerm) return list;
    const lowerTerm = searchTerm.toLowerCase();
    return list.filter(w => 
      w.english.toLowerCase().includes(lowerTerm) || w.chinese.includes(lowerTerm)
    );
  };

  const filteredWords = useMemo(() => getFilteredWords(view === 'learned'), [words, searchTerm, view, learnedIds]);
  const visibleWords = useMemo(() => filteredWords.slice(0, displayLimit), [filteredWords, displayLimit]);

  useEffect(() => {
    setDisplayLimit(50);
    setSearchTerm('');
    if (listContainerRef.current) listContainerRef.current.scrollTop = 0;
  }, [view]);

  const handleListScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollTop + clientHeight >= scrollHeight - 100) {
      if (displayLimit < filteredWords.length) setDisplayLimit(prev => prev + 50);
    }
  };

  const markAsLearned = (id: string) => {
    const newSet = new Set(learnedIds);
    newSet.add(id);
    setLearnedIds(newSet);
    localStorage.setItem('gaokao-learned', JSON.stringify(Array.from(newSet)));
  };

  const startStudy = () => {
    const unlearned = words.filter(w => !learnedIds.has(w.id));
    const pool = unlearned.length > 0 ? unlearned : words;
    const session = pool.sort(() => 0.5 - Math.random()).slice(0, 50);
    setStudyQueue(session);
    setCurrentStudyIndex(0);
    setIsFlipped(false);
    setView('study');
  };

  const startQuiz = () => {
    const qs = generateQuiz(words, 20);
    setQuizQuestions(qs);
    setCurrentQuizIndex(0);
    setQuizScore(0);
    setQuizFinished(false);
    setSelectedOption(null);
    setView('quiz');
  };

  const handleQuizAnswer = (index: number) => {
    if (selectedOption !== null) return;
    setSelectedOption(index);
    if (index === quizQuestions[currentQuizIndex].correctIndex) {
      setQuizScore(prev => prev + 1);
    }
    setTimeout(() => {
      if (currentQuizIndex < quizQuestions.length - 1) {
        setCurrentQuizIndex(prev => prev + 1);
        setSelectedOption(null);
      } else {
        setQuizFinished(true);
      }
    }, 1500);
  };

  const handleStudyPrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentStudyIndex > 0) {
      setIsFlipped(false);
      setTimeout(() => setCurrentStudyIndex(curr => curr - 1), 150);
    }
  };

  const handleStudyNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentStudyIndex < studyQueue.length - 1) {
      setIsFlipped(false);
      setTimeout(() => setCurrentStudyIndex(curr => curr + 1), 150);
    } else {
      setView('dashboard');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-primary">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  const progress = Math.round((learnedIds.size / words.length) * 100) || 0;
  const studyProgress = studyQueue.length > 0 ? ((currentStudyIndex + 1) / studyQueue.length) * 100 : 0;

  return (
    <div className="h-[100dvh] bg-slate-50 text-slate-900 font-sans flex flex-col overflow-hidden">
      <header className="bg-white shadow-sm shrink-0 z-30 relative">
        <div className="max-w-4xl mx-auto px-4 h-14 sm:h-16 flex items-center justify-between">
          <h1 className="text-lg sm:text-xl font-bold text-slate-800 flex items-center gap-2">
            <span className="bg-indigo-600 text-white rounded-lg p-1 text-sm sm:text-base">VM</span>
            Vocab Master
          </h1>
          {view !== 'dashboard' && (
            <button onClick={() => setView('dashboard')} className="text-sm text-slate-500 hover:text-indigo-600 transition-colors font-medium px-2 py-1 rounded-md hover:bg-slate-100">Back Home</button>
          )}
        </div>
      </header>

      <main className="flex-1 overflow-y-auto relative w-full bg-slate-50">
        <div className={`max-w-4xl mx-auto min-h-full flex flex-col box-border ${view === 'study' ? 'p-3 sm:p-4' : 'p-3 sm:p-4 pb-20 sm:pb-8'}`}>
          
          {view === 'dashboard' && (
            <div className="flex flex-col gap-4 sm:gap-6 animate-in fade-in duration-500">
              <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-2xl p-5 sm:p-8 text-white shadow-lg shadow-indigo-200 relative overflow-hidden shrink-0">
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white opacity-10 rounded-full blur-3xl"></div>
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-indigo-100 text-xs sm:text-sm font-medium uppercase tracking-wider">Mastery Progress</p>
                    <div className="flex items-baseline gap-2 mt-1">
                      <h2 className="text-3xl sm:text-5xl font-bold">{learnedIds.size}</h2>
                      <span className="text-lg sm:text-2xl font-normal text-indigo-200">/ {words.length}</span>
                    </div>
                    <div className="mt-3 sm:mt-4 w-full bg-indigo-900/30 rounded-full h-2 max-w-xs">
                      <div className="bg-white h-2 rounded-full transition-all duration-1000" style={{ width: `${progress}%` }}></div>
                    </div>
                    <p className="mt-2 text-xs sm:text-sm text-indigo-100">{progress}% Completed</p>
                  </div>
                  <div className="hidden sm:flex w-24 h-24 rounded-full border-4 border-indigo-400 items-center justify-center shrink-0 ml-4">
                    <span className="text-2xl font-bold">{progress}%</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3 sm:gap-4">
                <button onClick={startStudy} className="group bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 p-5 rounded-xl shadow-sm hover:shadow-md transition-all text-left flex flex-row sm:flex-col items-center sm:items-start gap-4 sm:gap-0">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center sm:mb-3 shrink-0 group-hover:scale-110 transition-transform"><IconBook /></div>
                  <div><h3 className="text-base sm:text-lg font-bold text-slate-800">Start Learning</h3><p className="text-xs sm:text-sm text-slate-500 mt-0.5 sm:mt-1">Flashcards for new words.</p></div>
                </button>
                <button onClick={startQuiz} className="group bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 p-5 rounded-xl shadow-sm hover:shadow-md transition-all text-left flex flex-row sm:flex-col items-center sm:items-start gap-4 sm:gap-0">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center sm:mb-3 shrink-0 group-hover:scale-110 transition-transform"><IconCheck /></div>
                  <div><h3 className="text-base sm:text-lg font-bold text-slate-800">Daily Quiz</h3><p className="text-xs sm:text-sm text-slate-500 mt-0.5 sm:mt-1">Test your knowledge.</p></div>
                </button>
                <button onClick={() => setView('learned')} className="group bg-white hover:bg-amber-50 border border-slate-200 hover:border-amber-200 p-5 rounded-xl shadow-sm hover:shadow-md transition-all text-left flex flex-row sm:flex-col items-center sm:items-start gap-4 sm:gap-0">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center sm:mb-3 shrink-0 group-hover:scale-110 transition-transform"><IconTrophy /></div>
                  <div><h3 className="text-base sm:text-lg font-bold text-slate-800">Mastered Words</h3><p className="text-xs sm:text-sm text-slate-500 mt-0.5 sm:mt-1">Review what you know.</p></div>
                </button>
                <button onClick={() => setView('list')} className="group bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-200 p-5 rounded-xl shadow-sm hover:shadow-md transition-all text-left flex flex-row sm:flex-col items-center sm:items-start gap-4 sm:gap-0">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center sm:mb-3 shrink-0 group-hover:scale-110 transition-transform"><IconList /></div>
                  <div><h3 className="text-base sm:text-lg font-bold text-slate-800">Full Dictionary</h3><p className="text-xs sm:text-sm text-slate-500 mt-0.5 sm:mt-1">Browse all 3500 words.</p></div>
                </button>
              </div>
            </div>
          )}

          {view === 'study' && studyQueue.length > 0 && (
            <div className="h-full flex flex-col max-w-md mx-auto w-full animate-in slide-in-from-bottom-4 duration-500">
              <div className="shrink-0 mb-3">
                <div className="flex justify-between items-center mb-2">
                  <button onClick={handleStudyPrev} disabled={currentStudyIndex === 0} className={`p-2 rounded-full hover:bg-slate-200 transition-colors ${currentStudyIndex === 0 ? 'opacity-30 cursor-not-allowed' : 'text-slate-600'}`}><IconArrowLeft /></button>
                  <div className="text-slate-400 text-sm font-medium tracking-wider">{currentStudyIndex + 1} / {studyQueue.length}</div>
                  <button onClick={handleStudyNext} className="p-2 rounded-full hover:bg-slate-200 text-slate-600 transition-colors"><IconArrowRight /></button>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1.5"><div className="bg-indigo-500 h-1.5 rounded-full transition-all duration-300" style={{ width: `${studyProgress}%` }}></div></div>
              </div>
              
              <div className="flex-1 w-full bg-white rounded-3xl shadow-xl border border-slate-100 relative overflow-hidden flex flex-col mb-3 cursor-pointer hover:shadow-2xl transition-all" onClick={() => setIsFlipped(!isFlipped)}>
                <div className="absolute top-4 right-4 z-10">
                   {learnedIds.has(studyQueue[currentStudyIndex].id) ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold shadow-sm"><IconCheck className="w-3 h-3" /> Mastered</span>
                   ) : (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-bold shadow-sm"><IconClock className="w-3 h-3" /> Reviewing</span>
                   )}
                </div>
                {/* 修复：让单词位置固定，不随内容居中而跳动 */}
                <div className="absolute inset-0 flex flex-col text-center overflow-y-auto no-scrollbar">
                  <div className="pt-20 sm:pt-32 px-6 shrink-0 flex flex-col items-center">
                    <h2 className="text-3xl sm:text-5xl font-bold text-slate-900 mb-2 sm:mb-4 break-words">{studyQueue[currentStudyIndex].english}</h2>
                    <p className="text-lg sm:text-xl text-indigo-500 font-mono">{studyQueue[currentStudyIndex].phonetic}</p>
                  </div>
                  <div className="px-6 pb-6 mt-8 sm:mt-12 flex flex-col items-center">
                    <div className={`h-px w-16 bg-slate-200 mb-6 transition-opacity duration-300 ${isFlipped ? 'opacity-100' : 'opacity-0'}`}></div>
                    <div className={`transition-opacity duration-300 ${isFlipped ? 'opacity-100' : 'opacity-0'}`}>
                      <p className="text-lg sm:text-2xl text-slate-700 font-medium leading-relaxed">{studyQueue[currentStudyIndex].chinese}</p>
                    </div>
                    {!isFlipped && <p className="text-slate-300 text-xs uppercase tracking-widest animate-pulse mt-8">Tap to reveal</p>}
                  </div>
                </div>
              </div>

              {/* 修复：按钮贴底 */}
              <div className="flex gap-3 sm:gap-4 shrink-0 mt-auto pb-2 sm:pb-0">
                <button onClick={handleStudyNext} className="flex-1 py-3.5 sm:py-4 rounded-xl font-bold bg-white border-2 border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all text-sm sm:text-base">Review Later</button>
                <button onClick={() => { markAsLearned(studyQueue[currentStudyIndex].id); handleStudyNext({ stopPropagation: () => {} } as any); }} className="flex-1 py-3.5 sm:py-4 rounded-xl font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all active:scale-95 text-sm sm:text-base">Mastered!</button>
              </div>
            </div>
          )}

          {view === 'quiz' && quizQuestions.length > 0 && (
            <div className="max-w-lg mx-auto h-full flex flex-col">
              {!quizFinished ? (
                <div className="animate-in fade-in duration-300 flex-1 flex flex-col">
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-xs sm:text-sm font-bold text-slate-400 uppercase tracking-wider">Question {currentQuizIndex + 1}/20</span>
                    <span className="text-xs sm:text-sm font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">Score: {quizScore}</span>
                  </div>
                  <div className="bg-white rounded-2xl shadow-md p-6 sm:p-10 mb-6 text-center border border-slate-100 transition-all duration-300 shrink-0">
                    <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-3">{quizQuestions[currentQuizIndex].word.english}</h2>
                    <p className="text-slate-400 font-mono text-lg">{quizQuestions[currentQuizIndex].word.phonetic}</p>
                    <div className="h-8 mt-4 flex items-center justify-center">
                      <div className={`transition-all duration-300 ${selectedOption !== null ? 'opacity-100 transform scale-100' : 'opacity-0 transform scale-90'}`}>
                        {selectedOption !== null && (
                          <div className={`text-lg sm:text-xl font-bold flex items-center gap-2 ${selectedOption === quizQuestions[currentQuizIndex].correctIndex ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {selectedOption === quizQuestions[currentQuizIndex].correctIndex ? <><IconCheck /> Correct! 🎉</> : <><IconXCircle /> Not quite!</>}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3 sm:space-y-4 flex-1 overflow-y-auto pb-4">
                    {quizQuestions[currentQuizIndex].options.map((option, idx) => {
                      let btnClass = "w-full p-4 sm:p-5 rounded-xl border-2 text-left font-medium text-sm sm:text-base transition-all duration-200 ";
                      if (selectedOption === null) {
                        btnClass += "bg-white border-slate-200 hover:border-indigo-400 hover:bg-indigo-50 text-slate-700 shadow-sm";
                      } else {
                        if (idx === quizQuestions[currentQuizIndex].correctIndex) btnClass += "bg-emerald-100 border-emerald-500 text-emerald-800 shadow-sm";
                        else if (idx === selectedOption) btnClass += "bg-rose-100 border-rose-500 text-rose-800";
                        else btnClass += "bg-slate-50 border-slate-100 text-slate-400 opacity-50";
                      }
                      return <button key={idx} disabled={selectedOption !== null} onClick={() => handleQuizAnswer(idx)} className={btnClass}>{option}</button>;
                    })}
                  </div>
                </div>
              ) : (
                <div className="text-center py-10 animate-in zoom-in duration-500 h-full flex flex-col justify-center items-center">
                  <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-tr from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mb-8 shadow-inner"><span className="text-5xl sm:text-6xl">🏆</span></div>
                  <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-3">Quiz Complete!</h2>
                  <p className="text-lg text-slate-500 mb-10">You scored <span className="font-bold text-indigo-600 text-2xl">{quizScore}</span> out of 20</p>
                  <div className="flex flex-col sm:flex-row gap-4 w-full max-w-xs">
                    <button onClick={startQuiz} className="w-full px-8 py-3.5 rounded-xl font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all active:scale-95">Try Again</button>
                    <button onClick={() => setView('dashboard')} className="w-full px-8 py-3.5 rounded-xl font-bold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors">Back Home</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {(view === 'list' || view === 'learned') && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full animate-in fade-in duration-300">
              <div className="p-4 border-b border-slate-100 bg-white sticky top-0 z-20 space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="font-bold text-lg text-slate-800">{view === 'learned' ? 'Mastered Words' : 'Dictionary'}</h2>
                  <span className="text-xs font-medium bg-slate-100 px-2 py-1 rounded text-slate-500">{filteredWords.length} words</span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><IconSearch /></div>
                  <input type="text" placeholder={view === 'learned' ? "Search mastered words..." : "Search dictionary..."} className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
              </div>
              <div ref={listContainerRef} onScroll={handleListScroll} className="flex-1 overflow-y-auto divide-y divide-slate-50">
                {visibleWords.map((w) => {
                  const isLearned = learnedIds.has(w.id);
                  return (
                    <div key={w.id} className="p-4 hover:bg-slate-50 flex items-center justify-between group transition-colors">
                      <div className="flex-1 pr-4">
                        <div className="flex items-baseline gap-2"><span className="font-bold text-slate-800 text-lg">{w.english}</span><span className="font-mono text-slate-400 text-xs sm:text-sm">{w.phonetic}</span></div>
                        <div className="text-sm text-slate-600 mt-1 line-clamp-2 leading-relaxed">{w.chinese}</div>
                      </div>
                      {isLearned ? (
                        <div className="shrink-0 flex flex-col items-center gap-1"><span className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center"><IconCheck /></span><span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wide">Mastered</span></div>
                      ) : (
                        view === 'list' && <button onClick={() => markAsLearned(w.id)} className="shrink-0 w-8 h-8 text-slate-300 hover:text-indigo-500 hover:bg-indigo-50 rounded-full flex items-center justify-center transition-all" title="Mark as learned"><IconCheck /></button>
                      )}
                    </div>
                  );
                })}
                {displayLimit < filteredWords.length && <div className="p-4 text-center"><div className="inline-block w-6 h-6 border-2 border-slate-200 border-t-indigo-500 rounded-full animate-spin"></div></div>}
                {filteredWords.length === 0 && <div className="p-10 text-center text-slate-400 flex flex-col items-center gap-2"><IconSearch /><p>No words found matching "{searchTerm}"</p></div>}
              </div>
            </div>
          )}
        </div>
      </main>

      <div className="bg-white border-t border-slate-200 flex justify-around p-1 pb-safe sm:hidden z-40 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] shrink-0 h-16">
        <button onClick={() => setView('dashboard')} className={`flex-1 flex flex-col items-center justify-center p-1 rounded-lg transition-colors ${view === 'dashboard' ? 'text-indigo-600' : 'text-slate-400 hover:bg-slate-50'}`}><IconHome /><span className="text-[10px] font-medium mt-1">Home</span></button>
        <button onClick={startStudy} className={`flex-1 flex flex-col items-center justify-center p-1 rounded-lg transition-colors ${view === 'study' ? 'text-indigo-600' : 'text-slate-400 hover:bg-slate-50'}`}><IconBook /><span className="text-[10px] font-medium mt-1">Study</span></button>
        <button onClick={() => setView('list')} className={`flex-1 flex flex-col items-center justify-center p-1 rounded-lg transition-colors ${view === 'list' ? 'text-indigo-600' : 'text-slate-400 hover:bg-slate-50'}`}><IconList /><span className="text-[10px] font-medium mt-1">Dict</span></button>
      </div>
    </div>
  );
}
