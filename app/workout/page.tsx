// app/workout/page.tsx
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  WorkoutSession,
  ExerciseItem,
  getAllWorkoutsFromDB,
} from '@/app/data/workoutsDB';

interface CustomPerf {
  sets: number;
  reps: number;
  weight: number;
}

function calculate1RM(weight: number, reps: number): number {
  if (weight <= 0 || reps <= 0) return 0;
  if (reps === 1) return weight;
  if (reps >= 37) return Math.round(weight * 1.5);
  return Math.round(weight * (36 / (37 - reps)));
}

function playBeepSound() {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  } catch {
    // Ignore les environnements sans support Web Audio
  }
}

function triggerHaptic() {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    navigator.vibrate([120, 60, 120]);
  }
}

function WorkoutPlayerContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get('session');

  const [session, setSession] = useState<WorkoutSession | null>(null);
  const [perfs, setPerfs] = useState<Record<number, CustomPerf>>({});

  // Contrôle du cycle de séance
  const [isSessionStarted, setIsSessionStarted] = useState<boolean>(false);
  const [isSessionFinished, setIsSessionFinished] = useState<boolean>(false);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [currentSet, setCurrentSet] = useState<number>(1);
  const [completedExercisesCount, setCompletedExercisesCount] = useState<number>(0);

  // Chronomètre de repos automatique
  const [restSeconds, setRestSeconds] = useState<number>(0);
  const [restRunning, setRestRunning] = useState<boolean>(false);

  useEffect(() => {
    const allSessions = getAllWorkoutsFromDB();
    const found = allSessions.find((s) => s.id === sessionId) || allSessions[0];
    setSession(found);

    const savedPerfs = localStorage.getItem('strix_exercise_perfs');
    if (savedPerfs) {
      try {
        setPerfs(JSON.parse(savedPerfs));
      } catch (e) {
        console.error(e);
      }
    }
  }, [sessionId]);

  useEffect(() => {
    if (!restRunning || restSeconds <= 0) {
      if (restRunning && restSeconds === 0) {
        playBeepSound();
        triggerHaptic();
        setRestRunning(false);
      }
      return;
    }
    const timer = setInterval(() => {
      setRestSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [restRunning, restSeconds]);

  if (!session) {
    return (
      <div className="py-20 text-center space-y-4">
        <p className="text-slate-400">Chargement de la séance...</p>
        <Link href="/exercises" className="text-violet-600 font-bold text-sm">
          ← Retour au catalogue
        </Link>
      </div>
    );
  }

  const getExercisePerf = (ex: ExerciseItem): CustomPerf => {
    return (
      perfs[ex.id] || {
        sets: ex.defaultSets,
        reps: ex.defaultReps,
        weight: ex.defaultWeight,
      }
    );
  };

  // Modification autorisée UNIQUEMENT avant le démarrage
  const handleUpdateWeightBeforeStart = (exId: number, field: keyof CustomPerf, value: number) => {
    if (isSessionStarted) return;
    const base = perfs[exId] || {
      sets: session.exercises.find((e) => e.id === exId)?.defaultSets || 4,
      reps: session.exercises.find((e) => e.id === exId)?.defaultReps || 10,
      weight: session.exercises.find((e) => e.id === exId)?.defaultWeight || 20,
    };
    const updated = {
      ...perfs,
      [exId]: { ...base, [field]: Math.max(0, value) },
    };
    setPerfs(updated);
    localStorage.setItem('strix_exercise_perfs', JSON.stringify(updated));
  };

  // Démarrage et verrouillage définitif
  const handleStartWorkout = () => {
    setIsSessionStarted(true);
    setCurrentIndex(0);
    setCurrentSet(1);
    setCompletedExercisesCount(0);
  };

  const currentExercise = session.exercises[currentIndex];
  const currentPerf = getExercisePerf(currentExercise);
  const totalSetsForCurrent = currentPerf.sets;
  const est1RM = calculate1RM(currentPerf.weight, currentPerf.reps);

  // Validation d'une série pendant la séance
  const handleValidateSet = () => {
    triggerHaptic();

    if (currentSet < totalSetsForCurrent) {
      // Série intermédiaire : passage à la série suivante + repos
      setCurrentSet((prev) => prev + 1);
      setRestSeconds(90);
      setRestRunning(true);
    } else {
      // Toutes les séries de l'exercice sont finies : passage AUTOMATIQUE à l'exercice d'après
      playBeepSound();
      setCompletedExercisesCount((prev) => prev + 1);

      if (currentIndex < session.exercises.length - 1) {
        setCurrentIndex((prev) => prev + 1);
        setCurrentSet(1);
        setRestSeconds(90);
        setRestRunning(true);
      } else {
        // Dernier exercice validé : clôture automatique
        handleFinishAndSave();
      }
    }
  };

  const handleFinishAndSave = () => {
    const totalVolume = session.exercises.reduce((acc, ex) => {
      const p = getExercisePerf(ex);
      return acc + p.sets * p.reps * (p.weight > 0 ? p.weight : 20);
    }, 0);

    const log = {
      id: String(Date.now()),
      date: new Date().toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      }),
      exercisesCount: session.exercises.length,
      totalKcal: session.totalKcal,
      totalVolumeKg: totalVolume,
    };

    const savedHistory = localStorage.getItem('strix_workout_history');
    const history = savedHistory ? JSON.parse(savedHistory) : [];
    localStorage.setItem('strix_workout_history', JSON.stringify([log, ...history]));

    window.dispatchEvent(new Event('strix-update'));
    setIsSessionFinished(true);
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Écran de fin de séance
  if (isSessionFinished) {
    return (
      <div className="max-w-md mx-auto py-12 text-center space-y-6 bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center text-3xl font-black mx-auto">
          ✓
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-black text-slate-950">Séance Terminée !</h1>
          <p className="text-xs text-slate-500">
            Toutes les répétitions et séries ont été validées avec succès. Ton volume a été enregistré dans ton historique.
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex justify-around text-xs font-bold text-slate-700">
          <div>
            <p className="text-slate-400 uppercase text-[10px]">Exercices</p>
            <p className="text-lg font-black text-slate-900">{session.exercises.length}</p>
          </div>
          <div>
            <p className="text-slate-400 uppercase text-[10px]">Dépense</p>
            <p className="text-lg font-black text-violet-600">{session.totalKcal} kcal</p>
          </div>
        </div>
        <button
          onClick={() => router.push('/')}
          className="w-full py-3.5 bg-slate-950 hover:bg-violet-600 text-white font-bold text-xs rounded-xl transition cursor-pointer"
        >
          Retour au Tableau de Bord
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-2">

      {/* PHASE 1 : AVANT DE LANCER (MODIFICATIONS AUTORISÉES) */}
      {!isSessionStarted ? (
        <div className="space-y-6">
          <div className="bg-slate-950 text-white p-6 sm:p-8 rounded-3xl shadow-lg space-y-3 border border-white/10">
            <span className="text-[10px] font-bold uppercase tracking-widest text-violet-400">
              Calibrage Pré-Séance
            </span>
            <h1 className="text-2xl sm:text-3xl font-black">{session.title}</h1>
            <p className="text-xs sm:text-sm text-slate-300">
              Ajuste tes charges (kg), séries et répétitions ci-dessous. Dès que la séance sera lancée, tous les réglages seront verrouillés pour rester concentré sur l'effort.
            </p>
            <div className="pt-2 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                {session.exercises.length} exercices prévus • {session.duration} min
              </span>
              <button
                onClick={handleStartWorkout}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-6 py-3 rounded-xl text-xs sm:text-sm transition cursor-pointer shadow-lg shadow-emerald-500/20"
              >
                Lancer la séance ▶
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
              Personnalisation des charges avant le départ
            </h2>
            {session.exercises.map((ex, idx) => {
              const p = getExercisePerf(ex);
              return (
                <div
                  key={ex.id}
                  className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-3"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-400">
                        {idx + 1}. {ex.muscle}
                      </span>
                      <h3 className="font-bold text-slate-900 text-sm">{ex.name}</h3>
                    </div>
                    <span className="text-xs font-semibold text-slate-500">{ex.equipment}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-400">Séries</label>
                      <input
                        type="number"
                        min={1}
                        max={10}
                        value={p.sets}
                        onChange={(e) => handleUpdateWeightBeforeStart(ex.id, 'sets', parseInt(e.target.value, 10) || 1)}
                        className="w-full mt-1 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-black text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-400">Reps</label>
                      <input
                        type="number"
                        min={1}
                        max={100}
                        value={p.reps}
                        onChange={(e) => handleUpdateWeightBeforeStart(ex.id, 'reps', parseInt(e.target.value, 10) || 1)}
                        className="w-full mt-1 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-black text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-violet-600">Poids (kg)</label>
                      <input
                        type="number"
                        min={0}
                        max={500}
                        value={p.weight}
                        onChange={(e) => handleUpdateWeightBeforeStart(ex.id, 'weight', parseInt(e.target.value, 10) || 0)}
                        className="w-full mt-1 px-2.5 py-1.5 bg-white border border-violet-200 text-violet-600 rounded-lg text-xs font-black"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={handleStartWorkout}
            className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm rounded-2xl transition cursor-pointer shadow-lg shadow-emerald-500/20"
          >
            Verrouiller & Démarrer l'entraînement ▶
          </button>
        </div>
      ) : (
        /* PHASE 2 : SÉANCE EN COURS (TOUT EST VERROUILLÉ & PASSAGE AUTOMATIQUE) */
        <div className="space-y-6">
          
          {/* Barre d'état en direct */}
          <div className="bg-slate-950 text-white p-5 rounded-3xl flex items-center justify-between border border-white/10 shadow-lg">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                  Séance en cours • Paramètres verrouillés
                </span>
              </div>
              <h1 className="text-base sm:text-lg font-black tracking-tight mt-0.5">{session.title}</h1>
            </div>
            <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-white/10 text-white">
              Exo {currentIndex + 1} / {session.exercises.length}
            </span>
          </div>

          {/* Chronomètre de repos actif */}
          {restRunning && restSeconds > 0 && (
            <div className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white p-4 rounded-2xl flex items-center justify-between shadow-md">
              <div className="flex items-center gap-3">
                <span className="text-2xl font-black">{formatTimer(restSeconds)}</span>
                <span className="text-xs font-medium text-violet-100">Récupération active</span>
              </div>
              <button
                onClick={() => {
                  setRestRunning(false);
                  setRestSeconds(0);
                }}
                className="text-xs font-bold px-3 py-1.5 bg-black/20 hover:bg-black/30 rounded-lg transition cursor-pointer"
              >
                Passer le repos
              </button>
            </div>
          )}

          {/* Carte de l'exercice actif — STRICTEMENT EN LECTURE SEULE */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-slate-100 text-slate-700">
                {currentExercise.muscle} • {currentExercise.equipment}
              </span>
              <span className="text-xs font-black text-violet-600 bg-violet-50 px-3 py-1 rounded-full">
                Série {currentSet} sur {totalSetsForCurrent}
              </span>
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-950">{currentExercise.name}</h2>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">{currentExercise.desc}</p>
            </div>

            {/* Badges de valeurs fixes (aucun champ modifiable) */}
            <div className="grid grid-cols-3 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/60 text-center">
              <div>
                <p className="text-[10px] font-bold uppercase text-slate-400">Objectif Séries</p>
                <p className="text-2xl font-black text-slate-900 mt-0.5">{totalSetsForCurrent}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase text-slate-400">Répétitions</p>
                <p className="text-2xl font-black text-slate-900 mt-0.5">{currentPerf.reps}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase text-violet-600">Charge Fixée</p>
                <p className="text-2xl font-black text-violet-600 mt-0.5">
                  {currentPerf.weight > 0 ? `${currentPerf.weight} kg` : 'PDC'}
                </p>
              </div>
            </div>

            {est1RM > 0 && (
              <div className="text-center text-xs text-slate-400 font-semibold">
                1RM théorique verrouillé : <strong className="text-slate-700">{est1RM} kg</strong>
              </div>
            )}

            {/* Gros bouton d'action pour valider la série et passer automatiquement */}
            <button
              onClick={handleValidateSet}
              className="w-full py-5 rounded-2xl font-black text-base transition cursor-pointer shadow-xl bg-violet-600 hover:bg-violet-500 text-white shadow-violet-600/30 active:scale-95"
            >
              {currentSet === totalSetsForCurrent ? (
                currentIndex === session.exercises.length - 1 ? (
                  'Valider la dernière série & Terminer la séance 🏁'
                ) : (
                  'Valider la série & Passer à l’exercice suivant ➔'
                )
              ) : (
                `Valider la série ${currentSet}/${totalSetsForCurrent} (${currentPerf.reps} reps) ✓`
              )}
            </button>
          </div>

          {/* Indicateur visuel d'avancement des exercices */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 flex items-center justify-between text-xs text-slate-500 font-bold">
            <span>Progression séance</span>
            <span>
              {completedExercisesCount} / {session.exercises.length} exercices complétés
            </span>
          </div>

          <div className="text-center">
            <button
              onClick={() => {
                if (confirm('Veux-tu vraiment abandonner la séance en cours ?')) {
                  setIsSessionStarted(false);
                }
              }}
              className="text-xs text-rose-500 hover:text-rose-600 font-bold cursor-pointer underline"
            >
              Abandonner la séance
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default function WorkoutPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-sm text-slate-400">Chargement...</div>}>
      <WorkoutPlayerContent />
    </Suspense>
  );
}
