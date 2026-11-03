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

function ExercisesContent() {
  const searchParams = useSearchParams();
  const activeSessionParam = searchParams.get('session');

  const [sessionsDB, setSessionsDB] = useState<WorkoutSession[]>(defaultWorkoutsDB);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'sessions' | 'exercises'>('sessions');

  const [selectedMuscle, setSelectedMuscle] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    const allSessions = getAllWorkoutsFromDB();
    setSessionsDB(allSessions);

    if (activeSessionParam) {
      setSelectedSessionId(activeSessionParam);
      setActiveTab('sessions');
    } else if (allSessions.length > 0 && !selectedSessionId) {
      setSelectedSessionId(allSessions[0].id);
    }
  }, [activeSessionParam]);

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

  const filteredExercises = allExercisesCatalog.filter((ex) => {
    const matchesMuscle = selectedMuscle === 'all' || ex.muscle === selectedMuscle;
    const matchesSearch =
      ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ex.equipment.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesMuscle && matchesSearch;
  });

  return (
    <div className="space-y-8">
      
      {/* En-tête Catalogue */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-violet-600">
            <span>Bibliothèque Athlétique ({sessionsDB.length} séances • {allExercisesCatalog.length} exercices)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
            Catalogue & Programmes
          </h1>
          <p className="text-sm text-slate-500">
            Consulte les mouvements ou lance un entraînement complet directement dans le Player live.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/quiz"
            className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white font-bold px-5 py-3 rounded-2xl text-xs sm:text-sm transition shadow-lg shadow-violet-600/20"
          >
            <span>⚡ Générer via le Quiz</span>
          </Link>
        </div>
      </div>

      {/* Onglets Catalogue */}
      <div className="flex items-center gap-2 bg-slate-200/70 p-1.5 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab('sessions')}
          className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
            activeTab === 'sessions'
              ? 'bg-slate-950 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-950'
          }`}
        >
          Séances complètes ({sessionsDB.length})
        </button>
        <button
          onClick={() => setActiveTab('exercises')}
          className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
            activeTab === 'exercises'
              ? 'bg-slate-950 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Exercices unitaires ({allExercisesCatalog.length})
        </button>
      </div>

      {activeTab === 'sessions' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Liste des séances à gauche */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
              Choisir un programme
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

          {/* Fiche détaillée de la séance à droite */}
          {activeSession && (
            <div className="lg:col-span-2 space-y-5">
              <div className="bg-slate-950 text-white p-6 sm:p-8 rounded-3xl space-y-4 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-violet-400">
                    {activeSession.isCustomGenerated ? 'Programme Sur-Mesure' : 'Programme Officiel Strix'}
                  </span>
                  <h2 className="text-2xl font-black mt-1">{activeSession.title}</h2>
                  <p className="text-xs sm:text-sm text-slate-300 mt-2">{activeSession.subtitle}</p>
                </div>

                <div className="pt-2 flex flex-wrap items-center justify-between gap-4 border-t border-white/10">
                  <span className="text-xs font-medium text-slate-400">
                    {activeSession.exercises.length} exercices • {activeSession.duration} min • {activeSession.totalKcal} kcal
                  </span>
                  <Link
                    href={`/workout?session=${activeSession.id}`}
                    className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-5 py-2.5 rounded-xl text-xs sm:text-sm transition shadow-lg shadow-emerald-500/20"
                  >
                    <span>Démarrer l'entraînement en direct ▶</span>
                  </Link>
                </div>
              </div>

              {/* Aperçu des mouvements de la séance */}
              <div className="space-y-3">
                {activeSession.exercises.map((ex, index) => (
                  <div key={ex.id} className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between gap-4">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-400">
                        Exercice {index + 1} • {ex.muscle}
                      </span>
                      <h3 className="text-sm sm:text-base font-bold text-slate-950">{ex.name}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">{ex.equipment}</p>
                    </div>
                    <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 shrink-0">
                      {ex.defaultSets} × {ex.defaultReps}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      ) : (
        /* Vue bibliothèque complète avec filtres */
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
              placeholder="Rechercher un exercice..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm min-w-[240px]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredExercises.map((ex) => (
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
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs font-bold text-slate-700">
                  <span>Conseil : {ex.defaultSets} × {ex.defaultReps}</span>
                  <span className="text-violet-600">~{ex.kcal} kcal</span>
                </div>
              </div>
            ))}
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
