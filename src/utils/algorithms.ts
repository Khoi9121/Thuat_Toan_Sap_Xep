// Kid-friendly Insertion Sort utilities & exact algorithmic validation

export interface KidSortStep {
  array: number[];
  comparing: number[]; // indices being compared
  swapped: number[];
  sorted: number[];
  keyIndex?: number;
  insertTargetIndex?: number;
  explanation: string;
}

// Find the mathematically correct insertion index for element at index `currentI` in the sorted subsegment [0..currentI]
export function getCorrectInsertionIndex(arr: number[], currentI: number): number {
  const key = arr[currentI];
  let j = currentI - 1;
  while (j >= 0 && arr[j] > key) {
    j--;
  }
  return j + 1;
}

// Explain why a student's chosen insertion index is wrong
export function explainWrongInsertion(
  arr: number[],
  currentI: number,
  chosenIndex: number
): string {
  const key = arr[currentI];
  const correctIndex = getCorrectInsertionIndex(arr, currentI);

  if (chosenIndex > correctIndex) {
    // Student inserted too far right -> there is a larger element to the left
    return `Chưa đúng! Ở vị trí này, số [${arr[chosenIndex - 1]}] đứng trước vẫn lớn hơn số cần chèn [${key}]. Ta phải dịch số [${arr[chosenIndex - 1]}] sang phải và lùi tiếp về trước!`;
  } else {
    // Student inserted too far left -> there is a smaller element to the right
    return `Chưa đúng! Ở vị trí này, số [${arr[chosenIndex]}] đứng sau lại nhỏ hơn số cần chèn [${key}]. Vị trí này không đảm bảo thứ tự tăng dần!`;
  }
}

// Perform insertion move: take element at fromIndex and insert at toIndex, shifting intermediate elements
export function performInsertion(arr: number[], fromIndex: number, toIndex: number): number[] {
  const result = [...arr];
  if (fromIndex === toIndex || fromIndex < 0 || fromIndex >= arr.length || toIndex < 0 || toIndex >= arr.length) {
    return result;
  }
  const [item] = result.splice(fromIndex, 1);
  result.splice(toIndex, 0, item);
  return result;
}

// Generate insertion sort steps for AI playback strictly following the algorithm
export function getInsertionSteps(initial: number[]): KidSortStep[] {
  const steps: KidSortStep[] = [];
  const arr = [...initial];
  const n = arr.length;
  const sorted: number[] = [0];

  steps.push({
    array: [...arr],
    comparing: [],
    swapped: [],
    sorted: [0],
    explanation: `Phần tử đầu tiên [${arr[0]}] được xem là phần đã sắp xếp.`,
  });

  for (let i = 1; i < n; i++) {
    const key = arr[i];
    let j = i - 1;

    steps.push({
      array: [...arr],
      comparing: [i],
      swapped: [],
      sorted: [...sorted],
      keyIndex: i,
      explanation: `Lấy phần tử thứ ${i + 1} là số [${key}] làm phần tử cần chèn.`,
    });

    while (j >= 0 && arr[j] > key) {
      steps.push({
        array: [...arr],
        comparing: [j, j + 1],
        swapped: [],
        sorted: [...sorted],
        keyIndex: j + 1,
        explanation: `So sánh: [${arr[j]}] > [${key}], dịch [${arr[j]}] sang phải một vị trí để tạo chỗ trống.`,
      });

      arr[j + 1] = arr[j];

      steps.push({
        array: [...arr],
        comparing: [],
        swapped: [j, j + 1],
        sorted: [...sorted],
        keyIndex: j,
        explanation: `Đã tạo chỗ trống ở vị trí #${j + 1}. Tiếp tục so sánh lùi về trước...`,
      });

      j = j - 1;
    }

    arr[j + 1] = key;
    sorted.push(i);

    steps.push({
      array: [...arr],
      comparing: [],
      swapped: [],
      sorted: Array.from({ length: i + 1 }, (_, idx) => idx),
      keyIndex: j + 1,
      insertTargetIndex: j + 1,
      explanation: `Chèn số [${key}] vào vị trí trống #${j + 1}! Đoạn gồm ${i + 1} số đầu tiên đã sắp xếp tăng dần.`,
    });
  }

  steps.push({
    array: [...arr],
    comparing: [],
    swapped: [],
    sorted: Array.from({ length: n }, (_, idx) => idx),
    explanation: '🎉 Toàn bộ dãy số đã được sắp xếp tăng dần hoàn chỉnh!',
  });

  return steps;
}

// Check if array is sorted
export function isArraySorted(arr: number[]): boolean {
  if (arr.length <= 1) return true;
  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] > arr[i + 1]) return false;
  }
  return true;
}

// Generate 5-6 friendly kid numbers
export function createKidNumbers(count: number = 6): number[] {
  const nums: number[] = [];
  while (nums.length < count) {
    const val = Math.floor(Math.random() * 45) + 1; // 1 to 45
    if (!nums.includes(val)) {
      nums.push(val);
    }
  }
  return nums;
}
