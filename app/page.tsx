// app/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  WorkoutSession,
  defaultWorkoutsDB,
  getAllWorkoutsFromDB,
  ExerciseItem,
} from '@/app/data/workoutsDB';
import BodyMap from '@/components/BodyMap';

export default function Home() {
  // Données nutritionnelles synchronisées
  const [caloriesToday, setCaloriesToday] = useState<number>(0);
  const [proteinsToday, setProteinsToday] = useState<number>(0);
  const [waterToday, setWaterToday] = useState<number>(0);
  const [calorieGoal, setCalorieGoal] = useState<number>(2400);
  const [proteinGoal, setProteinGoal] = useState<number>(160);

  // Données d'entraînement synchronisées
  const [sessionsDB, setSessionsDB] = useState<WorkoutSession[]>(defaultWorkoutsDB);
  const [selectedSessionId, setSelectedSessionId] = useState<string>(defaultWorkoutsDB[0].id);
  const [completedIds, setCompletedIds] = useState<number[]>([]);
  const [workoutsCount, setWorkoutsCount] = useState<number>(0);
  const [weeklyBurned, setWeeklyBurned] = useState<number[]>([320, 480, 0, 410, 390, 0, 0]);

  // Calculateur interactif de récupération (SNC)
  const [showRecoveryEditor, setShowRecoveryEditor] = useState<boolean>(false);
  const [sleepHours, setSleepHours] = useState<number>(8);
  const [energyLevel, setEnergyLevel] = useState<number>(8);
  const [sorenessLevel, setSorenessLevel] = useState<number>(2);

  // État de récupération biométrique des muscles (0 à 100%)
  const [recoveryState, setRecoveryState] = useState<Record<string, number>>({
    pectoraux: 100, dos: 100, jambes: 100, epaules: 100, bras: 100, abdos: 100, cardio: 100
  });

  const getCurrentDayIndex = () => {
    const day = new Date().getDay();
    return day === 0 ? 6 : day - 1; // 0 = Lun, 6 = Dim
  };

  const calculateBiologicalRecovery = () => {
    const savedMuscleLogs = localStorage.getItem('strix_muscle_history');
    if (!savedMuscleLogs) return;

    try {
      const logs = JSON.parse(savedMuscleLogs) as Record<string, number>;
      const now = Date.now();
      const RECOVERY_TIME_MS = 48 * 60 * 60 * 1000; // 48 heures

      const newState: Record<string, number> = {};
      Object.keys(logs).forEach((muscle) => {
        const timeElapsed = now - logs[muscle];
        const recoveryPercentage = Math.min(100, Math.max(0, (timeElapsed / RECOVERY_TIME_MS) * 100));
        newState[muscle] = Math.round(recoveryPercentage);
      });
      
      setRecoveryState((prev) => ({ ...prev, ...newState }));
    } catch (e) {
      console.error("Erreur de calcul de récupération", e);
    }
  };

  const loadDashboardData = () => {
    const allWorkouts = getAllWorkoutsFromDB();
    setSessionsDB(allWorkouts);
    if (allWorkouts.length > 0) {
      setSelectedSessionId((prev) =>
        allWorkouts.some((w) => w.id === prev) ? prev : allWorkouts[0].id
      );
    }

    const savedMeals = localStorage.getItem('strix_meals');
    if (savedMeals) {
      try {
        const parsed = JSON.parse(savedMeals) as Array<{ calories: number; proteins: number }>;
        setCaloriesToday(parsed.reduce((acc, m) => acc + m.calories, 0));
        setProteinsToday(parsed.reduce((acc, m) => acc + m.proteins, 0));
      } catch (e) {
        console.error(e);
      }
    } else {
      setCaloriesToday(0);
      setProteinsToday(0);
    }

    const savedGoals = localStorage.getItem('strix_goals');
    if (savedGoals) {
      try {
        const parsedGoals = JSON.parse(savedGoals) as { calories: number; proteins: number };
        if (parsedGoals.calories) setCalorieGoal(parsedGoals.calories);
        if (parsedGoals.proteins) setProteinGoal(parsedGoals.proteins);
      } catch (e) {
        console.error(e);
      }
    }

    const savedWater = localStorage.getItem('strix_water');
    if (savedWater) setWaterToday(parseInt(savedWater, 10) || 0);

    const savedCompleted = localStorage.getItem('strix_completed_exercises');
    if (savedCompleted) {
      try {
        setCompletedIds(JSON.parse(savedCompleted));
      } catch (e) {
        console.error(e);
      }
    }

    const savedHistory = localStorage.getItem('strix_workout_history');
    if (savedHistory) {
      try {
        setWorkoutsCount(JSON.parse(savedHistory).length);
      } catch (e) {
        console.error(e);
      }
    }

    const savedWeekly = localStorage.getItem('strix_weekly_kcal');
    if (savedWeekly) {
      try {
        setWeeklyBurned(JSON.parse(savedWeekly));
      } catch (e) {
        console.error(e);
      }
    }

    const savedRec = localStorage.getItem('strix_recovery');
    if (savedRec) {
      try {
        const parsedRec = JSON.parse(savedRec);
        setSleepHours(parsedRec.sleepHours ?? 8);
        setEnergyLevel(parsedRec.energyLevel ?? 8);
        setSorenessLevel(parsedRec.sorenessLevel ?? 2);
      } catch (e) {
        console.error(e);
      }
    }

    calculateBiologicalRecovery();
  };

  useEffect(() => {
    loadDashboardData();
    window.addEventListener('strix-update', loadDashboardData);
    
    // Rafraîchissement du BodyMap toutes les minutes
    const interval = setInterval(calculateBiologicalRecovery, 60000);
    
    return () => {
      window.removeEventListener('strix-update', loadDashboardData);
      clearInterval(interval);
    };
  }, []);

  const sleepScore = Math.min(40, (sleepHours / 8) * 40);
  const energyScore = (energyLevel / 10) * 35;
  const sorenessScore = ((10 - sorenessLevel) / 10) * 25;
  const recoveryScore = Math.round(sleepScore + energyScore + sorenessScore);

  const saveRecovery = (sleep: number, energy: number, soreness: number) => {
    setSleepHours(sleep);
    setEnergyLevel(energy);
    setSorenessLevel(soreness);
    localStorage.setItem(
      'strix_recovery',
      JSON.stringify({ sleepHours: sleep, energyLevel: energy, sorenessLevel: soreness })
    );
  };

  const toggleProgramExercise = (ex: ExerciseItem) => {
    let updated: number[];
    let deltaKcal = 0;
    if (completedIds.includes(ex.id)) {
      updated = completedIds.filter((id) => id !== ex.id);
      deltaKcal = -ex.kcal;
    } else {
      updated = [...completedIds, ex.id];
      deltaKcal = ex.kcal;
      
      // Injecte le stress musculaire dans le BodyMap lors de la validation
      const savedLogs = localStorage.getItem('strix_muscle_history');
      const logs = savedLogs ? JSON.parse(savedLogs) : {};
      logs[ex.muscle] = Date.now();
      localStorage.setItem('strix_muscle_history', JSON.stringify(logs));
      calculateBiologicalRecovery();
    }
    setCompletedIds(updated);
    localStorage.setItem('strix_completed_exercises', JSON.stringify(updated));

    const todayIdx = getCurrentDayIndex();
    const newWeekly = [...weeklyBurned];
    newWeekly[todayIdx] = Math.max(0, (newWeekly[todayIdx] || 0) + deltaKcal);
    setWeeklyBurned(newWeekly);
    localStorage.setItem('strix_weekly_kcal', JSON.stringify(newWeekly));
    window.dispatchEvent(new Event('strix-update'));
  };

  const addWater = (amount: number) => {
    const newWater = waterToday + amount;
    setWaterToday(newWater);
    localStorage.setItem('strix_water', newWater.toString());
  };

  // Test API visuel (pour voir l'algorithme BodyMap réagir)
  const simulateWorkoutStress = (muscle: string) => {
    const savedLogs = localStorage.getItem('strix_muscle_history');
    const logs = savedLogs ? JSON.parse(savedLogs) : {};
    logs[muscle] = Date.now();
    localStorage.setItem('strix_muscle_history', JSON.stringify(logs));
    calculateBiologicalRecovery();
  };

  const currentHour = new Date().getHours();
  let greetingMessage = "Prêt à tout casser ?";
  if (currentHour >= 5 && currentHour < 12) greetingMessage = "Prêt à tout casser ce matin ?";
  else if (currentHour >= 12 && currentHour < 18) greetingMessage = "Bonne séance cet après-midi !";
  else if (currentHour >= 18 && currentHour < 23) greetingMessage = "Séance du soir, ne lâche rien !";
  else greetingMessage = "Séance tardive, respect !";

  const caloriePercentage = Math.min(100, Math.round((caloriesToday / calorieGoal) * 100));
  const todayIdx = getCurrentDayIndex();
  const daysLabels = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  const currentSession = sessionsDB.find((s) => s.id === selectedSessionId) || sessionsDB[0];

  const globalMuscleReadiness = Math.round(
    Object.values(recoveryState).reduce((a, b) => a + b, 0) / Object.keys(recoveryState).length
  );

  return (
    <div className="space-y-8">
      
      {/* Hero Banner avec BodyMap Intégrée */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-950 text-white p-6 sm:p-10 shadow-xl">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-violet-600/30 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-start justify-between gap-8">
          <div className="space-y-4 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-xs font-semibold text-violet-300">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
              Système biométrique & Générateur de séances
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              {greetingMessage}{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-300">
                Chaque jour.
              </span>
            </h1>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              Réponds à notre questionnaire en 8 étapes pour générer ta séance idéale dans la base de données, suivre tes charges et maîtriser tes macros.
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href="/quiz"
                className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white font-bold px-5 py-3 rounded-xl text-sm transition shadow-lg shadow-violet-600/30"
              >
                <span>Créer ma séance (Quiz)</span>
              </Link>
              <Link
                href="/exercises"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 text-white border border-white/15 font-semibold px-5 py-3 rounded-xl text-sm transition"
              >
                <span>Catalogue ({sessionsDB.length})</span>
              </Link>
              <Link
                href="/nutrition"
                className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 font-semibold px-4 py-3 rounded-xl text-sm transition"
              >
                <span>Nutrition</span>
              </Link>
              <Link
                href="/settings"
                className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 font-semibold px-4 py-3 rounded-xl text-sm transition"
              >
                <span>Paramètres</span>
              </Link>
            </div>
          </div>

          {/* Espace Widgets : SNC & BodyMap */}
          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            
            {/* Widget 1 : Indice de Récupération (Ton code d'origine) */}
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 flex-1 sm:w-72 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Récupération SNC</span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                    recoveryScore >= 75
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : recoveryScore >= 50
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                  }`}
                >
                  {recoveryScore >= 75 ? 'Optimal' : recoveryScore >= 50 ? 'Modéré' : 'Critique'}
                </span>
              </div>

              <div className="flex items-baseline justify-between">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-white">{recoveryScore}%</span>
                </div>
                <button
                  onClick={() => setShowRecoveryEditor(!showRecoveryEditor)}
                  className="text-xs font-bold text-violet-400 hover:text-violet-300 underline cursor-pointer"
                >
                  {showRecoveryEditor ? 'Fermer' : 'Calibrer'}
                </button>
              </div>

              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-violet-500 to-emerald-400 rounded-full transition-all duration-300"
                  style={{ width: `${recoveryScore}%` }}
                />
              </div>

              {showRecoveryEditor && (
                <div className="space-y-3 pt-2 border-t border-white/10 text-xs">
                  <div>
                    <div className="flex justify-between text-slate-300 mb-1">
                      <span>Sommeil</span>
                      <span className="font-bold">{sleepHours}h</span>
                    </div>
                    <input
                      type="range"
                      min={4}
                      max={10}
                      step={0.5}
                      value={sleepHours}
                      onChange={(e) => saveRecovery(parseFloat(e.target.value), energyLevel, sorenessLevel)}
                      className="w-full accent-violet-500 cursor-pointer"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-slate-300 mb-1">
                      <span>Énergie</span>
                      <span className="font-bold">{energyLevel}/10</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={10}
                      value={energyLevel}
                      onChange={(e) => saveRecovery(sleepHours, parseInt(e.target.value, 10), sorenessLevel)}
                      className="w-full accent-emerald-400 cursor-pointer"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-slate-300 mb-1">
                      <span>Courbatures</span>
                      <span className="font-bold">{sorenessLevel}/10</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={10}
                      value={sorenessLevel}
                      onChange={(e) => saveRecovery(sleepHours, energyLevel, parseInt(e.target.value, 10))}
                      className="w-full accent-rose-400 cursor-pointer"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Widget 2 : BodyMap 48h (Nouveau) */}
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 flex-1 sm:w-64 flex flex-col justify-between relative overflow-hidden">
              <div className="flex justify-between items-start relative z-10">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Fraîcheur Musculaire</span>
                  <div className="text-3xl font-black text-white mt-1">{globalMuscleReadiness}%</div>
                </div>
                <div className="w-16 h-24 shrink-0">
                  <BodyMap recovery={recoveryState} />
                </div>
              </div>
              
              <div className="pt-3 mt-3 border-t border-white/10 relative z-10">
                <div className="text-[9px] uppercase font-bold text-slate-500 mb-1.5">Injecter Stress (Test API)</div>
                <div className="flex flex-wrap gap-1.5">
                  {['pectoraux', 'dos', 'jambes', 'bras'].map((m) => (
                    <button
                      key={m}
                      onClick={() => simulateWorkoutStress(m)}
                      className="px-2 py-1 text-[9px] font-bold uppercase rounded bg-white/5 border border-white/10 hover:bg-rose-500/20 hover:text-rose-400 hover:border-rose-500/30 transition-colors"
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Bento Grid Analytique */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Carte 1 : Bilan Énergétique & Hydratation */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Apport Nutritionnel</p>
              <h3 className="text-lg font-bold text-slate-900 mt-0.5">Objectif Journalier</h3>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-black text-slate-950">
                {caloriesToday}{' '}
                <span className="text-sm font-semibold text-slate-400">/ {calorieGoal} kcal</span>
              </span>
              <span className="text-xs font-bold text-violet-600">{caloriePercentage}%</span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-violet-600 rounded-full transition-all duration-500"
                style={{ width: `${caloriePercentage}%` }}
              />
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-[10px] font-bold uppercase text-slate-400">Protéines</p>
                <p className="text-sm font-black text-emerald-600">
                  {proteinsToday}g <span className="text-xs font-normal text-slate-400">/ {proteinGoal}g</span>
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative w-6 h-10 bg-sky-100 rounded-md overflow-hidden border border-sky-200 shrink-0">
                    <div 
                      className="absolute bottom-0 left-0 right-0 bg-sky-500 transition-all duration-1000 ease-out"
                      style={{ height: `${Math.min(100, (waterToday / 3000) * 100)}%` }}
                    />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase text-slate-400">Hydratation</p>
                    <p className="text-sm font-black text-sky-600">
                      {(waterToday / 1000).toFixed(2)} L <span className="text-[10px] text-slate-400 font-normal">/ 3.0L</span>
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => addWater(250)}
                  className="mt-2 w-full py-1.5 bg-sky-100 hover:bg-sky-200 text-sky-700 font-bold text-[10px] rounded-lg transition"
                >
                  + 250ml
                </button>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">
              Restant : <strong className="text-slate-900">{Math.max(0, calorieGoal - caloriesToday)} kcal</strong>
            </span>
            <Link href="/nutrition" className="font-bold text-violet-600 hover:text-violet-700">
              Ajouter un repas →
            </Link>
          </div>
        </div>

        {/* Carte 2 : Charge Hebdomadaire Réelle */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Dépense Sportive</p>
              <h3 className="text-lg font-bold text-slate-900 mt-0.5">Charge Hebdomadaire</h3>
            </div>
          </div>

          <div className="flex items-end justify-between gap-2 h-28 pt-2">
            {weeklyBurned.map((kcal, idx) => {
              const pct = Math.min(100, Math.max(8, Math.round((kcal / 600) * 100)));
              const isToday = idx === todayIdx;
              return (
                <div key={daysLabels[idx]} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                  <span className="text-[9px] font-bold text-slate-400">{kcal > 0 ? `${kcal}` : ''}</span>
                  <div className="w-full bg-slate-100 rounded-md h-full flex items-end overflow-hidden">
                    <div
                      className={`w-full rounded-md transition-all duration-500 ${
                        isToday ? 'bg-violet-600' : kcal > 0 ? 'bg-slate-900' : 'bg-slate-200'
                      }`}
                      style={{ height: `${pct}%` }}
                    />
                  </div>
                  <span className={`text-[10px] font-bold uppercase ${isToday ? 'text-violet-600' : 'text-slate-400'}`}>
                    {daysLabels[idx]}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">
              Aujourd'hui : <strong className="text-violet-600">{weeklyBurned[todayIdx] || 0} kcal</strong> ({workoutsCount} séances)
            </span>
            <Link href="/exercises" className="font-bold text-slate-900 hover:text-violet-600">
              Catalogue →
            </Link>
          </div>
        </div>

        {/* Carte 3 : Sélecteur Rapide de Séance de la Base de Données */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Séance Active ({sessionsDB.length} en base)
              </p>
              <Link
                href="/quiz"
                className="text-[11px] font-bold text-violet-600 hover:text-violet-700 underline"
              >
                + Nouveau Quiz
              </Link>
            </div>

            <select
              value={currentSession?.id}
              onChange={(e) => setSelectedSessionId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-600"
            >
              {sessionsDB.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.isCustomGenerated ? `★ ${s.title}` : s.title} ({s.duration} min)
                </option>
              ))}
            </select>
          </div>

          {currentSession && (
            <div className="space-y-2">
              {currentSession.exercises.slice(0, 3).map((item) => {
                const isChecked = completedIds.includes(item.id);
                return (
                  <button
                    key={item.id}
                    onClick={() => toggleProgramExercise(item)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs transition cursor-pointer ${
                      isChecked
                        ? 'bg-violet-50/70 border-violet-300 text-violet-950'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200/60 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 text-left">
                      <span
                        className={`w-4 h-4 rounded flex items-center justify-center border shrink-0 ${
                          isChecked ? 'bg-violet-600 border-violet-600 text-white' : 'border-slate-300 bg-white'
                        }`}
                      >
                        {isChecked && '✓'}
                      </span>
                      <span className={`font-semibold line-clamp-1 ${isChecked ? 'line-through text-slate-400' : ''}`}>
                        {item.name}
                      </span>
                    </div>
                    <span className="font-bold text-slate-500 shrink-0 ml-2">
                      {item.defaultSets}×{item.defaultReps}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 pt-1">
            <Link
              href={`/workout?session=${currentSession?.id || ''}`}
              className="py-2.5 rounded-xl bg-slate-950 hover:bg-violet-600 text-white font-semibold text-xs text-center transition"
            >
              Démarrer le Live
            </Link>
            <Link
              href="/exercises"
              className="py-2.5 rounded-xl bg-violet-50 hover:bg-violet-100 text-violet-700 border border-violet-200/60 font-bold text-xs text-center transition"
            >
              Voir le détail
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
