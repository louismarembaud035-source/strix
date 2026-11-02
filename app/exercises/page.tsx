'use client';

import { useState } from 'react';

interface Exercise {
  id: number;
  name: string;
  muscle: string;
  equipment: string;
  level: 'Débutant' | 'Intermédiaire' | 'Avancé';
  sets: string;
  kcal: number;
  desc: string;
}

const exercisesData: Exercise[] = [
  {
    id: 1,
    name: 'Développé couché haltères',
    muscle: 'pectoraux',
    equipment: 'Haltères & Banc',
    level: 'Intermédiaire',
    sets: '4 séries × 10 reps',
    kcal: 140,
    desc: 'Permet une amplitude complète et un recrutement symétrique des fibres pectorales et des deltoïdes antérieurs.',
  },
  {
    id: 2,
    name: 'Back Squat barre libre',
    muscle: 'jambes',
    equipment: 'Barre olympique',
    level: 'Avancé',
    sets: '4 séries × 8 reps',
    kcal: 210,
    desc: 'Exercice roi polyarticulaire ciblant les quadriceps, la chaîne postérieure et le gainage profond.',
  },
  {
    id: 3,
    name: 'Tractions pronation strictes',
    muscle: 'dos',
    equipment: 'Barre de traction',
    level: 'Intermédiaire',
    sets: '4 séries × Max',
    kcal: 160,
    desc: 'Développe la largeur du grand dorsal, les trapèzes inférieurs et la force de préhension.',
  },
  {
    id: 4,
    name: 'Dips lestés ou poids du corps',
    muscle: 'pectoraux',
    equipment: 'Barres parallèles',
    level: 'Intermédiaire',
    sets: '4 séries × 12 reps',
    kcal: 150,
    desc: 'Recrutement haute intensité de la portion inférieure des pectoraux et des faisceaux du triceps.',
  },
  {
    id: 5,
    name: 'Fentes bulgares unilatérales',
    muscle: 'jambes',
    equipment: 'Haltères',
    level: 'Intermédiaire',
    sets: '3 séries × 12 reps / jambe',
    kcal: 180,
    desc: 'Corrige les asymétries musculaires tout en maximisant la tension mécanique sur les fessiers et quadriceps.',
  },
  {
    id: 6,
    name: 'Gainage dynamique & Crunchs',
    muscle: 'abdos',
    equipment: 'Poids du corps',
    level: 'Débutant',
    sets: '4 séries × 45 sec',
    kcal: 110,
    desc: 'Renforce le transverse et le grand droit pour stabiliser la colonne vertébrale sur tous les mouvements lourds.',
  },
  {
    id: 7,
    name: 'Rowing buste penché',
    muscle: 'dos',
    equipment: 'Barre ou Haltères',
    level: 'Intermédiaire',
    sets: '4 séries × 10 reps',
    kcal: 155,
    desc: 'Cible l’épaisseur du dos, les rhomboïdes et les deltoïdes postérieurs pour une posture athlétique.',
  },
  {
    id: 8,
    name: 'Pompes explosives Plyo',
    muscle: 'pectoraux',
    equipment: 'Poids du corps',
    level: 'Avancé',
    sets: '4 séries × 15 reps',
    kcal: 135,
    desc: 'Stimule les fibres musculaires rapides pour développer l’explosivité et l’endurance de force.',
  },
];

export default function ExercisesPage() {
  const [selectedMuscle, setSelectedMuscle] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [completedIds, setCompletedIds] = useState<number[]>([]);

  const muscles = [
    { id: 'all', label: 'Tous les groupes' },
    { id: 'pectoraux', label: 'Pectoraux' },
    { id: 'dos', label: 'Dos' },
    { id: 'jambes', label: 'Jambes' },
    { id: 'abdos', label: 'Abdominaux' },
  ];

  const filteredExercises = exercisesData.filter((ex) => {
    const matchesMuscle = selectedMuscle === 'all' || ex.muscle === selectedMuscle;
    const matchesSearch =
      ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ex.equipment.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesMuscle && matchesSearch;
  });

  const toggleComplete = (id: number) => {
    if (completedIds.includes(id)) {
      setCompletedIds(completedIds.filter((item) => item !== id));
    } else {
      setCompletedIds([...completedIds, id]);
    }
  };

  const totalBurned = exercisesData
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
      
      {/* En-tête + Résumé de séance active */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-violet-600">
            <span>Bibliothèque biomécanique</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
            Catalogue d'Exercices & Séance
          </h1>
          <p className="text-sm text-slate-500">
            Sélectionne tes mouvements et valide-les en direct pour calculer ta dépense énergétique.
          </p>
        </div>

        {/* Compteur de séance en direct */}
        <div className="flex items-center gap-6 bg-slate-950 text-white px-6 py-4 rounded-2xl">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Exercices validés</p>
            <p className="text-2xl font-black text-white mt-0.5">
              {completedIds.length} <span className="text-xs font-normal text-slate-400">/ {exercisesData.length}</span>
            </p>
          </div>
          <div className="h-8 w-px bg-white/15" />
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Dépense estimée</p>
            <p className="text-2xl font-black text-violet-400 mt-0.5">{totalBurned} <span className="text-xs font-semibold">kcal</span></p>
          </div>
        </div>
      </div>

      {/* Barre de Recherche & Filtres */}
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

        <div className="relative min-w-[260px]">
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
            placeholder="Rechercher un exercice ou matériel..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200/80 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-600"
          />
        </div>
      </div>

      {/* Grille des Exercices */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredExercises.map((ex) => {
          const isDone = completedIds.includes(ex.id);
          return (
            <div
              key={ex.id}
              className={`group bg-white p-6 rounded-2xl border transition-all flex flex-col justify-between gap-5 ${
                isDone
                  ? 'border-violet-600 ring-2 ring-violet-600/10 bg-violet-50/10'
                  : 'border-slate-200/80 hover:border-slate-300 shadow-sm hover:shadow-md'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md bg-slate-100 text-slate-700">
                    {ex.muscle}
                  </span>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md border ${getLevelBadge(ex.level)}`}>
                    {ex.level}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-950 group-hover:text-violet-600 transition-colors">
                  {ex.name}
                </h3>

                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">{ex.desc}</p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
                  <span className="flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    {ex.equipment}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="font-bold text-slate-700">{ex.sets}</span>
                </div>

                <button
                  onClick={() => toggleComplete(ex.id)}
                  className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                    isDone
                      ? 'bg-violet-600 text-white shadow-sm'
                      : 'bg-slate-100 hover:bg-slate-950 text-slate-700 hover:text-white'
                  }`}
                >
                  {isDone ? (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Validé (+{ex.kcal} kcal)</span>
                    </>
                  ) : (
                    <span>Valider la série</span>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
