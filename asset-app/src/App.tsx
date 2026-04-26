import { useState } from 'react';
import Dashboard from './pages/Dashboard';
import Assets from './pages/Assets';
import RealEstatePage from './pages/RealEstate';
import Simulation from './pages/Simulation';
import Settings from './pages/Settings';

type Tab = 'dashboard' | 'assets' | 'real_estate' | 'simulation' | 'settings';

const TABS: { key: Tab; label: string }[] = [
  { key: 'dashboard', label: 'ダッシュボード' },
  { key: 'assets', label: '資産一覧' },
  { key: 'real_estate', label: '不動産' },
  { key: 'simulation', label: 'シミュレーション' },
  { key: 'settings', label: '設定' },
];

export default function App() {
  const [tab, setTab] = useState<Tab>('dashboard');

  return (
    <div className="min-h-full">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-slate-800">資産管理・将来予測</h1>
          <nav className="flex gap-1">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                  tab === t.key ? 'bg-blue-600 text-white' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                {t.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-6">
        {tab === 'dashboard' && <Dashboard />}
        {tab === 'assets' && <Assets />}
        {tab === 'real_estate' && <RealEstatePage />}
        {tab === 'simulation' && <Simulation />}
        {tab === 'settings' && <Settings />}
      </main>
    </div>
  );
}
