import {
  createContext,
  Dispatch,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from 'react';
import { AppState, Asset, FxRate, RealEstate, AppSettings, SimulationParams, DEFAULT_STATE } from '../types';
import { loadState, saveState } from '../storage/localStorage';

export type Action =
  | { type: 'SET_STATE'; state: AppState }
  | { type: 'UPSERT_ASSET'; asset: Asset }
  | { type: 'DELETE_ASSET'; id: string }
  | { type: 'UPDATE_PRICES'; updates: { id: string; price: number; updatedAt: string }[] }
  | { type: 'UPSERT_REAL_ESTATE'; item: RealEstate }
  | { type: 'DELETE_REAL_ESTATE'; id: string }
  | { type: 'SET_FX'; fx: FxRate }
  | { type: 'SET_SIMULATION'; sim: Partial<SimulationParams> }
  | { type: 'SET_SETTINGS'; settings: Partial<AppSettings> };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_STATE':
      return action.state;
    case 'UPSERT_ASSET': {
      const idx = state.assets.findIndex((a) => a.id === action.asset.id);
      const next = state.assets.slice();
      if (idx >= 0) next[idx] = action.asset;
      else next.push(action.asset);
      return { ...state, assets: next };
    }
    case 'DELETE_ASSET':
      return { ...state, assets: state.assets.filter((a) => a.id !== action.id) };
    case 'UPDATE_PRICES': {
      const map = new Map(action.updates.map((u) => [u.id, u]));
      const next = state.assets.map((a) => {
        const u = map.get(a.id);
        if (!u) return a;
        if (a.kind !== 'holding') return a;
        return { ...a, lastPrice: u.price, lastUpdatedAt: u.updatedAt };
      });
      return { ...state, assets: next };
    }
    case 'UPSERT_REAL_ESTATE': {
      const idx = state.realEstate.findIndex((r) => r.id === action.item.id);
      const next = state.realEstate.slice();
      if (idx >= 0) next[idx] = action.item;
      else next.push(action.item);
      return { ...state, realEstate: next };
    }
    case 'DELETE_REAL_ESTATE':
      return { ...state, realEstate: state.realEstate.filter((r) => r.id !== action.id) };
    case 'SET_FX':
      return { ...state, fx: action.fx };
    case 'SET_SIMULATION':
      return { ...state, simulation: { ...state.simulation, ...action.sim } };
    case 'SET_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.settings } };
    default:
      return state;
  }
}

interface Ctx {
  state: AppState;
  dispatch: Dispatch<Action>;
}

const AppContext = createContext<Ctx | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, DEFAULT_STATE, () => loadState());

  useEffect(() => {
    saveState(state);
  }, [state]);

  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): Ctx {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('AppProvider の外で useApp が呼ばれました');
  return ctx;
}
