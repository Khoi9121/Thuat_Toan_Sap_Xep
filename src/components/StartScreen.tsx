import React from 'react';
import { soundFx } from '../utils/audio';
import { Play, ArrowRight, Sun, Cloud, Heart, Edit3, User, Bot, Clock, Trophy } from 'lucide-react';

interface StartScreenProps {
  currentNumbers: number[];
  onOpenCustomNumbers: () => void;
  onStart: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({
  currentNumbers,
  onOpenCustomNumbers,
  onStart,
}) => {
  return (
    <div className="relative min-h-[85vh] bg-gradient-to-b from-sky-200 via-sky-100 to-amber-50 rounded-3xl p-6 sm:p-10 border-4 border-sky-300 shadow-xl flex flex-col justify-between overflow-hidden">
      {/* Sun and Clouds Decoration */}
      <div className="absolute top-4 right-8 text-amber-400 opacity-90 animate-spin-slow pointer-events-none">
        <Sun className="w-16 h-16 fill-amber-300" />
      </div>
      <div className="absolute top-8 left-10 text-white opacity-80 pointer-events-none">
        <Cloud className="w-14 h-14 fill-white" />
      </div>
      <div className="absolute top-20 right-32 text-white opacity-70 pointer-events-none hidden sm:block">
        <Cloud className="w-10 h-10 fill-white" />
      </div>

      {/* Header & Cute Robot Greeting */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-2xl mx-auto">
        {/* Floating Cartoon Robot Avatar */}
        <div className="w-24 h-24 sm:w-28 sm:h-28 bg-white rounded-3xl border-4 border-sky-400 shadow-lg flex flex-col items-center justify-center p-2 relative animate-float mb-3">
          <div className="absolute -top-3 w-2 h-4 bg-amber-400 rounded-full flex items-center justify-center">
            <div className="w-3.5 h-3.5 bg-rose-400 rounded-full animate-ping absolute" />
            <div className="w-3.5 h-3.5 bg-rose-400 rounded-full relative" />
          </div>

          <div className="w-16 h-10 bg-sky-100 rounded-2xl border-2 border-sky-300 flex items-center justify-around px-2">
            <div className="w-3.5 h-3.5 bg-sky-600 rounded-full flex items-center justify-center">
              <div className="w-1 h-1 bg-white rounded-full -mt-1 -ml-1" />
            </div>
            <div className="w-3.5 h-3.5 bg-sky-600 rounded-full flex items-center justify-center">
              <div className="w-1 h-1 bg-white rounded-full -mt-1 -ml-1" />
            </div>
          </div>

          <div className="w-5 h-2.5 border-b-2 border-rose-400 rounded-full mt-1.5" />
          
          <span className="text-[10px] font-bold text-sky-600 bg-sky-50 px-2 rounded-full mt-1">
            BÉ ROBOT ROBI
          </span>
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-sky-700 tracking-tight drop-shadow-sm">
          TRỞ LẠI MẶT ĐẤT
        </h1>
        <p className="mt-1 text-sm sm:text-base font-bold text-emerald-800 bg-emerald-100/90 px-4 py-1 rounded-full border border-emerald-300">
          ⚔️ THỬ THÁCH SẮP XẾP CHÈN TRỰC TIẾP: HỌC SINH vs BÉ ROBOT AI
        </p>
        <p className="mt-2 text-xs sm:text-sm text-slate-600 max-w-xl leading-relaxed">
          Cùng một dãy số ban đầu, bé hãy tự tay sắp xếp xem mất bao nhiêu giây, sau đó nhấn nút để xem Bé Robot AI dùng thuật toán chèn giải trong bao lâu nhé!
        </p>
      </div>

      {/* 2-Lane Preview (How it works) */}
      <div className="relative z-10 max-w-4xl mx-auto w-full my-5 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left Side: Human Student */}
        <div className="bg-white/95 rounded-2xl p-4 sm:p-5 border-2 border-emerald-300 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
              <span className="font-black text-sm text-emerald-700 flex items-center gap-1.5">
                <User className="w-4 h-4 text-emerald-600" />
                BÊN TRÁI: HỌC SINH (BẠN NHỎ)
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                Bước 1
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mb-3">
              Bé bấm <strong>"Bắt đầu xếp"</strong>, đồng hồ chạy tích tắc. Bé nhặt số ra và chèn vào đúng chỗ trong hàng. Khi xếp đúng từ bé đến lớn, đồng hồ sẽ ghi lại thời gian của bé!
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 p-2.5 rounded-xl">
            <Clock className="w-4 h-4" />
            <span>Có đồng hồ bấm giờ riêng cho học sinh</span>
          </div>
        </div>

        {/* Right Side: AI Robot */}
        <div className="bg-white/95 rounded-2xl p-4 sm:p-5 border-2 border-sky-300 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
              <span className="font-black text-sm text-sky-700 flex items-center gap-1.5">
                <Bot className="w-4 h-4 text-sky-600" />
                BÊN PHẢI: BÉ ROBOT AI (ROBI)
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800">
                Bước 2
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mb-3">
              Sau khi bạn nhỏ xếp xong, bạn nhỏ sẽ bấm nút <strong>"Bé Robot AI Sắp Xếp"</strong>. Bé Robot sẽ tự động thi hành thuật toán chèn và bấm giờ xem giải hết bao nhiêu giây!
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-sky-700 bg-sky-50 p-2.5 rounded-xl">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span>Pop-up so sánh thời gian & công bố kết quả</span>
          </div>
        </div>
      </div>

      {/* Custom Numbers Box */}
      <div className="relative z-10 max-w-4xl mx-auto w-full mb-5 bg-white/95 backdrop-blur rounded-2xl p-3.5 sm:p-4 border-2 border-amber-300 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🔢</span>
          <div>
            <span className="text-xs sm:text-sm font-black text-slate-800">
              Bộ số thách đấu ({currentNumbers.length} số):
            </span>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {currentNumbers.map((num, i) => (
                <span
                  key={i}
                  className="px-2.5 py-0.5 rounded-xl bg-sky-100 text-sky-800 font-black text-xs border border-sky-200"
                >
                  {num}
                </span>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            soundFx.playPop(550);
            onOpenCustomNumbers();
          }}
          className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-amber-950 font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer whitespace-nowrap active:scale-95"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Tự Chọn Bộ Số Khác</span>
        </button>
      </div>

      {/* Start Button & Bottom Ground decoration */}
      <div className="relative z-10 flex flex-col items-center">
        <button
          onClick={() => {
            soundFx.playPop(750);
            onStart();
          }}
          className="w-full max-w-sm py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-black text-lg sm:text-xl shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 cursor-pointer"
        >
          <Play className="w-6 h-6 fill-white" />
          <span>BẮT ĐẦU SO SÁNH NGAY</span>
          <ArrowRight className="w-6 h-6" />
        </button>

        <div className="mt-3 text-xs font-semibold text-emerald-800 flex items-center gap-2">
          <span>🌳 Mặt Đất Xanh Tươi Đang Đợi Tàu Hạ Cánh</span>
          <Heart className="w-4 h-4 text-rose-400 fill-rose-400" />
        </div>
      </div>
    </div>
  );
};
