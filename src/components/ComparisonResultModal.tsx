import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { soundFx } from '../utils/audio';
import { Trophy, Clock, User, Bot, RotateCcw, Home, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';

interface ComparisonResultModalProps {
  humanTimeSeconds: number;
  aiTimeSeconds: number;
  sortedArray: number[];
  onPlayAgain: () => void;
  onOpenCustomNumbers: () => void;
  onGoHome: () => void;
}

export const ComparisonResultModal: React.FC<ComparisonResultModalProps> = ({
  humanTimeSeconds,
  aiTimeSeconds,
  sortedArray,
  onPlayAgain,
  onOpenCustomNumbers,
  onGoHome,
}) => {
  const diff = Math.abs(humanTimeSeconds - aiTimeSeconds).toFixed(2);
  const isHumanFaster = humanTimeSeconds < aiTimeSeconds;
  const isDraw = Math.abs(humanTimeSeconds - aiTimeSeconds) < 0.1;

  useEffect(() => {
    soundFx.playVictory();
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#38bdf8', '#34d399', '#fbbf24', '#f472b6'],
    });
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border-4 border-amber-300 shadow-2xl text-center flex flex-col items-center overflow-hidden">
        {/* Trophy icon */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-amber-400 to-yellow-300 flex items-center justify-center shadow-lg mb-3 animate-bounce-small">
          <Trophy className="w-9 h-9 sm:w-11 sm:h-11 text-amber-950" />
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-sky-800 tracking-tight">
          KẾT QUẢ SO SÁNH THỜI GIAN
        </h2>
        <p className="text-xs sm:text-sm font-bold text-emerald-700 mt-0.5">
          🎉 Cả hai đã hoàn thành sắp xếp chèn trực tiếp đưa tàu hạ cánh!
        </p>

        {/* 2 Time Badges Comparison */}
        <div className="w-full my-5 grid grid-cols-2 gap-3">
          {/* Human Card */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-300 flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 mb-1.5">
              <User className="w-5 h-5" />
            </div>
            <span className="text-xs font-black text-emerald-800">
              HỌC SINH (BẠN)
            </span>
            <div className="text-2xl sm:text-3xl font-black text-emerald-700 my-1 font-mono">
              {humanTimeSeconds.toFixed(2)}s
            </div>
            <span className="text-[11px] text-emerald-600 font-semibold">
              Tự tay chèn từng số
            </span>
          </div>

          {/* AI Robot Card */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-sky-50 border-2 border-sky-300 flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center text-sky-700 mb-1.5">
              <Bot className="w-5 h-5" />
            </div>
            <span className="text-xs font-black text-sky-800">
              BÉ ROBOT AI
            </span>
            <div className="text-2xl sm:text-3xl font-black text-sky-700 my-1 font-mono">
              {aiTimeSeconds.toFixed(2)}s
            </div>
            <span className="text-[11px] text-sky-600 font-semibold">
              Thuật toán chèn tự động
            </span>
          </div>
        </div>

        {/* Comparison commentary box */}
        <div className="w-full p-4 rounded-2xl bg-amber-50 border border-amber-200 text-left text-xs sm:text-sm leading-relaxed mb-4">
          <div className="font-black text-amber-900 mb-1 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>NHẬN XÉT CỦA BÉ ROBOT ROBI:</span>
          </div>
          <p className="text-slate-700">
            {isDraw ? (
              <span>Cả hai về đích gần như cùng một lúc! Thật là một trận đấu ngang tài ngang sức đáng kinh ngạc!</span>
            ) : isHumanFaster ? (
              <span>
                Quá đỉnh! <strong>Bạn nhỏ nhanh hơn Bé Robot {diff} giây!</strong> Khả năng phán đoán trực giác của con người hôm nay đã chiến thắng thuật toán máy tính!
              </span>
            ) : (
              <span>
                Bé Robot AI nhanh hơn {diff} giây nhờ tốc độ tính toán điện tử lặp lại liên tục. Nhưng <strong>bạn nhỏ rất thông minh và khéo léo</strong>, hiểu rất rõ thuật toán chèn trực tiếp!
              </span>
            )}
          </p>
        </div>

        {/* Sorted array display */}
        <div className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 mb-5 flex items-center justify-between text-xs">
          <span className="font-bold text-slate-600 flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Dãy số đã xếp xong:
          </span>
          <div className="flex gap-1.5 font-black text-slate-800">
            {sortedArray.map((n, i) => (
              <span key={i} className="px-2 py-0.5 rounded-md bg-white border border-slate-200 shadow-xs">
                {n}
              </span>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col sm:flex-row gap-2">
          <button
            onClick={() => {
              soundFx.playPop(550);
              onPlayAgain();
            }}
            className="flex-1 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Đua Lại Vòng Này</span>
          </button>

          <button
            onClick={() => {
              soundFx.playPop(650);
              onOpenCustomNumbers();
            }}
            className="flex-1 py-3 px-4 rounded-xl bg-sky-100 hover:bg-sky-200 text-sky-900 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <span>Tự Chọn Bộ Số Khác</span>
          </button>

          <button
            onClick={() => {
              soundFx.playPop(450);
              onGoHome();
            }}
            className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center cursor-pointer"
            title="Về màn hình chính"
          >
            <Home className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
