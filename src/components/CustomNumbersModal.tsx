import React, { useState } from 'react';
import { soundFx } from '../utils/audio';
import { X, Sparkles, Check, Shuffle, TrendingDown, TrendingUp, Heart } from 'lucide-react';

interface CustomNumbersModalProps {
  currentNumbers: number[];
  onApply: (newNumbers: number[]) => void;
  onClose: () => void;
}

export const CustomNumbersModal: React.FC<CustomNumbersModalProps> = ({
  currentNumbers,
  onApply,
  onClose,
}) => {
  const [inputText, setInputText] = useState<string>(currentNumbers.join(', '));
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Sample quick presets
  const presets = [
    {
      title: '🎲 Ngẫu Nhiên',
      desc: 'Bộ 6 số ngẫu nhiên',
      values: [14, 3, 27, 8, 35, 19],
    },
    {
      title: '📉 Đảo Ngược',
      desc: 'Từ lớn đến bé (Nhiều bước nhất)',
      values: [38, 29, 21, 15, 8, 2],
    },
    {
      title: '📈 Gần Đúng',
      desc: 'Chỉ lệch 1-2 vị trí',
      values: [4, 9, 15, 26, 20, 33],
    },
    {
      title: '🎈 Số Nhỏ (1-10)',
      desc: 'Dễ đếm và so sánh',
      values: [8, 3, 10, 1, 6, 4],
    },
    {
      title: '⭐ Tròn Chục',
      desc: 'Số chẵn tròn chục',
      values: [50, 20, 80, 10, 40, 30],
    },
  ];

  // Parse input string into numbers
  const parseNumbers = (text: string): number[] => {
    const raw = text
      .split(/[,;\s]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
      .map((s) => parseInt(s, 10))
      .filter((n) => !isNaN(n) && n > 0 && n <= 99);
    return raw;
  };

  const parsedList = parseNumbers(inputText);

  const handleApply = () => {
    const list = parseNumbers(inputText);
    if (list.length < 3) {
      setErrorMsg('Bé ơi hãy nhập ít nhất 3 con số (ví dụ: 5, 2, 8, 1) nhé!');
      soundFx.playPop(300);
      return;
    }
    if (list.length > 8) {
      setErrorMsg('Để màn hình đẹp nhất, bé chọn tối đa 8 con số thôi nha!');
      soundFx.playPop(300);
      return;
    }

    soundFx.playPop(700);
    onApply(list);
    onClose();
  };

  const handleSelectPreset = (values: number[]) => {
    soundFx.playPop(550);
    setInputText(values.join(', '));
    setErrorMsg('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl p-5 sm:p-7 max-w-lg w-full border-4 border-sky-300 shadow-2xl flex flex-col justify-between overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b-2 border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-2xl">✏️</span>
            <div>
              <h3 className="font-black text-lg sm:text-xl text-sky-800">
                TỰ CHỌN BỘ SỐ CỦA BÉ
              </h3>
              <p className="text-xs text-slate-500">
                Nhập các số từ 1 đến 99 để Bé Robot và bạn cùng sắp xếp
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Text Input area */}
        <div className="my-4">
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Nhập các số (cách nhau bằng dấu phẩy hoặc khoảng trắng):
          </label>
          <input
            type="text"
            value={inputText}
            onChange={(e) => {
              setInputText(e.target.value);
              setErrorMsg('');
            }}
            placeholder="Ví dụ: 12, 5, 28, 9, 3, 17"
            className="w-full px-4 py-3 rounded-2xl border-2 border-sky-300 focus:border-sky-500 focus:ring-4 focus:ring-sky-100 text-base font-bold text-slate-800 outline-none transition-all"
          />

          {errorMsg ? (
            <p className="text-xs font-bold text-rose-500 mt-1.5 animate-bounce-small">
              ⚠️ {errorMsg}
            </p>
          ) : (
            <p className="text-[11px] text-slate-400 mt-1">
              Gợi ý: Chọn từ 4 đến 8 số (giá trị từ 1 đến 99)
            </p>
          )}

          {/* Real-time Preview of the numbers */}
          <div className="mt-4 p-3 bg-sky-50/70 rounded-2xl border border-sky-200">
            <span className="text-[11px] font-bold text-sky-700 block mb-2">
              Xem trước các viên đá số ({parsedList.length} số):
            </span>
            {parsedList.length > 0 ? (
              <div className="flex flex-wrap gap-2 items-center">
                {parsedList.map((num, idx) => (
                  <span
                    key={`p-${idx}`}
                    className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-sky-400 to-blue-500 text-white font-black text-sm shadow-sm"
                  >
                    {num}
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-xs text-slate-400 italic">
                Chưa có số nào hợp lệ...
              </span>
            )}
          </div>
        </div>

        {/* Quick Presets */}
        <div className="mb-4">
          <span className="text-xs font-bold text-slate-700 block mb-2 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Hoặc chọn nhanh bộ số mẫu:
          </span>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {presets.map((preset, idx) => (
              <button
                key={`pre-${idx}`}
                onClick={() => handleSelectPreset(preset.values)}
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-sky-50 border border-slate-200 hover:border-sky-300 text-left transition-all cursor-pointer group"
              >
                <div className="text-xs font-bold text-slate-800 group-hover:text-sky-700">
                  {preset.title}
                </div>
                <div className="text-[10px] text-slate-400 line-clamp-1">
                  [{preset.values.join(', ')}]
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2.5 pt-3 border-t-2 border-slate-100">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm cursor-pointer"
          >
            Hủy Bỏ
          </button>

          <button
            onClick={handleApply}
            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 text-white font-bold text-sm shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Áp Dụng Bộ Số Này</span>
          </button>
        </div>
      </div>
    </div>
  );
};
