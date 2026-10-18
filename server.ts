import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

const port = process.env.PORT || 3000;

// Initialize Gemini SDK with telemetry header
const geminiApiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (geminiApiKey) {
  ai = new GoogleGenAI({
    apiKey: geminiApiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasGeminiKey: Boolean(geminiApiKey),
    model: 'gemini-3.8-flash',
  });
});

// Helper for local algorithmic analysis fallback
function getLocalAlgorithmAnalysis(
  algo: string,
  array: number[],
  stepDetails?: any
) {
  const algoNames: Record<string, string> = {
    bubble: 'Sắp xếp Bọt Nổi (Bubble Sort)',
    selection: 'Sắp xếp Chọn Trực Tiếp (Selection Sort)',
    insertion: 'Sắp xếp Chèn Trực Tiếp (Insertion Sort)',
  };

  const name = algoNames[algo] || algo;
  const isSorted = array.every((val, idx) => idx === 0 || array[idx - 1] <= val);

  if (isSorted) {
    return {
      message: `🎉 Toàn bộ lõi năng lượng đã được đồng bộ chuẩn xác! Động cơ phản lực quỹ đạo đã sẵn sàng đốt nhiên liệu hồi quyển về Trái Đất!`,
      emotion: 'celebrating',
      hint: 'Mảng đã được sắp xếp tăng dần hoàn hảo.',
      tip: 'Độ phức tạp trường hợp tốt nhất đã đạt mức tối ưu!',
    };
  }

  if (algo === 'bubble') {
    return {
      message: `Quét radar phát hiện lõi năng lượng đang lệch pha. Thuật toán ${name} sẽ so sánh tuần tự từng cặp kề nhau: nếu lõi bên trái nặng hơn bên phải, lực đẩy sẽ đẩy lõi nặng 'nổi' dần về buồng đốt phía sau!`,
      emotion: 'analyzing',
      hint: 'So sánh cặp thanh kề nhau và hoán vị nếu sai thứ tự.',
      tip: 'Sau mỗi vòng lặp i, phần tử lớn nhất sẽ được đưa về đúng vị trí cuối cùng.',
    };
  } else if (algo === 'selection') {
    return {
      message: `Cảm biến quang học đang quét toàn bộ dãy lõi chưa sắp xếp để định vị phần tử có giá trị năng lượng nhỏ nhất (min). Sau khi tìm thấy, Robot sẽ hoán đổi trực tiếp về vị trí dẫn đầu!`,
      emotion: 'thinking',
      hint: 'Tìm vị trí có giá trị nhỏ nhất trong đoạn chưa sắp xếp rồi đổi chỗ.',
      tip: 'Số lần hoán đổi luôn là O(n), rất tiết kiệm chu kỳ chuyển động cơ học.',
    };
  } else {
    return {
      message: `Hệ thống phân tách lõi hiện tại và dò ngược về dãy đã sắp xếp phía trước. Các lõi lớn hơn sẽ được đẩy lùi sang phải 1 nấc để dọn chỗ cắm lõi vào vị trí chuẩn!`,
      emotion: 'analyzing',
      hint: 'Rút phần tử hiện tại ra và chèn lùi vào vị trí thích hợp trong đoạn đã xếp.',
      tip: 'Rất hiệu quả với dữ liệu gần như đã được sắp xếp trước.',
    };
  }
}

// AI Advisor endpoint: Returns robot insights, commentary & educational reasoning
app.post('/api/ai/analyze-step', async (req, res) => {
  try {
    const { algorithm, array, stepDetails, mode, robotName = 'C.O.D.E-X' } = req.body;

    if (!Array.isArray(array)) {
      return res.status(400).json({ error: 'Array is required' });
    }

    const algoNameMap: Record<string, string> = {
      bubble: 'Sắp xếp Bọt Nổi (Bubble Sort)',
      selection: 'Sắp xếp Chọn Trực Tiếp (Selection Sort)',
      insertion: 'Sắp xếp Chèn Trực Tiếp (Insertion Sort)',
    };

    const algoViName = algoNameMap[algorithm] || algorithm;

    // If Gemini API is available, ask Gemini-3.8-flash
    if (ai) {
      const prompt = `Bạn là Bé Robot AI Robi, người bạn robot hoạt hình tí hon rất dễ thương, vui tính đồng hành cùng các bé học sinh tiểu học.
Nhiệm vụ: Hướng dẫn các bé sắp xếp dãy số [${array.join(', ')}] từ bé đến lớn bằng thuật toán ${algoViName} để đưa chiếc tàu đồ chơi trở lại mặt đất xanh tươi.
Chi tiết bước hiện tại: ${JSON.stringify(stepDetails || {})}.

Hãy phản hồi theo định dạng JSON thuần túy (không dùng markdown code blocks ngoài JSON):
{
  "message": "Lời nói siêu dễ thương, vui vẻ của Bé Robot Robi dành cho các bé (1-2 câu ngắn, xưng là 'Tớ' hoặc 'Bé Robot', gọi bé là 'bạn nhỏ' hoặc 'bé yêu', có biểu cảm mặt cười hoặc vỗ tay).",
  "emotion": "happy",
  "hint": "Gợi ý 1 câu thật dễ hiểu cho bé biết nên nhìn số nào tiếp theo.",
  "tip": "1 câu khen ngợi hoặc giải thích siêu đơn giản."
}`;

      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });

        const text = response.text || '';
        const parsed = JSON.parse(text);
        return res.json(parsed);
      } catch (geminiError) {
        console.warn('Gemini request failed, falling back to local reasoning:', geminiError);
      }
    }

    // Local fallback logic
    const fallback = getLocalAlgorithmAnalysis(algorithm, array, stepDetails);
    res.json(fallback);
  } catch (error: any) {
    console.error('API Error:', error);
    res.status(500).json({
      error: 'Failed to process AI analysis',
      fallback: getLocalAlgorithmAnalysis('bubble', [5, 2, 8, 1]),
    });
  }
});

// AI Quiz endpoint
app.post('/api/ai/quiz', async (req, res) => {
  try {
    const { algorithm } = req.body;
    const defaultQuizzes: Record<string, any[]> = {
      bubble: [
        {
          question: 'Trong thuật toán Sắp xếp Bọt nổi (Bubble Sort), sau lượt duyệt đầu tiên của dãy n phần tử, điều gì chắc chắn xảy ra?',
          options: [
            'Phần tử nhỏ nhất về vị trí đầu tiên',
            'Phần tử lớn nhất về vị trí cuối cùng',
            'Dãy đã hoàn tất sắp xếp',
            'Không có phần tử nào về đúng vị trí'
          ],
          correctIndex: 1,
          explanation: 'Lõi có trọng lượng năng lượng lớn nhất sẽ liên tục được đẩy sang phải cho đến tận cùng buồng đốt năng lượng!'
        },
        {
          question: 'Độ phức tạp thời gian trung bình của Sắp xếp Bọt nổi là bao nhiêu?',
          options: ['O(log n)', 'O(n)', 'O(n²)', 'O(1)'],
          correctIndex: 2,
          explanation: 'Với 2 vòng lặp lồng nhau, thời gian trung bình và xấu nhất đều là O(n²).'
        }
      ],
      selection: [
        {
          question: 'Sắp xếp Chọn Trực Tiếp (Selection Sort) có ưu điểm nổi bật gì so với Bubble Sort?',
          options: [
            'Thời gian chạy luôn là O(n)',
            'Số lần hoán đổi (swap) tối đa chỉ là n-1 lần, rất tiết kiệm cơ học',
            'Là thuật toán sắp xếp ổn định (Stable)',
            'Không cần so sánh các phần tử'
          ],
          correctIndex: 1,
          explanation: 'Selection Sort chỉ thực hiện tối đa n-1 phép hoán vị, giúp giảm hao mòn động cơ gắp lõi năng lượng!'
        },
        {
          question: 'Trong Selection Sort, ở mỗi vòng lặp i, ta tìm phần tử nào trong đoạn chưa sắp xếp?',
          options: [
            'Phần tử ngẫu nhiên',
            'Phần tử lớn nhất',
            'Phần tử nhỏ nhất (hoặc lớn nhất tùy chiều sắp xếp)',
            'Phần tử nằm ở chính giữa'
          ],
          correctIndex: 2,
          explanation: 'Hệ thống quét để bắt đúng phần tử nhỏ nhất và chuyển vị ngay về đầu đoạn chưa xếp.'
        }
      ],
      insertion: [
        {
          question: 'Sắp xếp Chèn Trực Tiếp (Insertion Sort) hoạt động hiệu quả nhất trong tình huống nào?',
          options: [
            'Mảng hoàn toàn đảo ngược',
            'Mảng đã gần như được sắp xếp sẵn',
            'Mảng chứa toàn số âm',
            'Mảng có kích thước vô hạn'
          ],
          correctIndex: 1,
          explanation: 'Khi mảng đã gần sắp xếp, Insertion Sort chỉ tốn thời gian O(n) vì gần như không cần dịch chuyển phần tử!'
        },
        {
          question: 'Cơ chế của Insertion Sort tương tự như hành động thực tế nào?',
          options: [
            'Xếp hàng bốc thăm ngẫu nhiên',
            'Cầm các lá bài trên tay và chèn từng lá mới vào đúng vị trí',
            'Đổ xúc xắc',
            'Bong bóng nổi trên mặt nước'
          ],
          correctIndex: 1,
          explanation: 'Tương tự việc rút một quân bài và dò vị trí thích hợp từ phải sang trái để cắm vào!'
        }
      ]
    };

    const algoKey = (algorithm && defaultQuizzes[algorithm]) ? algorithm : 'bubble';
    const list = defaultQuizzes[algoKey];
    const item = list[Math.floor(Math.random() * list.length)];

    res.json(item);
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate quiz' });
  }
});

// In development, hook Vite middleware; in production, serve built dist
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, () => {
    console.log(`🚀 Earth Return Server running at http://localhost:${port}`);
  });
}

startServer();
