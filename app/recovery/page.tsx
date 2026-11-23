// app/recovery/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import BodyMap from '@/components/BodyMap';

export default function RecoveryPage() {
  const [recoveryState, setRecoveryState] = useState<Record<string, number>>({
    pectoraux: 100, dos: 100, jambes: 100, epaules: 100, bras: 100, abdos: 100
  });

  const calculateBiologicalRecovery = () => {
    const savedMuscleLogs = localStorage.getItem('strix_muscle_history');
    if (!savedMuscleLogs) return;

    try {
      const logs = JSON.parse(savedMuscleLogs) as Record<string, number>;
      const now = Date.now();
      const RECOVERY_TIME_MS = 48 * 60 * 60 * 1000; // L'algorithme efface les courbatures sur 48h

      const newState: Record<string, number> = {};
      Object.keys(logs).forEach((muscle) => {
        const timeElapsed = now - logs[muscle];
        const recoveryPercentage = Math.min(100, Math.max(0, (timeElapsed / RECOVERY_TIME_MS) * 100));
        newState[muscle] = Math.round(recoveryPercentage);
      });
      
      setRecoveryState((prev) => ({ ...prev, ...newState }));
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    calculateBiologicalRecovery();
    const interval = setInterval(calculateBiologicalRecovery, 60000);
    return () => clearInterval(interval);
  }, []);

  const globalReadiness = Math.round(
    Object.values(recoveryState).reduce((a, b) => a + b, 0) / Object.keys(recoveryState).length
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-6">
      <div className="bg-slate-950 text-white p-6 sm:p-8 rounded-3xl flex items-center justify-between border border-slate-900 shadow-xl">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-violet-400">Cartographie 48H</span>
          <h1 className="text-2xl font-black mt-1">État de Forme Physique</h1>
          <p className="text-xs text-slate-400 mt-2 max-w-sm">
            Les muscles sollicités récupèrent automatiquement sur un cycle de 48 heures. L'IA adapte tes prochaines séances en fonction de ce modèle.
          </p>
        </div>
        <Link href="/" className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold transition">
          Retour ✕
        </Link>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-center md:w-1/2">
          <div className="w-64 h-96">
            <BodyMap recovery={recoveryState} />
          </div>
        </div>

        <div className="space-y-4 md:w-1/2">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-[10px] font-bold uppercase text-slate-400">Disponibilité Globale</p>
            <div className="text-4xl font-black text-slate-900 mt-1">{globalReadiness}%</div>
            <div className="w-full h-2 bg-slate-100 rounded-full mt-4 overflow-hidden">
              <div className="h-full bg-slate-900 rounded-full" style={{ width: `${globalReadiness}%` }} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <p className="text-[10px] font-bold uppercase text-slate-400">Détail par groupe musculaire</p>
            {Object.entries(recoveryState).map(([muscle, score]) => (
              <div key={muscle} className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-700 capitalize">{muscle}</span>
                <div className="flex items-center gap-3">
                  <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full" 
                      style={{ 
                        width: `${score}%`, 
                        backgroundColor: score < 30 ? '#f43f5e' : score < 70 ? '#8b5cf6' : '#10b981' 
                      }} 
                    />
                  </div>
                  <span className="text-xs font-bold w-8 text-right text-slate-500">{score}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
