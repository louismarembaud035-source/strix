// app/builder/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ExerciseItem,
  WorkoutSession,
  getAllWorkoutsFromDB,
  saveWorkoutToDB,
} from '@/app/data/workoutsDB';

export default function BuilderPage() {
  const router = useRouter();
  const [catalog, setCatalog] = useState<ExerciseItem[]>([]);
  
  // États du formulaire de séance
  const [title, setTitle] = useState<string>('');
  const [goal, setGoal] = useState<'hypertrophy' | 'fatloss' | 'strength'>('hypertrophy');
  const [zone, setZone] = useState<'upper' | 'lower' | 'full' | 'push' | 'pull'>('full');
  const [selectedExercises, setSelectedExercises] = useState<ExerciseItem[]>([]);

  // États du catalogue
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [muscleFilter, setMuscleFilter] = useState<string>('all');

  useEffect(() => {
    // Extraction unique de tous les exercices existants dans la base
    const allSessions = getAllWorkoutsFromDB();
    const map = new Map<string, ExerciseItem>();
    allSessions.forEach((session) => {
      session.exercises.forEach((ex) => {
        if (!map.has(ex.name.toLowerCase())) {
          map.set(ex.name.toLowerCase(), ex);
        }
      });
    });
    setCatalog(Array.from(map.values()));
  }, []);

  const handleAddExercise = (exercise: ExerciseItem) => {
    // Évite les doublons stricts (on peut améliorer en générant un ID unique si on veut le même exo 2 fois)
    if (!selectedExercises.some((ex) => ex.id === exercise.id)) {
      setSelectedExercises([...selectedExercises, { ...exercise }]);
    }
  };

  const handleRemoveExercise = (id: number) => {
    setSelectedExercises(selectedExercises.filter((ex) => ex.id !== id));
  };

  const handleUpdateExercise = (id: number, field: keyof ExerciseItem, value: number) => {
    setSelectedExercises((prev) =>
      prev.map((ex) => (ex.id === id ? { ...ex, [field]: value } : ex))
    );
  };

  const handleSaveWorkout = () => {
    if (!title.trim()) {
      alert('Veuillez donner un titre à votre séance.');
      return;
    }
    if (selectedExercises.length === 0) {
      alert('Veuillez sélectionner au moins un exercice.');
      return;
    }

    const totalKcal = selectedExercises.reduce((acc, curr) => acc + curr.kcal, 0);
    // Estimation basique : 5 min par exercice + 5 min d'échauffement
    const estimatedDuration = selectedExercises.length * 5 + 5;

    const newWorkout: WorkoutSession = {
      id: `custom-builder-${Date.now()}`,
      title: title.trim(),
      subtitle: 'Programme sur-mesure créé via le constructeur.',
      goal,
      zone,
      equipment: 'gym', // Par défaut
      level: 'Avancé',
      duration: estimatedDuration,
      style: 'classic',
      totalKcal,
      isCustomGenerated: true,
      exercises: selectedExercises,
    };

    saveWorkoutToDB(newWorkout);
    router.push('/');
  };

  const filteredCatalog = catalog.filter((ex) => {
    const matchesMuscle = muscleFilter === 'all' || ex.muscle === muscleFilter;
    const matchesSearch = ex.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesMuscle && matchesSearch;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6 py-4">
      
      {/* En-tête */}
      <div className="bg-slate-950 text-white p-6 sm:p-8 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-slate-900 shadow-xl">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-violet-400">Mode Architecte</span>
          <h1 className="text-2xl font-black mt-1">Constructeur de Séance</h1>
          <p className="text-xs text-slate-400 mt-2 max-w-md">
            Conçois ta propre routine d'entraînement. Pioche dans la base de données, ajuste les séries et enregistre le programme.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/" className="px-4 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold transition">
            Annuler ✕
          </Link>
          <button
            onClick={handleSaveWorkout}
            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-black transition shadow-lg shadow-emerald-500/20"
          >
            Sauvegarder le programme ✓
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Colonne de Gauche : Configuration & Exercices Sélectionnés */}
        <div className="lg:col-span-5 space-y-6 sticky top-24">
          
          {/* Paramètres Généraux */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2">
              Paramètres de la séance
            </h2>
            
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Nom du programme</label>
                <input
                  type="text"
                  placeholder="Ex: Push Day Élite..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-600"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Objectif</label>
                  <select
                    value={goal}
                    onChange={(e) => setGoal(e.target.value as any)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none"
                  >
                    <option value="hypertrophy">Hypertrophie</option>
                    <option value="strength">Force</option>
                    <option value="fatloss">Perte de graisse</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Ciblage</label>
                  <select
                    value={zone}
                    onChange={(e) => setZone(e.target.value as any)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none"
                  >
                    <option value="full">Full Body</option>
                    <option value="upper">Haut du corps</option>
                    <option value="lower">Bas du corps</option>
                    <option value="push">Push (Poussée)</option>
                    <option value="pull">Pull (Tirage)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Liste des Exercices Sélectionnés */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                Structure ({selectedExercises.length})
              </h2>
              <span className="text-xs font-bold text-violet-600">
                ~{selectedExercises.reduce((acc, curr) => acc + curr.kcal, 0)} kcal
              </span>
            </div>

            {selectedExercises.length === 0 ? (
              <div className="py-8 text-center border-2 border-dashed border-slate-200 rounded-2xl">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Zone vide</p>
                <p className="text-[10px] text-slate-400 mt-1">Ajoute des exercices depuis le catalogue.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                {selectedExercises.map((ex, index) => (
                  <div key={ex.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 relative group">
                    <button
                      onClick={() => handleRemoveExercise(ex.id)}
                      className="absolute top-3 right-3 w-6 h-6 rounded-md bg-white border border-slate-200 text-slate-400 hover:text-rose-500 hover:border-rose-200 flex items-center justify-center font-bold text-xs transition"
                    >
                      ✕
                    </button>
                    <div className="pr-8">
                      <span className="text-[9px] font-bold uppercase text-slate-400">{index + 1}. {ex.muscle}</span>
                      <h4 className="text-sm font-bold text-slate-900 leading-tight mt-0.5">{ex.name}</h4>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 mt-3">
                      <div className="flex items-center justify-between bg-white px-2 py-1.5 rounded-lg border border-slate-200">
                        <span className="text-[10px] font-bold uppercase text-slate-400">Séries</span>
                        <input
                          type="number"
                          min={1}
                          max={10}
                          value={ex.defaultSets}
                          onChange={(e) => handleUpdateExercise(ex.id, 'defaultSets', parseInt(e.target.value) || 1)}
                          className="w-10 text-right text-xs font-black text-slate-900 focus:outline-none"
                        />
                      </div>
                      <div className="flex items-center justify-between bg-white px-2 py-1.5 rounded-lg border border-slate-200">
                        <span className="text-[10px] font-bold uppercase text-slate-400">Reps</span>
                        <input
                          type="number"
                          min={1}
                          max={100}
                          value={ex.defaultReps}
                          onChange={(e) => handleUpdateExercise(ex.id, 'defaultReps', parseInt(e.target.value) || 1)}
                          className="w-10 text-right text-xs font-black text-slate-900 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Colonne de Droite : Catalogue d'Exercices */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row justify-between gap-4 border-b border-slate-100 pb-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 shrink-0">
              Base de Données
            </h2>
            <div className="flex-1 w-full relative">
              <input
                type="text"
                placeholder="Rechercher un mouvement..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-violet-400"
              />
              <svg className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {['all', 'pectoraux', 'dos', 'jambes', 'epaules', 'bras', 'abdos', 'cardio'].map((m) => (
              <button
                key={m}
                onClick={() => setMuscleFilter(m)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition ${
                  muscleFilter === m
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
              >
                {m === 'all' ? 'Tous' : m}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[65vh] overflow-y-auto pr-2 custom-scrollbar">
            {filteredCatalog.map((ex) => {
              const isSelected = selectedExercises.some((e) => e.id === ex.id);
              return (
                <div
                  key={ex.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between h-full gap-3 ${
                    isSelected
                      ? 'bg-violet-50/50 border-violet-200 opacity-50'
                      : 'bg-white border-slate-200 hover:border-violet-400 hover:shadow-md'
                  }`}
                >
                  <div>
                    <span className="text-[9px] font-bold uppercase text-slate-400 px-2 py-0.5 rounded bg-slate-100 mb-2 inline-block">
                      {ex.muscle}
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm leading-snug">{ex.name}</h3>
                    <p className="text-[10px] text-slate-500 mt-1 line-clamp-2">{ex.desc}</p>
                  </div>
                  
                  <button
                    disabled={isSelected}
                    onClick={() => handleAddExercise(ex)}
                    className={`w-full py-2 rounded-xl text-xs font-bold transition ${
                      isSelected
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : 'bg-slate-950 text-white hover:bg-violet-600'
                    }`}
                  >
                    {isSelected ? 'Déjà ajouté ✓' : 'Ajouter +'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
