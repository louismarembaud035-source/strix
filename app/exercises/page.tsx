// app/exercises/page.tsx
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ExerciseItem,
  WorkoutSession,
  defaultWorkoutsDB,
  getAllWorkoutsFromDB,
} from '@/app/data/workoutsDB';

interface CustomPerf {
  sets: number;
  reps: number;
  weight: number;
}

function ExercisesContent() {
  const searchParams = useSearchParams();
  const activeSessionParam = searchParams.get('session');

  const [sessionsDB, setSessionsDB] = useState<WorkoutSession[]>(defaultWorkoutsDB);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'sessions' | 'exercises'>('sessions');

  const [selectedMuscle, setSelectedMuscle] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [completedIds, setCompletedIds] = useState<number[]>([]);
  const [perfs, setPerfs] = useState<Record<number, CustomPerf>>({});

  useEffect(() => {
    const allSessions = getAllWorkoutsFromDB();
    setSessionsDB(allSessions);

    if (activeSessionParam) {
      setSelectedSessionId(activeSessionParam);
      setActiveTab('sessions');
    } else if (allSessions.length > 0 && !selectedSessionId) {
      setSelectedSessionId(allSessions[0].id);
    }

    const savedCompleted = localStorage.getItem('strix_completed_exercises');
    if (savedCompleted) {
      try {
        setCompletedIds(JSON.parse(savedCompleted));
      } catch (e) {
        console.error(e);
      }
    }

    const savedPerfs = localStorage.getItem('strix_exercise_perfs');
    if (savedPerfs) {
      try {
        setPerfs(JSON.parse(savedPerfs));
      } catch (e) {
        console.error(e);
      }
    }
  }, [activeSessionParam]);

  // Rassemble tous les exercices uniques de toutes les séances de la base de données
  const allExercisesCatalog: ExerciseItem[] = (() => {
    const map = new Map<string, ExerciseItem>();
    sessionsDB.forEach((session) => {
      session.exercises.forEach((ex) => {
        if (!map.has(ex.name.toLowerCase())) {
          map.set(ex.name.toLowerCase(), ex);
        }
      });
    });
    return Array.from(map.values());
  })();

  const activeSession =
    sessionsDB.find((s) => s.id === selectedSessionId) || sessionsDB[0];

  const getPerf = (ex: ExerciseItem): CustomPerf => {
    return (
      perfs[ex.id] || {
        sets: ex.defaultSets,
        reps: ex.defaultReps,
        weight: ex.defaultWeight,
      }
    );
  };

  const updatePerf = (ex: ExerciseItem, field: keyof CustomPerf, val: number) => {
    const current = getPerf(ex);
    const updated = {
      ...perfs,
      [ex.id]: { ...current, [field]: Math.max(0, val) },
    };
    setPerfs(updated);
    localStorage.setItem('strix_exercise_perfs', JSON.stringify(updated));
  };

  const toggleComplete = (ex: ExerciseItem) => {
    let updated: number[];
    if (completedIds.includes(ex.id)) {
      updated = completedIds.filter((id) => id !== ex.id);
    } else {
      updated = [...completedIds, ex.id];
    }
    setCompletedIds(updated);
    localStorage.setItem('strix_completed_exercises', JSON.stringify(updated));
    window.dispatchEvent(new Event('strix-update'));
  };

  const filteredExercises = allExercisesCatalog.filter((ex) => {
    const matchesMuscle = selectedMuscle === 'all' || ex.muscle === selectedMuscle;
    const matchesSearch =
      ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ex.equipment.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesMuscle && matchesSearch;
  });

  return (
    <div className="space-y-8">
      
      {/* En-tête + Bouton d'accès direct au Questionnaire */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-violet-600">
            <span>Base de Données Centralisée ({sessionsDB.length} séances disponibles)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
            Catalogue des Séances & Exercices
          </h1>
          <p className="text-sm text-slate-500">
            Retrouve toutes les séances de la base de données ainsi que les programmes créés sur-mesure via le questionnaire.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/quiz"
            className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white font-bold px-5 py-3 rounded-2xl text-xs sm:text-sm transition shadow-lg shadow-violet-600/20"
          >
            <span>⚡ Générer une séance via le Quiz</span>
          </Link>
        </div>
      </div>

      {/* Sélecteur d'onglets : Catalogue de Séances vs Tous les Exercices */}
      <div className="flex items-center gap-2 bg-slate-200/70 p-1.5 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab('sessions')}
          className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
            activeTab === 'sessions'
              ? 'bg-slate-950 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-950'
          }`}
        >
          Catalogue des Séances ({sessionsDB.length})
        </button>
        <button
          onClick={() => setActiveTab('exercises')}
          className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
            activeTab === 'exercises'
              ? 'bg-slate-950 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Tous les Exercices ({allExercisesCatalog.length})
        </button>
      </div>

      {activeTab === 'sessions' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Colonne Gauche : Liste de toutes les séances dans la base de données */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
              Sélectionner une séance du catalogue
            </h2>
            {sessionsDB.map((session) => {
              const isSelected = activeSession?.id === session.id;
              return (
                <button
                  key={session.id}
                  onClick={() => setSelectedSessionId(session.id)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                    isSelected
                      ? 'bg-slate-950 text-white border-slate-950 shadow-md'
                      : 'bg-white text-slate-900 border-slate-200/80 hover:border-violet-400'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                        session.isCustomGenerated
                          ? 'bg-violet-600 text-white'
                          : isSelected
                          ? 'bg-white/15 text-slate-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {session.isCustomGenerated ? 'Sur-mesure Quiz' : session.level}
                    </span>
                    <span className={`text-xs font-bold ${isSelected ? 'text-violet-300' : 'text-violet-600'}`}>
                      {session.duration} min • {session.totalKcal} kcal
                    </span>
                  </div>
                  <p className="font-bold text-sm leading-snug">{session.title}</p>
                  <p className={`text-xs line-clamp-2 ${isSelected ? 'text-slate-400' : 'text-slate-500'}`}>
                    {session.subtitle}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Colonne Droite : Détail et exécution de la séance active */}
          {activeSession && (
            <div className="lg:col-span-2 space-y-5">
              <div className="bg-slate-950 text-white p-6 sm:p-8 rounded-3xl space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-violet-400">
                    {activeSession.isCustomGenerated
                      ? '★ Séance idéale générée par ton questionnaire'
                      : 'Programme Officiel Strix'}
                  </span>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-white/10 text-white">
                    {activeSession.exercises.length} exercices • {activeSession.totalKcal} kcal
                  </span>
                </div>
                <h2 className="text-2xl font-black">{activeSession.title}</h2>
                <p className="text-xs sm:text-sm text-slate-300">{activeSession.subtitle}</p>
              </div>

              {/* Liste des exercices de la séance active */}
              <div className="space-y-4">
                {activeSession.exercises.map((ex, index) => {
                  const isDone = completedIds.includes(ex.id);
                  const perf = getPerf(ex);
                  return (
                    <div
                      key={ex.id}
                      className={`bg-white p-5 sm:p-6 rounded-2xl border transition-all space-y-4 ${
                        isDone
                          ? 'border-violet-600 ring-2 ring-violet-600/10'
                          : 'border-slate-200/80 shadow-sm'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-violet-600">
                            Exercice {index + 1} • {ex.muscle} ({ex.equipment})
                          </span>
                          <h3 className="text-base sm:text-lg font-bold text-slate-950">{ex.name}</h3>
                        </div>
                        <button
                          onClick={() => toggleComplete(ex)}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
                            isDone
                              ? 'bg-violet-600 text-white'
                              : 'bg-slate-950 hover:bg-violet-600 text-white'
                          }`}
                        >
                          {isDone ? `✓ Validé (+${ex.kcal} kcal)` : 'Valider la série'}
                        </button>
                      </div>

                      <p className="text-xs text-slate-500">{ex.desc}</p>

                      <div className="grid grid-cols-3 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-slate-400">Séries</label>
                          <input
                            type="number"
                            min={1}
                            value={perf.sets}
                            onChange={(e) => updatePerf(ex, 'sets', parseInt(e.target.value, 10) || 1)}
                            className="w-full mt-1 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-black text-slate-900"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-slate-400">Répétitions</label>
                          <input
                            type="number"
                            min={1}
                            value={perf.reps}
                            onChange={(e) => updatePerf(ex, 'reps', parseInt(e.target.value, 10) || 1)}
                            className="w-full mt-1 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-black text-slate-900"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-slate-400">Charge (kg)</label>
                          <input
                            type="number"
                            min={0}
                            value={perf.weight}
                            onChange={(e) => updatePerf(ex, 'weight', parseInt(e.target.value, 10) || 0)}
                            className="w-full mt-1 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-black text-violet-600"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      ) : (
        /* Vue 2 : Bibliothèque complète de tous les exercices */
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              {['all', 'pectoraux', 'dos', 'jambes', 'epaules', 'bras', 'abdos', 'cardio'].map((m) => (
                <button
                  key={m}
                  onClick={() => setSelectedMuscle(m)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase transition cursor-pointer ${
                    selectedMuscle === m
                      ? 'bg-slate-950 text-white'
                      : 'bg-white border border-slate-200 text-slate-600'
                  }`}
                >
                  {m === 'all' ? 'Tous' : m}
                </button>
              ))}
            </div>
            <input
              type="text"
              placeholder="Rechercher un exercice ou équipement..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm min-w-[240px]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredExercises.map((ex) => {
              const isDone = completedIds.includes(ex.id);
              return (
                <div
                  key={ex.id}
                  className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between gap-4"
                >
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-bold uppercase">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700">{ex.muscle}</span>
                      <span className="text-violet-600">{ex.equipment}</span>
                    </div>
                    <h3 className="font-bold text-slate-950 text-base">{ex.name}</h3>
                    <p className="text-xs text-slate-500">{ex.desc}</p>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <span className="text-xs font-bold text-slate-700">
                      {ex.defaultSets} × {ex.defaultReps} ({ex.kcal} kcal)
                    </span>
                    <button
                      onClick={() => toggleComplete(ex)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer ${
                        isDone ? 'bg-violet-600 text-white' : 'bg-slate-100 text-slate-800 hover:bg-slate-950 hover:text-white'
                      }`}
                    >
                      {isDone ? '✓ Validé' : 'Valider'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}

export default function ExercisesPage() {
  return (
    <Suspense fallback={<div className="py-12 text-center text-sm text-slate-500">Chargement du catalogue...</div>}>
      <ExercisesContent />
    </Suspense>
  );
}
