import { AppState, DEFAULT_STATE } from '../types';

const STORAGE_KEY = 'asset-app/state/v1';

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw) as Partial<AppState>;
    return {
      ...DEFAULT_STATE,
      ...parsed,
      simulation: { ...DEFAULT_STATE.simulation, ...(parsed.simulation ?? {}) },
      settings: { ...DEFAULT_STATE.settings, ...(parsed.settings ?? {}) },
      fx: { ...DEFAULT_STATE.fx, ...(parsed.fx ?? {}) },
      assets: parsed.assets ?? [],
      realEstate: parsed.realEstate ?? [],
    };
  } catch (e) {
    console.warn('localStorage の読み込みに失敗しました', e);
    return DEFAULT_STATE;
  }
}

export function saveState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('localStorage の保存に失敗しました', e);
  }
}

export function exportJson(state: AppState): string {
  return JSON.stringify(state, null, 2);
}

export function importJson(json: string): AppState {
  const parsed = JSON.parse(json) as Partial<AppState>;
  return {
    ...DEFAULT_STATE,
    ...parsed,
    simulation: { ...DEFAULT_STATE.simulation, ...(parsed.simulation ?? {}) },
    settings: { ...DEFAULT_STATE.settings, ...(parsed.settings ?? {}) },
    fx: { ...DEFAULT_STATE.fx, ...(parsed.fx ?? {}) },
    assets: parsed.assets ?? [],
    realEstate: parsed.realEstate ?? [],
  };
}
