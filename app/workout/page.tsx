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

interface PersonalRecord {
  weight: number;
  reps: number;
  oneRepMax: number;
  date: string;
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
    // Navigateurs sans Web Audio support
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
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [completedIds, setCompletedIds] = useState<number[]>([]);
  const [perfs, setPerfs] = useState<Record<number, CustomPerf>>({});
  const [records, setRecords] = useState<Record<number, PersonalRecord>>({});

  // Chronomètre de repos
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

    const savedRecords = localStorage.getItem('strix_personal_records');
    if (savedRecords) {
      try {
        setRecords(JSON.parse(savedRecords));
      } catch (e) {
        console.error(e);
      }
    }

    const savedCompleted = localStorage.getItem('strix_completed_exercises');
    if (savedCompleted) {
      try {
        setCompletedIds(JSON.parse(savedCompleted));
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
        <p className="text-slate-400">Chargement de la session d'entraînement...</p>
        <Link href="/exercises" className="text-violet-600 font-bold text-sm">
          ← Retourner au catalogue
        </Link>
      </div>
    );
  }

  const currentEx: ExerciseItem = session.exercises[currentIndex];
  const perf: CustomPerf = perfs[currentEx.id] || {
    sets: currentEx.defaultSets,
    reps: currentEx.defaultReps,
    weight: currentEx.defaultWeight,
  };

  const est1RM = calculate1RM(perf.weight, perf.reps);
  const pr = records[currentEx.id];
  const isDone = completedIds.includes(currentEx.id);

  const updatePerf = (field: keyof CustomPerf, val: number) => {
    const updated = {
      ...perfs,
      [currentEx.id]: { ...perf, [field]: Math.max(0, val) },
    };
    setPerfs(updated);
    localStorage.setItem('strix_exercise_perfs', JSON.stringify(updated));

    const newWeight = field === 'weight' ? val : perf.weight;
    const newReps = field === 'reps' ? val : perf.reps;
    const calculated = calculate1RM(newWeight, newReps);

    if (calculated > 0 && (!pr || calculated > pr.oneRepMax)) {
      const newPR: PersonalRecord = {
        weight: newWeight,
        reps: newReps,
        oneRepMax: calculated,
        date: new Date().toLocaleDateString('fr-FR'),
      };
      const updatedRecords = { ...records, [currentEx.id]: newPR };
      setRecords(updatedRecords);
      localStorage.setItem('strix_personal_records', JSON.stringify(updatedRecords));
    }
  };

  const toggleValidate = () => {
    let updated: number[];
    if (isDone) {
      updated = completedIds.filter((id) => id !== currentEx.id);
    } else {
      updated = [...completedIds, currentEx.id];
      setRestSeconds(90);
      setRestRunning(true);
      triggerHaptic();
    }
    setCompletedIds(updated);
    localStorage.setItem('strix_completed_exercises', JSON.stringify(updated));
    window.dispatchEvent(new Event('strix-update'));
  };

  const finishWorkout = () => {
    const totalVolume = session.exercises.reduce((acc, ex) => {
      const p = perfs[ex.id] || { sets: ex.defaultSets, reps: ex.defaultReps, weight: ex.defaultWeight };
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
      exercisesCount: completedIds.length,
      totalKcal: session.totalKcal,
      totalVolumeKg: totalVolume,
    };

    const savedHistory = localStorage.getItem('strix_workout_history');
    const history = savedHistory ? JSON.parse(savedHistory) : [];
    localStorage.setItem('strix_workout_history', JSON.stringify([log, ...history]));

    localStorage.setItem('strix_completed_exercises', JSON.stringify([]));
    window.dispatchEvent(new Event('strix-update'));
    router.push('/');
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-2">

      {/* Barre supérieure du Player */}
      <div className="bg-slate-950 text-white p-5 rounded-3xl flex items-center justify-between border border-white/10 shadow-lg">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-violet-400">
            Session en cours • {currentIndex + 1}/{session.exercises.length}
          </span>
          <h1 className="text-lg font-black tracking-tight">{session.title}</h1>
        </div>
        <Link
          href="/exercises"
          className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 transition"
        >
          Quitter ✕
        </Link>
      </div>

      {/* Chronomètre de repos flottant / intégré */}
      {restSeconds > 0 && (
        <div className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white p-4 rounded-2xl flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-black">{formatTimer(restSeconds)}</span>
            <span className="text-xs font-medium text-violet-100">Récupération active</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setRestSeconds((prev) => prev + 30)}
              className="text-xs font-bold px-2.5 py-1 bg-white/20 hover:bg-white/30 rounded-lg transition"
            >
              +30s
            </button>
            <button
              onClick={() => {
                setRestRunning(false);
                setRestSeconds(0);
              }}
              className="text-xs font-bold px-2.5 py-1 bg-black/20 hover:bg-black/30 rounded-lg transition"
            >
              Passer
            </button>
          </div>
        </div>
      )}

      {/* Carte principale de l'exercice actif */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-slate-100 text-slate-700">
            {currentEx.muscle} • {currentEx.equipment}
          </span>
          {est1RM > 0 && (
            <span className="text-xs font-bold text-violet-600 bg-violet-50 px-2.5 py-1 rounded-md">
              1RM Estimé : {est1RM} kg
            </span>
          )}
        </div>

        <div className="space-y-1">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-950">{currentEx.name}</h2>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">{currentEx.desc}</p>
        </div>

        {/* Contrôles tactiles haute visibilité */}
        <div className="grid grid-cols-3 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/60">
          <div className="text-center space-y-1">
            <label className="text-[10px] font-bold uppercase text-slate-400">Séries</label>
            <input
              type="number"
              min={1}
              value={perf.sets}
              onChange={(e) => updatePerf('sets', parseInt(e.target.value, 10) || 1)}
              className="w-full text-center text-2xl font-black bg-white border border-slate-200 rounded-xl py-2"
            />
          </div>
          <div className="text-center space-y-1">
            <label className="text-[10px] font-bold uppercase text-slate-400">Répétitions</label>
            <input
              type="number"
              min={1}
              value={perf.reps}
              onChange={(e) => updatePerf('reps', parseInt(e.target.value, 10) || 1)}
              className="w-full text-center text-2xl font-black bg-white border border-slate-200 rounded-xl py-2"
            />
          </div>
          <div className="text-center space-y-1">
            <label className="text-[10px] font-bold uppercase text-violet-600">Charge (kg)</label>
            <input
              type="number"
              min={0}
              value={perf.weight}
              onChange={(e) => updatePerf('weight', parseInt(e.target.value, 10) || 0)}
              className="w-full text-center text-2xl font-black bg-white border border-violet-200 text-violet-600 rounded-xl py-2"
            />
          </div>
        </div>

        {/* Bouton de validation de la série */}
        <button
          onClick={toggleValidate}
          className={`w-full py-4 rounded-2xl font-black text-sm sm:text-base transition cursor-pointer shadow-lg ${
            isDone
              ? 'bg-emerald-500 hover:bg-emerald-600 text-slate-950 shadow-emerald-500/20'
              : 'bg-violet-600 hover:bg-violet-700 text-white shadow-violet-600/30'
          }`}
        >
          {isDone ? '✓ Exercice Validé (Clique pour annuler)' : 'Valider la série & Lancer le repos'}
        </button>
      </div>

      {/* Navigation entre les exercices et fin de séance */}
      <div className="flex items-center justify-between gap-3">
        <button
          disabled={currentIndex === 0}
          onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
          className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30 text-xs font-bold text-slate-700 transition"
        >
          ← Précédent
        </button>

        <button
          onClick={finishWorkout}
          className="px-5 py-2.5 rounded-xl bg-slate-950 hover:bg-violet-600 text-white text-xs font-bold transition shadow-sm"
        >
          Terminer la séance 🏁
        </button>

        <button
          disabled={currentIndex === session.exercises.length - 1}
          onClick={() => setCurrentIndex((prev) => Math.min(session.exercises.length - 1, prev + 1))}
          className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30 text-xs font-bold text-slate-700 transition"
        >
          Suivant →
        </button>
      </div>

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
