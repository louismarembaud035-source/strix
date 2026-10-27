// app/exercises/page.tsx
'use client';

import { useState } from 'react';

const exercisesData = [
  { id: 1, name: "Pompes classiques", muscle: "pectoraux", equipment: "Poids du corps", desc: "Idéal pour renforcer les pectoraux, les épaules et les triceps." },
  { id: 2, name: "Squats", muscle: "jambes", equipment: "Poids du corps", desc: "Le mouvement de base pour forger des cuisses et des fessiers solides." },
  { id: 3, name: "Crunchs abdominaux", muscle: "abdos", equipment: "Poids du corps", desc: "Exercice classique pour cibler la sangle abdominale." },
  { id: 4, name: "Tractions", muscle: "dos", equipment: "Barre de traction", desc: "Excellent pour le dos (grand dorsal) et les biceps." },
  { id: 5, name: "Dips", muscle: "pectoraux", equipment: "Barres parallèles", desc: "Sollicite intensément les triceps et la partie basse des pectoraux." },
  { id: 6, name: "Fentes avant", muscle: "jambes", equipment: "Poids du corps", desc: "Parfait pour travailler l'équilibre et chaque jambe indépendamment." }
];

export default function ExercisesPage() {
  const [selectedMuscle, setSelectedMuscle] = useState<string>('all');

  const filteredExercises = selectedMuscle === 'all' 
    ? exercisesData 
    : exercisesData.filter(ex => ex.muscle === selectedMuscle);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Catalogue d'Exercices</h2>
        
        <div className="flex flex-wrap gap-2">
          {['all', 'abdos', 'jambes', 'pectoraux', 'dos'].map((muscle) => (
            <button
              key={muscle}
              onClick={() => setSelectedMuscle(muscle)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-full transition cursor-pointer uppercase tracking-wide ${
                selectedMuscle === muscle 
                  ? 'bg-violet-600 text-white shadow-sm' 
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {muscle}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filteredExercises.map((ex) => (
          <div key={ex.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80 flex flex-col justify-between hover:shadow-md transition">
            <div>
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-slate-800 text-lg">{ex.name}</h3>
                <span className="text-[10px] bg-violet-50 text-violet-600 font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">{ex.muscle}</span>
              </div>
              <p className="text-sm text-slate-500 mb-4">{ex.desc}</p>
            </div>
            <div className="text-xs text-slate-400 font-medium flex items-center gap-1">
              🛠️ Matériel : <span className="text-slate-600">{ex.equipment}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
