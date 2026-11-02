'use client';

import { useState, useEffect } from 'react';

interface Exercise {
  id: number;
  name: string;
  muscle: string;
  equipment: string;
  level: 'Débutant' | 'Intermédiaire' | 'Avancé';
  defaultSets: number;
  defaultReps: number;
  defaultWeight: number;
  kcal: number;
  desc: string;
}

interface CustomPerf {
  sets: number;
  reps: number;
  weight: number;
}

interface WorkoutLog {
  id: string;
  date: string;
  exercisesCount: number;
  totalKcal: number;
  totalVolumeKg: number;
}

const defaultExercises: Exercise[] = [
  {
    id: 1,
    name: 'Développé couché haltères',
    muscle: 'pectoraux',
    equipment: 'Haltères & Banc',
    level: 'Intermédiaire',
    defaultSets: 4,
    defaultReps: 10,
    defaultWeight: 26,
    kcal: 140,
    desc: 'Amplitude complète et recrutement symétrique des fibres pectorales et des deltoïdes antérieurs.',
  },
  {
    id: 2,
    name: 'Back Squat barre libre',
    muscle: 'jambes',
    equipment: 'Barre olympique',
    level: 'Avancé',
    defaultSets: 4,
    defaultReps: 8,
    defaultWeight: 80,
    kcal: 210,
    desc: 'Exercice roi polyarticulaire ciblant les quadriceps, la chaîne postérieure et le gainage profond.',
  },
  {
    id: 3,
    name: 'Tractions pronation strictes',
    muscle: 'dos',
    equipment: 'Barre de traction',
    level: 'Intermédiaire',
    defaultSets: 4,
    defaultReps: 10,
    defaultWeight: 0,
    kcal: 160,
    desc: 'Développe la largeur du grand dorsal, les trapèzes inférieurs et la force de préhension.',
  },
  {
    id: 4,
    name: 'Dips lestés ou poids du corps',
    muscle: 'pectoraux',
    equipment: 'Barres parallèles',
    level: 'Intermédiaire',
    defaultSets: 4,
    defaultReps: 12,
    defaultWeight: 10,
    kcal: 150,
    desc: 'Recrutement haute intensité de la portion inférieure des pectoraux et des faisceaux du triceps.',
  },
  {
    id: 5,
    name: 'Fentes bulgares unilatérales',
    muscle: 'jambes',
    equipment: 'Haltères',
    level: 'Intermédiaire',
    defaultSets: 3,
    defaultReps: 12,
    defaultWeight: 18,
    kcal: 180,
    desc: 'Corrige les asymétries musculaires tout en maximisant la tension mécanique sur les fessiers.',
  },
  {
    id: 6,
    name: 'Gainage dynamique & Crunchs',
    muscle: 'abdos',
    equipment: 'Poids du corps',
    level: 'Débutant',
    defaultSets: 4,
    defaultReps: 20,
    defaultWeight: 0,
    kcal: 110,
    desc: 'Renforce le transverse et le grand droit pour stabiliser la colonne vertébrale.',
  },
  {
    id: 7,
    name: 'Rowing buste penché',
    muscle: 'dos',
    equipment: 'Barre ou Haltères',
    level: 'Intermédiaire',
    defaultSets: 4,
    defaultReps: 10,
    defaultWeight: 60,
    kcal: 155,
    desc: 'Cible l’épaisseur du dos, les rhomboïdes et les deltoïdes postérieurs pour une posture athlétique.',
  },
  {
    id: 8,
    name: 'Pompes explosives Plyo',
    muscle: 'pectoraux',
    equipment: 'Poids du corps',
    level: 'Avancé',
    defaultSets: 4,
    defaultReps: 15,
    defaultWeight: 0,
    kcal: 135,
    desc: 'Stimule les fibres musculaires rapides pour développer l’explosivité et l’endurance de force.',
  },
];

export default function ExercisesPage() {
  const [exercises, setExercises] = useState<Exercise[]>(defaultExercises);
  const [selectedMuscle, setSelectedMuscle] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [completedIds, setCompletedIds] = useState<number[]>([]);
  const [perfs, setPerfs] = useState<Record<number, CustomPerf>>({});
  const [workoutHistory, setWorkoutHistory] = useState<WorkoutLog[]>([]);

  // Formulaire de création d'exercice personnalisé
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [newName, setNewName] = useState<string>('');
  const [newMuscle, setNewMuscle] = useState<string>('pectoraux');
  const [newEquipment, setNewEquipment] = useState<string>('Haltères');
  const [newLevel, setNewLevel] = useState<Exercise['level']>('Intermédiaire');
  const [newWeight, setNewWeight] = useState<string>('20');
  const [newKcal, setNewKcal] = useState<string>('140');
  const [newDesc, setNewDesc] = useState<string>('');

  const getCurrentDayIndex = () => {
    const day = new Date().getDay();
    return day === 0 ? 6 : day - 1;
  };

  useEffect(() => {
    const savedCustomEx = localStorage.getItem('strix_custom_exercises');
    if (savedCustomEx) {
      try {
        setExercises([...defaultExercises, ...JSON.parse(savedCustomEx)]);
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

    const savedPerfs = localStorage.getItem('strix_exercise_perfs');
    if (savedPerfs) {
      try {
        setPerfs(JSON.parse(savedPerfs));
      } catch (e) {
        console.error(e);
      }
    }

    const savedHistory = localStorage.getItem('strix_workout_history');
    if (savedHistory) {
      try {
        setWorkoutHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const getPerf = (ex: Exercise): CustomPerf => {
    return (
      perfs[ex.id] || {
        sets: ex.defaultSets,
        reps: ex.defaultReps,
        weight: ex.defaultWeight,
      }
    );
  };

  const updatePerf = (ex: Exercise, field: keyof CustomPerf, val: number) => {
    const current = getPerf(ex);
    const updated = {
      ...perfs,
      [ex.id]: { ...current, [field]: Math.max(0, val) },
    };
    setPerfs(updated);
    localStorage.setItem('strix_exercise_perfs', JSON.stringify(updated));
  };

  const toggleComplete = (ex: Exercise) => {
    let updated: number[];
    let deltaKcal = 0;

    if (completedIds.includes(ex.id)) {
      updated = completedIds.filter((item) => item !== ex.id);
      deltaKcal = -ex.kcal;
    } else {
      updated = [...completedIds, ex.id];
      deltaKcal = ex.kcal;
    }

    setCompletedIds(updated);
    localStorage.setItem('strix_completed_exercises', JSON.stringify(updated));

    // Synchroniser les calories brûlées sur l'histogramme de la semaine
    const savedWeekly = localStorage.getItem('strix_weekly_kcal');
    const weekly: number[] = savedWeekly ? JSON.parse(savedWeekly) : [320, 480, 0, 410, 390, 0, 0];
    const todayIdx = getCurrentDayIndex();
    weekly[todayIdx] = Math.max(0, (weekly[todayIdx] || 0) + deltaKcal);
    localStorage.setItem('strix_weekly_kcal', JSON.stringify(weekly));

    window.dispatchEvent(new Event('strix-update'));
  };

  const handleCreateExercise = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const customEx: Exercise = {
      id: Date.now(),
      name: newName.trim(),
      muscle: newMuscle,
      equipment: newEquipment.trim() || 'Poids libre',
      level: newLevel,
      defaultSets: 4,
      defaultReps: 10,
      defaultWeight: parseInt(newWeight, 10) || 0,
      kcal: parseInt(newKcal, 10) || 130,
      desc: newDesc.trim() || 'Exercice personnalisé ajouté à ton catalogue Strix.',
    };

    const savedCustom = localStorage.getItem('strix_custom_exercises');
    const customList: Exercise[] = savedCustom ? JSON.parse(savedCustom) : [];
    const updatedCustom = [customEx, ...customList];

    localStorage.setItem('strix_custom_exercises', JSON.stringify(updatedCustom));
    setExercises([customEx, ...exercises]);
    setNewName('');
    setNewDesc('');
    setShowAddForm(false);
  };

  const finishWorkoutSession = () => {
    if (completedIds.length === 0) return;

    const completedExList = exercises.filter((ex) => completedIds.includes(ex.id));
    const totalKcal = completedExList.reduce((acc, ex) => acc + ex.kcal, 0);
    const totalVolumeKg = completedExList.reduce((acc, ex) => {
      const p = getPerf(ex);
      const effectiveWeight = p.weight > 0 ? p.weight : 25;
      return acc + p.sets * p.reps * effectiveWeight;
    }, 0);

    const newLog: WorkoutLog = {
      id: String(Date.now()),
      date: new Date().toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      }),
      exercisesCount: completedIds.length,
      totalKcal,
      totalVolumeKg,
    };

    const updatedHistory = [newLog, ...workoutHistory];
    setWorkoutHistory(updatedHistory);
    localStorage.setItem('strix_workout_history', JSON.stringify(updatedHistory));

    // Réinitialiser la sélection active pour la prochaine séance
    setCompletedIds([]);
    localStorage.setItem('strix_completed_exercises', JSON.stringify([]));
    window.dispatchEvent(new Event('strix-update'));
  };

  const muscles = [
    { id: 'all', label: 'Tous les groupes' },
    { id: 'pectoraux', label: 'Pectoraux' },
    { id: 'dos', label: 'Dos' },
    { id: 'jambes', label: 'Jambes' },
    { id: 'abdos', label: 'Abdominaux' },
  ];

  const filteredExercises = exercises.filter((ex) => {
    const matchesMuscle = selectedMuscle === 'all' || ex.muscle === selectedMuscle;
    const matchesSearch =
      ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ex.equipment.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesMuscle && matchesSearch;
  });

  const totalBurned = exercises
    .filter((ex) => completedIds.includes(ex.id))
    .reduce((acc, ex) => acc + ex.kcal, 0);

  const getLevelBadge = (level: Exercise['level']) => {
    switch (level) {
      case 'Débutant':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200/60';
      case 'Intermédiaire':
        return 'bg-violet-50 text-violet-700 border-violet-200/60';
      case 'Avancé':
        return 'bg-rose-50 text-rose-700 border-rose-200/60';
    }
  };

  return (
    <div className="space-y-8">
      
      {/* En-tête + Compteur de séance en direct */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-violet-600">
            <span>Bibliothèque biomécanique interactive</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
            Catalogue d&apos;Exercices & Suivi des Charges
          </h1>
          <p className="text-sm text-slate-500">
            Ajuste tes séries, répétitions et poids (kg) en direct, puis enregistre ta séance pour mettre à jour ton bilan.
          </p>
        </div>

        {/* Panneau Séance Active */}
        <div className="flex flex-wrap items-center gap-5 bg-slate-950 text-white p-5 rounded-2xl">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Validés</p>
            <p className="text-2xl font-black text-white mt-0.5">
              {completedIds.length} <span className="text-xs font-normal text-slate-400">/ {exercises.length}</span>
            </p>
          </div>
          <div className="h-8 w-px bg-white/15" />
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Dépense</p>
            <p className="text-2xl font-black text-violet-400 mt-0.5">
              {totalBurned} <span className="text-xs font-semibold">kcal</span>
            </p>
          </div>
          {completedIds.length > 0 && (
            <button
              onClick={finishWorkoutSession}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl transition cursor-pointer shadow-lg shadow-emerald-500/20"
            >
              Terminer la séance ✓
            </button>
          )}
        </div>
      </div>

      {/* Barre de Filtres, Recherche & Bouton Créer un Exercice */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
        <div className="flex flex-wrap gap-2">
          {muscles.map((m) => (
            <button
              key={m.id}
              onClick={() => setSelectedMuscle(m.id)}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
                selectedMuscle === m.id
                  ? 'bg-slate-950 text-white shadow-sm'
                  : 'bg-white border border-slate-200/80 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-grow min-w-[220px]">
            <svg
              className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Rechercher un exercice..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200/80 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-600"
            />
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold rounded-xl transition shrink-0 cursor-pointer"
          >
            {showAddForm ? 'Fermer' : '+ Créer un exercice'}
          </button>
        </div>
      </div>

      {/* Formulaire d'ajout d'exercice personnalisé */}
      {showAddForm && (
        <form
          onSubmit={handleCreateExercise}
          className="bg-white p-6 rounded-2xl border border-violet-200 shadow-sm space-y-4"
        >
          <h3 className="text-sm font
