'use client';

import React, { useState } from 'react';

// --- DONNÉES DU CATALOGUE D'EXERCICES ---
const exercisesData = [
  { id: 1, name: "Pompes classiques", muscle: "pectoraux", equipment: "Poids du corps", desc: "Idéal pour renforcer les pectoraux, les épaules et les triceps." },
  { id: 2, name: "Squats", muscle: "jambes", equipment: "Poids du corps", desc: "Le mouvement de base pour forger des cuisses et des fessiers solides." },
  { id: 3, name: "Crunchs abdominaux", muscle: "abdos", equipment: "Poids du corps", desc: "Exercice classique pour cibler la sangle abdominale." },
  { id: 4, name: "Tractions", muscle: "dos", equipment: "Barre de traction", desc: "Excellent pour le dos (grand dorsal) et les biceps." },
  { id: 5, name: "Dips", muscle: "pectoraux", equipment: "Barres parallèles", desc: "Sollicite intensément les triceps et la partie basse des pectoraux." },
  { id: 6, name: "Fentes avant", muscle: "jambes", equipment: "Poids du corps", desc: "Parfait pour travailler l'équilibre et chaque jambe indépendamment." }
];

export default function Home() {
  // États de l'application
  const [activeTab, setActiveTab] = useState<'exercises' | 'nutrition'>('exercises');
  const [selectedMuscle, setSelectedMuscle] = useState<string>('all');
  
  // États pour la nutrition
  const [meals, setMeals] = useState<Array<{ name: string; calories: number; proteins: number; carbs: number; fats: number }>>([]);
  const [foodName, setFoodName] = useState('');
  const [foodCalories, setFoodCalories] = useState('');
  const [foodProteins, setFoodProteins] = useState('');

  // Filtrage des exercices
  const filteredExercises = selectedMuscle === 'all' 
    ? exercisesData 
    : exercisesData.filter(ex => ex.muscle === selectedMuscle);

  // Ajout d'un repas
  const handleAddMeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!foodName || !foodCalories) return;

    const cal = parseInt(foodCalories) || 0;
    const pro = parseInt(foodProteins) || 0;
    const carbs = Math.round((cal * 0.4) / 4);
    const fats = Math.round((cal * 0.3) / 9);

    setMeals([...meals, { name: foodName, calories: cal, proteins: pro, carbs, fats }]);
    setFoodName('');
    setFoodCalories('');
    setFoodProteins('');
  };

  const removeMeal = (index: number) => {
    setMeals(meals.filter((_, i) => i !== index));
  };

  // Calculs nutritionnels
  const totalCal = meals.reduce((acc, m) => acc + m.calories, 0);
  const totalPro = meals.reduce((acc, m) => acc + m.proteins, 0);
  const totalCarb = meals.reduce((acc, m) => acc + m.carbs, 0);
  const totalFat = meals.reduce((acc, m) => acc + m.fats, 0);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      
      {/* En-tête de l'application */}
      <header className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg py-4 px-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-black tracking-wider">⚡ STRIX</span>
          <span className="text-xs bg-white/20 text-white font-medium px-2 py-0.5 rounded-full">V1 Socle</span>
        </div>
        <p className="text-sm text-violet-100 hidden sm:block">Performance & Nutrition</p>
      </header>

      {/* Barre de navigation par onglets */}
      <nav className="bg-white border-b border-slate-200 shadow-sm flex justify-center space-x-12 py-3 sticky top-0 z-10">
        <button 
          onClick={() => setActiveTab('exercises')} 
          className={`font-semibold pb-1 transition cursor-pointer ${activeTab === 'exercises' ? 'text-violet-600 border-b-2 border-violet-600' : 'text-slate-400 hover:text-slate-600'}`}
        >
          🏋️‍♂️ Catalogue d'exercices
        </button>
        <button 
          onClick={() => setActiveTab('nutrition')} 
          className={`font-semibold pb-1 transition cursor-pointer ${activeTab === 'nutrition' ? 'text-violet-600 border-b-2 border-violet-600' : 'text-slate-400 hover:text-slate-600'}`}
        >
          🍎 Bilan Nutritionnel
        </button>
      </nav>

      {/* Contenu Principal */}
      <main className="flex-grow max-w-4xl w-full mx-auto p-4 sm:p-6">

        {/* ONGLET 1 : EXERCICES */}
        {activeTab === 'exercises' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">Catalogue d'Exercices</h2>
              
              {/* Filtres par muscle */}
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

            {/* Grille des exercices */}
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
        )}

        {/* ONGLET 2 : NUTRITION */}
        {activeTab === 'nutrition' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Bilan Nutritionnel du Jour</h2>

            {/* Tableau de bord des totaux */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200/80 text-center">
                <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Calories</p>
                <p className="text-3xl font-black text-violet-600 mt-1">{totalCal}</p>
                <span className="text-xs text-slate-400">kcal</span>
              </div>
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200/80 text-center">
                <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Protéines</p>
                <p className="text-3xl font-black text-emerald-600 mt-1">{totalPro}g</p>
              </div>
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200/80 text-center">
                <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Glucides</p>
                <p className="text-3xl font-black text-amber-500 mt-1">{totalCarb}g</p>
              </div>
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200/80 text-center">
                <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Lipides</p>
                <p className="text-3xl font-black text-rose-500 mt-1">{totalFat}g</p>
              </div>
            </div>

            {/* Formulaire d'ajout */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80 space-y-4">
              <h3 className="font-bold text-slate-800">Ajouter un aliment</h3>
              <form onSubmit={handleAddMeal} className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                <input 
                  type="text" 
                  placeholder="Ex: Poulet / Riz" 
                  value={foodName} 
                  onChange={(e) => setFoodName(e.target.value)}
                  required 
                  className="sm:col-span-2 px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 bg-slate-50"
                />
                <input 
                  type="number" 
                  placeholder="Calories (kcal)" 
                  value={foodCalories} 
                  onChange={(e) => setFoodCalories(e.target.value)}
                  required 
                  className="px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 bg-slate-50"
                />
                <input 
                  type="number" 
                  placeholder="Protéines (g)" 
                  value={foodProteins} 
                  onChange={(e) => setFoodProteins(e.target.value)}
                  required 
                  className="px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 bg-slate-50"
                />
                <button 
                  type="submit" 
                  className="bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl text-sm py-2.5 transition shadow-sm cursor-pointer"
                >
                  Ajouter
                </button>
              </form>
            </div>

            {/* Historique */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80 space-y-4">
              <h3 className="font-bold text-slate-800">Historique de la journée</h3>
              <div className="divide-y divide-slate-100">
                {meals.length === 0 ? (
                  <p className="text-slate-400 text-sm italic text-center py-6">Aucun aliment enregistré pour l'instant.</p>
                ) : (
                  meals.map((meal, index) => (
                    <div key={index} className="flex justify-between items-center py-3.5 text-sm">
                      <div>
                        <span className="font-semibold text-slate-800">{meal.name}</span>
                        <span className="text-xs text-slate-400 ml-2 font-medium">({meal.proteins}g prot)</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-bold text-violet-600">{meal.calories} kcal</span>
                        <button onClick={() => removeMeal(index)} className="text-slate-300 hover:text-rose-500 text-xs font-bold cursor-pointer">✕</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        )}

      </main>

      {/* Pied de page */}
      <footer className="text-center py-6 text-xs text-slate-400 border-t border-slate-200 mt-auto">
        Strix V1 — Propulsé par Next.js & Tailwind CSS
      </footer>

    </div>
  );
}
