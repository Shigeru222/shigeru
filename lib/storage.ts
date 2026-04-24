import { ExamResult } from "./types";

const STORAGE_KEY = "eiken_exam_results";
const CURRENT_EXAM_KEY = "eiken_current_result";

export function saveExamResult(result: ExamResult): void {
  if (typeof window === "undefined") return;
  const existing = getExamResults();
  existing.unshift(result);
  const trimmed = existing.slice(0, 10);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
}

export function getExamResults(): ExamResult[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as ExamResult[];
  } catch {
    return [];
  }
}

export function setCurrentResult(result: ExamResult): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(CURRENT_EXAM_KEY, JSON.stringify(result));
}

export function getCurrentResult(): ExamResult | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(CURRENT_EXAM_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ExamResult;
  } catch {
    return null;
  }
}

export function clearCurrentResult(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(CURRENT_EXAM_KEY);
}
