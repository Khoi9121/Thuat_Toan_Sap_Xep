/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  KidSortStep,
  getInsertionSteps,
  getCorrectInsertionIndex,
  explainWrongInsertion,
  performInsertion,
  createKidNumbers,
} from './utils/algorithms';
import { soundFx } from './utils/audio';
import { StartScreen } from './components/StartScreen';
import { CustomNumbersModal } from './components/CustomNumbersModal';
import { ComparisonResultModal } from './components/ComparisonResultModal';

import {
  Play,
  RotateCcw,
  Shuffle,
  Home,
  Bot,
  User,
  Clock,
  Trophy,
  Volume2,
  VolumeX,
  Edit3,
  Smile,
  ArrowRight,
  ArrowDown,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  AlertCircle,
  BookOpen,
} from 'lucide-react';

export default function App() {
  // Screen: 'start' | 'battle'
  const [screen, setScreen] = useState<'start' | 'battle'>('start');

  // Shared Initial Numbers for both Human & AI
  const [initialNumbers, setInitialNumbers] = useState<number[]>(() => [24, 7, 35, 12, 5, 18]);

  // Human Lane States
  const [humanArray, setHumanArray] = useState<number[]>(() => [24, 7, 35, 12, 5, 18]);
  const [humanCurrentI, setHumanCurrentI] = useState<number>(1); // starts at index 1
  const [humanKeySelected, setHumanKeySelected] = useState<boolean>(false);
  const [humanStatus, setHumanStatus] = useState<'idle' | 'running' | 'completed'>('idle');
  const [humanTime, setHumanTime] = useState<number>(0);
  const [humanFeedback, setHumanFeedback] = useState<{ type: 'info' | 'success' | 'error'; text: string }>({
    type: 'info',
    text: 'Bấm "BẮT ĐẦU XẾP" để tính giờ! Phần tử đầu tiên [24] được xem là đã sắp xếp.',
  });
  const humanTimerRef = useRef<NodeJS.Timeout | null>(null);
  const humanStartTimeRef = useRef<number>(0);

  // AI Robot Lane States
  const [aiArray, setAiArray] = useState<number[]>(() => [24, 7, 35, 12, 5, 18]);
  const [aiSteps, setAiSteps] = useState<KidSortStep[]>([]);
  const [aiStepIdx, setAiStepIdx] = useState<number>(0);
  const [aiStatus, setAiStatus] = useState<'waiting' | 'ready' | 'running' | 'completed'>('waiting');
  const [aiTime, setAiTime] = useState<number>(0);
  const aiTimerRef = useRef<NodeJS.Timeout | null>(null);
  const aiStartTimeRef = useRef<number>(0);
  const aiPlaybackTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Modals & General
  const [isCustomModalOpen, setIsCustomModalOpen] = useState<boolean>(false);
  const [showComparisonModal, setShowComparisonModal] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Initialize a new battle round with custom or generated numbers
  const initRound = useCallback((nums?: number[]) => {
    if (humanTimerRef.current) clearInterval(humanTimerRef.current);
    if (aiTimerRef.current) clearInterval(aiTimerRef.current);
    if (aiPlaybackTimerRef.current) clearInterval(aiPlaybackTimerRef.current);

    const base = nums || createKidNumbers(6);
    setInitialNumbers(base);
    setHumanArray([...base]);
    setHumanCurrentI(1);
    setHumanKeySelected(false);
    setHumanStatus('idle');
    setHumanTime(0);
    setHumanFeedback({
      type: 'info',
      text: `Dãy số mới: [${base.join(', ')}]. Số đầu tiên [${base[0]}] coi như đã nằm đúng chỗ! Bấm BẮT ĐẦU XẾP nào!`,
    });

    setAiArray([...base]);
    const steps = getInsertionSteps(base);
    setAiSteps(steps);
    setAiStepIdx(0);
    setAiStatus('waiting');
    setAiTime(0);

    setShowComparisonModal(false);
  }, []);

  // Handle start from home
  const handleStartFromHome = () => {
    initRound(initialNumbers);
    setScreen('battle');
  };

  // Human: Start Timer & Playing
  const handleStartHuman = () => {
    if (humanStatus === 'running') return;
    setHumanStatus('running');
    setHumanCurrentI(1);
    setHumanKeySelected(false);
    soundFx.playPop(650);

    humanStartTimeRef.current = performance.now();
    humanTimerRef.current = setInterval(() => {
      const elapsed = (performance.now() - humanStartTimeRef.current) / 1000;
      setHumanTime(elapsed);
    }, 50);

    setHumanFeedback({
      type: 'info',
      text: `👉 Bước 1: Hãy nhấp chọn phần tử thứ 2 (số [${humanArray[1]}]) làm phần tử cần chèn (Key)!`,
    });
  };

  // Student clicks on an element in the array
  const handleHumanItemClick = (idx: number) => {
    if (humanStatus === 'completed') return;

    if (humanStatus === 'idle') {
      handleStartHuman();
      return;
    }

    if (!humanKeySelected) {
      // Must select the element at index currentI!
      if (idx === humanCurrentI) {
        setHumanKeySelected(true);
        soundFx.playPop(550);
        setHumanFeedback({
          type: 'info',
          text: `Đã chọn số [${humanArray[idx]}] làm Key! Bây giờ hãy so sánh từ phải sang trái và chọn vị trí chèn thích hợp phía trước!`,
        });
      } else {
        // Wrong selection order!
        soundFx.playPop(300);
        setHumanFeedback({
          type: 'error',
          text: `⚠️ Chưa đúng thứ tự! Theo thuật toán, bé phải chọn phần tử thứ ${humanCurrentI + 1} (số [${humanArray[humanCurrentI]}]) làm phần tử cần chèn nhé! Không được chọn bừa.`,
        });
      }
    } else {
      // Already selected key, clicking on a slot/index to insert into
      handleInsertIntoPosition(idx);
    }
  };

  // Student chooses target insertion slot
  const handleInsertIntoPosition = (targetSlot: number) => {
    if (!humanKeySelected) return;

    // Allowed insertion slots are 0 to humanCurrentI
    if (targetSlot < 0 || targetSlot > humanCurrentI) {
      soundFx.playPop(300);
      setHumanFeedback({
        type: 'error',
        text: `⚠️ Bé chỉ được chèn vào các vị trí từ đầu dãy đến vị trí #${humanCurrentI + 1} thôi nha!`,
      });
      return;
    }

    const correctIndex = getCorrectInsertionIndex(humanArray, humanCurrentI);

    if (targetSlot === correctIndex) {
      // Correct move according to insertion sort algorithm!
      const keyVal = humanArray[humanCurrentI];
      const nextArr = performInsertion(humanArray, humanCurrentI, targetSlot);
      setHumanArray(nextArr);
      setHumanKeySelected(false);
      soundFx.playPop(700);

      const nextI = humanCurrentI + 1;
      setHumanCurrentI(nextI);

      if (nextI >= nextArr.length) {
        // Completed all items!
        if (humanTimerRef.current) clearInterval(humanTimerRef.current);
        const finalHumanTime = (performance.now() - humanStartTimeRef.current) / 1000;
        setHumanTime(finalHumanTime);
        setHumanStatus('completed');
        setAiStatus('ready');
        soundFx.playVictory();

        setHumanFeedback({
          type: 'success',
          text: `🎉 XUẤT SẮC! Bé đã chèn đúng 100% theo thuật toán trong ${finalHumanTime.toFixed(2)}s! Hãy bấm nút bên phải để xem Robot AI làm nhé!`,
        });
      } else {
        setHumanFeedback({
          type: 'success',
          text: `Đúng rồi! Đã chèn [${keyVal}] vào vị trí #${targetSlot + 1}. Tiếp tục: Hãy chọn số [${nextArr[nextI]}] ở vị trí #${nextI + 1} làm Key tiếp theo!`,
        });
      }
    } else {
      // Wrong position! Explain why
      soundFx.playPop(320);
      const explanation = explainWrongInsertion(humanArray, humanCurrentI, targetSlot);
      setHumanFeedback({
        type: 'error',
        text: `❌ ${explanation}`,
      });
    }
  };

  // AI: Start Robot AI insertion playback
  const handleStartAi = () => {
    if (aiStatus === 'running' || aiStatus === 'completed') return;
    setAiStatus('running');
    soundFx.playPop(750);

    aiStartTimeRef.current = performance.now();
    aiTimerRef.current = setInterval(() => {
      const elapsed = (performance.now() - aiStartTimeRef.current) / 1000;
      setAiTime(elapsed);
    }, 50);

    // Run AI steps sequentially
    let step = 0;
    aiPlaybackTimerRef.current = setInterval(() => {
      step++;
      if (step < aiSteps.length) {
        setAiStepIdx(step);
        setAiArray([...aiSteps[step].array]);
        soundFx.playNote(step);
      } else {
        // AI Done!
        if (aiPlaybackTimerRef.current) clearInterval(aiPlaybackTimerRef.current);
        if (aiTimerRef.current) clearInterval(aiTimerRef.current);

        const finalAiTime = (performance.now() - aiStartTimeRef.current) / 1000;
        setAiTime(finalAiTime);
        setAiStatus('completed');
        soundFx.playVictory();

        // Open Comparison Modal after brief pause
        setTimeout(() => {
          setShowComparisonModal(true);
        }, 800);
      }
    }, 550);
  };

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (humanTimerRef.current) clearInterval(humanTimerRef.current);
      if (aiTimerRef.current) clearInterval(aiTimerRef.current);
      if (aiPlaybackTimerRef.current) clearInterval(aiPlaybackTimerRef.current);
    };
  }, []);

  // Handle custom numbers apply
  const handleApplyCustomNumbers = (newNums: number[]) => {
    initRound(newNums);
  };

  // Colors
  const barColors = [
    'from-rose-400 to-pink-500',
    'from-amber-400 to-orange-500',
    'from-yellow-400 to-amber-500',
    'from-emerald-400 to-teal-500',
    'from-sky-400 to-blue-500',
    'from-indigo-400 to-purple-500',
    'from-fuchsia-400 to-rose-500',
  ];

  return (
    <div className="min-h-screen bg-[#f0fdf4] text-slate-800 flex flex-col justify-between selection:bg-amber-300">
      {/* Top Navbar */}
      <header className="bg-white border-b-2 border-emerald-100 px-4 py-3 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => {
              if (humanTimerRef.current) clearInterval(humanTimerRef.current);
              if (aiTimerRef.current) clearInterval(aiTimerRef.current);
              if (aiPlaybackTimerRef.current) clearInterval(aiPlaybackTimerRef.current);
              setScreen('start');
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-100 hover:bg-sky-200 text-sky-800 font-bold text-xs sm:text-sm transition-all cursor-pointer"
          >
            <Home className="w-4 h-4 text-sky-600" />
            <span>Trang Chủ</span>
          </button>

          <span className="hidden sm:inline text-slate-300">|</span>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-100 text-emerald-900 font-bold text-xs sm:text-sm">
            <span>📚 Thuật Toán Sắp Xếp Chèn Trực Tiếp (Insertion Sort)</span>
          </div>
        </div>

        {/* Right audio button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              soundFx.isMuted = !isMuted;
              setIsMuted(!isMuted);
            }}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer"
            title={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4 text-emerald-600" />}
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 flex flex-col justify-between">
        {screen === 'start' ? (
          <StartScreen
            currentNumbers={initialNumbers}
            onOpenCustomNumbers={() => {
              soundFx.playPop(550);
              setIsCustomModalOpen(true);
            }}
            onStart={handleStartFromHome}
          />
        ) : (
          <div className="space-y-4">
            {/* Algorithm Principle Card (Quy tắc thuật toán) */}
            <div className="bg-white rounded-2xl p-3.5 sm:p-4 border-2 border-emerald-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 font-bold text-emerald-900">
                <BookOpen className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Ý TƯỞNG THUẬT TOÁN:</span>
                <span className="font-normal text-slate-600 hidden md:inline">
                  Xem số đầu tiên là đã sắp xếp → Lấy số tiếp theo làm Key → So sánh lùi từ phải sang trái → Dịch số to hơn sang phải → Chèn Key vào chỗ trống!
                </span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                  Xanh = Đã sắp xếp
                </span>
                <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 font-bold text-[11px]">
                  Vàng = Key cần chèn
                </span>
              </div>
            </div>

            {/* SPLIT SCREEN (MÀN HÌNH CHIA ĐÔI) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* LANE 1 (BÊN TRÁI): HỌC SINH (CHÈN ĐÚNG QUY TẮC) */}
              <div
                className={`bg-white rounded-3xl p-4 sm:p-5 border-3 transition-all flex flex-col justify-between min-h-[460px] shadow-sm ${
                  humanStatus === 'running'
                    ? 'border-emerald-400 ring-4 ring-emerald-100'
                    : humanStatus === 'completed'
                    ? 'border-emerald-300 bg-emerald-50/20'
                    : 'border-slate-200'
                }`}
              >
                {/* Header Lane */}
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="font-black text-base sm:text-lg text-emerald-800">
                          BÊN TRÁI: HỌC SINH
                        </h2>
                        <span className="text-[11px] text-slate-500 font-semibold block">
                          Phải chọn đúng thứ tự thuật toán, không đổi bừa
                        </span>
                      </div>
                    </div>

                    {/* Timer Badge */}
                    <div className="px-3.5 py-1.5 rounded-2xl bg-emerald-100 border border-emerald-300 text-emerald-800 font-mono font-black text-lg sm:text-xl flex items-center gap-1.5 shadow-xs">
                      <Clock className="w-4 h-4 text-emerald-600 animate-spin-slow" />
                      <span>{humanTime.toFixed(2)}s</span>
                    </div>
                  </div>

                  {/* Feedback Message Box */}
                  <div
                    className={`mt-2.5 p-2.5 rounded-xl border text-xs font-semibold leading-relaxed transition-all ${
                      humanFeedback.type === 'error'
                        ? 'bg-rose-50 border-rose-300 text-rose-800'
                        : humanFeedback.type === 'success'
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                        : 'bg-sky-50 border-sky-200 text-sky-800'
                    }`}
                  >
                    {humanFeedback.text}
                  </div>
                </div>

                {/* Number Bars Area for Student */}
                <div className="my-3 flex flex-col justify-end">
                  {/* Visual indication of Sorted Segment */}
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 mb-2 px-1">
                    <span className="text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Đoạn đã sắp xếp ({humanCurrentI} số đầu)
                    </span>
                    <span className="text-slate-400">
                      Đoạn chưa xếp ({humanArray.length - humanCurrentI} số)
                    </span>
                  </div>

                  {/* Bars Container */}
                  <div className="flex items-end justify-center gap-2 sm:gap-3 h-44 px-1">
                    {humanArray.map((val, idx) => {
                      const maxVal = Math.max(...humanArray, 45);
                      const h = Math.max(25, Math.round((val / maxVal) * 85));
                      const isSortedPortion = idx < humanCurrentI;
                      const isCurrentKey = idx === humanCurrentI && humanKeySelected;
                      const isTargetCandidate = idx === humanCurrentI && !humanKeySelected;
                      const color = barColors[idx % barColors.length];

                      return (
                        <div
                          key={`h-${idx}`}
                          onClick={() => handleHumanItemClick(idx)}
                          className={`flex-1 max-w-[62px] flex flex-col items-center cursor-pointer group transition-all ${
                            isTargetCandidate ? 'animate-bounce-small' : ''
                          }`}
                        >
                          {/* Tag on top */}
                          <div className="h-6 flex items-center justify-center mb-1">
                            {isCurrentKey ? (
                              <span className="text-[10px] font-black text-amber-900 bg-amber-300 px-1.5 py-0.5 rounded-full shadow-xs animate-bounce">
                                Key!
                              </span>
                            ) : isTargetCandidate ? (
                              <span className="text-[9px] font-bold text-sky-800 bg-sky-200 px-1 py-0.5 rounded-full">
                                Chọn đây
                              </span>
                            ) : isSortedPortion ? (
                              <span className="text-xs">⭐</span>
                            ) : null}
                          </div>

                          {/* Bar Cylinder */}
                          <div
                            style={{ height: `${h}%` }}
                            className={`w-full rounded-2xl bg-gradient-to-t ${color} shadow-sm flex flex-col justify-between items-center p-1.5 text-white transition-all duration-200 relative ${
                              isCurrentKey
                                ? 'ring-4 ring-amber-400 scale-105 shadow-lg -translate-y-2'
                                : isSortedPortion
                                ? 'ring-2 ring-emerald-300'
                                : 'opacity-85 hover:opacity-100'
                            }`}
                          >
                            <span className="font-black text-base sm:text-xl drop-shadow-sm">
                              {val}
                            </span>
                            <Smile className="w-3.5 h-3.5 text-white/90" />
                          </div>

                          <span
                            className={`text-[11px] font-bold mt-1.5 ${
                              isSortedPortion ? 'text-emerald-700' : 'text-slate-400'
                            }`}
                          >
                            #{idx + 1}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Insertion Slot Buttons when Key is active */}
                  {humanKeySelected && (
                    <div className="mt-3 p-2 bg-amber-50 rounded-2xl border border-amber-200">
                      <span className="text-[11px] font-black text-amber-900 block mb-1 text-center">
                        👇 Chọn vị trí bé muốn chèn số [{humanArray[humanCurrentI]}] vào:
                      </span>
                      <div className="flex justify-center gap-1.5 flex-wrap">
                        {Array.from({ length: humanCurrentI + 1 }).map((_, slotIdx) => (
                          <button
                            key={`slot-${slotIdx}`}
                            onClick={() => handleInsertIntoPosition(slotIdx)}
                            className="px-2.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-amber-950 font-black text-xs shadow-xs active:scale-95 transition-all cursor-pointer flex items-center gap-1"
                          >
                            <ArrowDown className="w-3 h-3" />
                            <span>Vị trí #{slotIdx + 1}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Human Control Action Buttons */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  {humanStatus === 'idle' ? (
                    <button
                      onClick={handleStartHuman}
                      className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-sm flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all active:scale-95"
                    >
                      <Play className="w-4 h-4 fill-white" />
                      <span>BẮT ĐẦU XẾP (BẤM GIỜ)</span>
                    </button>
                  ) : humanStatus === 'running' ? (
                    <div className="w-full flex items-center justify-between text-xs font-semibold text-slate-600 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                      <span>
                        Tiến độ: Đang ở số #{humanCurrentI + 1}/{humanArray.length}
                      </span>
                      <button
                        onClick={() => {
                          setHumanArray([...initialNumbers]);
                          setHumanCurrentI(1);
                          setHumanKeySelected(false);
                          setHumanFeedback({
                            type: 'info',
                            text: 'Đã khởi động lại dãy số. Bấm chọn phần tử thứ 2 để bắt đầu chèn!',
                          });
                          soundFx.playPop(450);
                        }}
                        className="text-emerald-700 hover:underline font-bold"
                      >
                        Làm lại từ đầu
                      </button>
                    </div>
                  ) : (
                    <div className="w-full p-2.5 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold text-center flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Học sinh đã xếp xong đúng thuật toán! Thời gian: {humanTime.toFixed(2)}s</span>
                    </div>
                  )}
                </div>
              </div>

              {/* LANE 2 (BÊN PHẢI): BÉ ROBOT AI */}
              <div
                className={`bg-white rounded-3xl p-4 sm:p-5 border-3 transition-all flex flex-col justify-between min-h-[460px] shadow-sm ${
                  aiStatus === 'running'
                    ? 'border-sky-400 ring-4 ring-sky-100'
                    : aiStatus === 'completed'
                    ? 'border-sky-300 bg-sky-50/20'
                    : aiStatus === 'ready'
                    ? 'border-amber-300 ring-4 ring-amber-100 animate-pulse'
                    : 'border-slate-200 opacity-90'
                }`}
              >
                {/* Header Lane */}
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
                        <Bot className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="font-black text-base sm:text-lg text-sky-800">
                          BÊN PHẢI: BÉ ROBOT AI
                        </h2>
                        <span className="text-[11px] text-slate-500 font-semibold block">
                          Thuật toán Chèn Trực Tiếp tự động
                        </span>
                      </div>
                    </div>

                    {/* Timer Badge */}
                    <div className="px-3.5 py-1.5 rounded-2xl bg-sky-100 border border-sky-300 text-sky-800 font-mono font-black text-lg sm:text-xl flex items-center gap-1.5 shadow-xs">
                      <Clock className="w-4 h-4 text-sky-600 animate-spin-slow" />
                      <span>{aiTime.toFixed(2)}s</span>
                    </div>
                  </div>

                  {/* AI Step Explanation */}
                  <div className="mt-2.5 p-2.5 rounded-xl border border-sky-200 bg-sky-50 text-xs font-semibold text-sky-900 leading-relaxed min-h-[48px] flex items-center">
                    {aiSteps[aiStepIdx]?.explanation || 'Đang chuẩn bị mô phỏng từng bước chèn trực tiếp...'}
                  </div>
                </div>

                {/* Number Bars Area for AI */}
                <div className="my-3 flex flex-col justify-end">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 mb-2 px-1">
                    <span className="text-sky-700 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Đoạn AI đã sắp xếp
                    </span>
                    <span className="text-slate-400">
                      Bước AI: {aiStepIdx}/{Math.max(1, aiSteps.length - 1)}
                    </span>
                  </div>

                  <div className="flex items-end justify-center gap-2 sm:gap-3 h-44 px-1">
                    {aiArray.map((val, idx) => {
                      const maxVal = Math.max(...aiArray, 45);
                      const h = Math.max(25, Math.round((val / maxVal) * 85));
                      const currentStep = aiSteps[aiStepIdx];
                      const isKey = currentStep?.keyIndex === idx;
                      const isDone = aiStatus === 'completed';
                      const color = barColors[idx % barColors.length];

                      return (
                        <div key={`ai-${idx}`} className="flex-1 max-w-[62px] flex flex-col items-center">
                          <div className="h-6 flex items-center justify-center mb-1">
                            {isKey ? (
                              <span className="text-[10px] font-black text-amber-800 bg-amber-200 px-1.5 py-0.5 rounded-full animate-bounce">
                                Key!
                              </span>
                            ) : isDone ? (
                              <span className="text-xs">⭐</span>
                            ) : null}
                          </div>

                          <div
                            style={{ height: `${h}%` }}
                            className={`w-full rounded-2xl bg-gradient-to-t ${color} shadow-sm flex flex-col justify-between items-center p-1.5 text-white transition-all duration-300 ${
                              isKey ? 'ring-4 ring-amber-400 scale-105 -translate-y-2' : ''
                            }`}
                          >
                            <span className="font-black text-base sm:text-xl drop-shadow-sm">
                              {val}
                            </span>
                            <Smile className="w-3.5 h-3.5 text-white/90" />
                          </div>

                          <span className="text-[11px] font-bold text-slate-400 mt-1.5">
                            #{idx + 1}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* AI Control Action */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  {aiStatus === 'waiting' ? (
                    <button
                      onClick={handleStartAi}
                      className="w-full py-3 px-4 rounded-xl bg-slate-100 hover:bg-sky-100 text-slate-600 hover:text-sky-800 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition-all"
                    >
                      <Bot className="w-4 h-4" />
                      <span>Bấm để AI chạy mẫu trước (hoặc đợi bạn xếp xong)</span>
                    </button>
                  ) : aiStatus === 'ready' ? (
                    <button
                      onClick={handleStartAi}
                      className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg cursor-pointer transition-all active:scale-95 animate-bounce-small"
                    >
                      <Bot className="w-5 h-5 text-amber-300" />
                      <span>BẤM ĐỂ BÉ ROBOT AI SẮP XẾP NGAY!</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : aiStatus === 'running' ? (
                    <div className="w-full p-2.5 rounded-xl bg-sky-100 text-sky-800 text-xs font-bold text-center flex items-center justify-center gap-2">
                      <Sparkles className="w-4 h-4 text-sky-600 animate-spin" />
                      <span>Robot đang tự động chèn theo đúng thuật toán...</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowComparisonModal(true)}
                      className="w-full py-2.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-500 text-amber-950 font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      <Trophy className="w-4 h-4 text-amber-950" />
                      <span>Xem Lại Bảng So Sánh Thời Gian</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Utilities & Number Controllers */}
            <div className="bg-white rounded-2xl p-4 border-2 border-slate-100 shadow-sm flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500">
                  Dãy số thi đấu ({initialNumbers.length} số):
                </span>
                <div className="flex flex-wrap gap-1 font-mono font-bold text-xs text-sky-800">
                  {initialNumbers.map((n, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-lg bg-sky-50 border border-sky-200">
                      {n}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    soundFx.playPop(550);
                    setIsCustomModalOpen(true);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-sky-100 hover:bg-sky-200 text-sky-900 font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
                >
                  <Edit3 className="w-4 h-4 text-sky-700" />
                  <span>Tự Chọn Bộ Số</span>
                </button>

                <button
                  onClick={() => {
                    soundFx.playPop(550);
                    initRound();
                  }}
                  className="px-3.5 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
                >
                  <Shuffle className="w-4 h-4 text-amber-700" />
                  <span>Đổi Số Mới</span>
                </button>

                <button
                  onClick={() => {
                    soundFx.playPop(500);
                    initRound(initialNumbers);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4 text-slate-600" />
                  <span>Thi Đấu Lại</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Custom Numbers Modal */}
      {isCustomModalOpen && (
        <CustomNumbersModal
          currentNumbers={initialNumbers}
          onApply={handleApplyCustomNumbers}
          onClose={() => setIsCustomModalOpen(false)}
        />
      )}

      {/* Comparison Result Modal */}
      {showComparisonModal && (
        <ComparisonResultModal
          humanTimeSeconds={humanTime}
          aiTimeSeconds={aiTime}
          sortedArray={[...initialNumbers].sort((a, b) => a - b)}
          onPlayAgain={() => {
            initRound(initialNumbers);
          }}
          onOpenCustomNumbers={() => {
            setShowComparisonModal(false);
            setIsCustomModalOpen(true);
          }}
          onGoHome={() => {
            setShowComparisonModal(false);
            setScreen('start');
          }}
        />
      )}

      {/* Footer */}
      <footer className="py-2.5 text-center text-xs font-semibold text-emerald-800/80">
        🎈 Thử Thách Thuật Toán Chèn Trực Tiếp (Insertion Sort) • Học Sinh vs Bé Robot AI
      </footer>
    </div>
  );
}
