'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const [caloriesToday, setCaloriesToday] = useState(0);
  const [proteinsToday, setProteinsToday] = useState(0);
  const [workoutsCompleted, setWorkoutsCompleted] = useState(3);
  const calorieGoal = 2400;

  useEffect(() => {
    const savedMeals = localStorage.getItem('strix_meals');
    if (savedMeals) {
      try {
        const parsed = JSON.parse(savedMeals) as Array<{ calories: number; proteins: number }>;
        setCaloriesToday(parsed.reduce((acc, m) => acc + m.calories, 0));
        setProteinsToday(parsed.reduce((acc, m) => acc + m.proteins, 0));
      } catch (e) {
        console.error(e);
      }
    }
    const savedWorkouts = localStorage.getItem('strix_workouts_count');
    if (savedWorkouts) {
      setWorkoutsCompleted(parseInt(savedWorkouts) || 3);
    }
  }, []);

  const caloriePercentage = Math.min(100, Math.round((caloriesToday / calorieGoal) * 100));

  const weeklyActivity = [
    { day: 'Lun', pct: 75, active: true },
    { day: 'Mar', pct: 100, active: true },
    { day: 'Mer', pct: 40, active: false },
    { day: 'Jeu', pct: 90, active: true },
    { day: 'Ven', pct: 85, active: true },
    { day: 'Sam', pct: 60, active: false },
    { day: 'Dim', pct: 95, active: true },
  ];

  return (
    <div className="space-y-8">
      
      {/* Hero Banner Sombre Premium */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-950 text-white p-8 sm:p-10 shadow-xl">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-violet-600/30 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-4 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-xs font-semibold text-violet-300">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
              Tableau de commandement athlétique
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              Dépasse tes standards. <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-300">Chaque jour.</span>
            </h1>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              Visualise ta charge d'entraînement, maîtrise tes macronutriments au gramme près et maintiens ta discipline grâce à un suivi en temps réel.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href="/exercises"
                className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white font-semibold px-5 py-3 rounded-xl text-sm transition shadow-lg shadow-violet-600/25"
              >
                <span>Lancer une séance</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                href="/nutrition"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 text-white border border-white/15 font-semibold px-5 py-3 rounded-xl text-sm transition"
              >
                <span>Gérer mes macros</span>
              </Link>
            </div>
          </div>

          {/* Carte Score de Forme dans le Hero */}
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 min-w-[260px] space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Indice de récupération</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Optimal
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-white">92%</span>
              <span className="text-xs text-emerald-400 font-semibold">+4% vs hier</span>
            </div>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-violet-500 to-emerald-400 rounded-full" style={{ width: '92%' }} />
            </div>
            <p className="text-xs text-slate-400">Prêt pour une séance haute intensité aujourd'hui.</p>
          </div>
        </div>
      </div>

      {/* Bento Grid Analytique */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Carte 1 : Bilan Énergétique */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Apport Calorique</p>
              <h3 className="text-lg font-bold text-slate-900 mt-0.5">Objectif Journalier</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center text-violet-600">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-black text-slate-950">{caloriesToday} <span className="text-sm font-semibold text-slate-400">/ {calorieGoal} kcal</span></span>
              <span className="text-xs font-bold text-violet-600">{caloriePercentage}%</span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-violet-600 rounded-full transition-all duration-500"
                style={{ width: `${caloriePercentage}%` }}
              />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Protéines cumulées : <strong className="text-slate-900">{proteinsToday}g</strong></span>
            <Link href="/nutrition" className="font-bold text-violet-600 hover:text-violet-700">
              Ajouter un repas →
            </Link>
          </div>
        </div>

        {/* Carte 2 : Volume d'entraînement */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Régularité</p>
              <h3 className="text-lg font-bold text-slate-900 mt-0.5">Charge Hebdomadaire</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>

          {/* Mini Histogramme */}
          <div className="flex items-end justify-between gap-2 h-24 pt-4">
            {weeklyActivity.map((item) => (
              <div key={item.day} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                <div className="w-full bg-slate-100 rounded-md h-full flex items-end overflow-hidden">
                  <div
                    className={`w-full rounded-md transition-all ${ item.active ? 'bg-slate-900' : 'bg-slate-300' }`} style={{ height: `${item.pct}%` }}
                  />
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">{item.day}</span>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium"><strong className="text-slate-900">{workoutsCompleted} séances</strong> validées cette semaine</span>
            <Link href="/exercises" className="font-bold text-slate-900 hover:text-violet-600">
              Catalogue →
            </Link>
          </div>
        </div>

        {/* Carte 3 : Focus Programme du Jour */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Recommandation IA</p>
              <h3 className="text-lg font-bold text-slate-900 mt-0.5">Session Push / Haut du corps</h3>
            </div>
            <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-600 border border-amber-200/60">
              45 min
            </span>
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 text-xs">
              <span className="font-semibold text-slate-800">1. Développé couché haltères</span>
              <span className="font-bold text-slate-500">4 × 10</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 text-xs">
              <span className="font-semibold text-slate-800">2. Dips barres parallèles</span>
              <span className="font-bold text-slate-500">4 × 12</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 text-xs">
              <span className="font-semibold text-slate-800">3. Crunchs abdominaux</span>
              <span className="font-bold text-slate-500">3 × 20</span>
            </div>
          </div>

          <Link
            href="/exercises"
            className="w-full py-2.5 rounded-xl bg-slate-950 hover:bg-violet-600 text-white font-semibold text-xs text-center transition"
          >
            Accéder aux exercices détaillés
          </Link>
        </div>

      </div>
    </div>
  );
}
