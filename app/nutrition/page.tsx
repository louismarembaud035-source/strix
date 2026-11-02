'use client';

import { useState, useEffect } from 'react';

interface Meal {
  name: string;
  calories: number;
  proteins: number;
  carbs: number;
  fats: number;
  time: string;
}

const quickPresets = [
  { name: 'Blanc de poulet (150g)', calories: 248, proteins: 46, carbs: 0, fats: 5 },
  { name: 'Shaker Whey Isolat', calories: 120, proteins: 25, carbs: 2, fats: 1 },
  { name: 'Flocons d’avoine (80g)', calories: 300, proteins: 11, carbs: 54, fats: 5 },
  { name: 'Riz basmati cuit (200g)', calories: 260, proteins: 6, carbs: 56, fats: 1 },
  { name: '2 Oeufs entiers Bio', calories: 155, proteins: 13, carbs: 1, fats: 11 },
];

export default function NutritionPage() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [foodName, setFoodName] = useState('');
  const [foodCalories, setFoodCalories] = useState('');
  const [foodProteins, setFoodProteins] = useState('');
  const [foodCarbs, setFoodCarbs] = useState('');
  const [foodFats, setFoodFats] = useState('');

  // Objectifs journaliers de référence
  const goals = {
    calories: 2400,
    proteins: 160,
    carbs: 260,
    fats: 75,
  };

  useEffect(() => {
    const savedMeals = localStorage.getItem('strix_meals');
    if (savedMeals) {
      try {
        setMeals(JSON.parse(savedMeals));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('strix_meals', JSON.stringify(meals));
  }, [meals]);

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  const handleAddMeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!foodName || !foodCalories) return;

    const cal = parseInt(foodCalories) || 0;
    const pro = parseInt(foodProteins) || 0;
    const carbs = foodCarbs ? parseInt(foodCarbs) : Math.round((cal * 0.4) / 4);
    const fats = foodFats ? parseInt(foodFats) : Math.round((cal * 0.3) / 9);

    setMeals([
      { name: foodName, calories: cal, proteins: pro, carbs, fats, time: getCurrentTime() },
      ...meals,
    ]);
    setFoodName('');
    setFoodCalories('');
    setFoodProteins('');
    setFoodCarbs('');
    setFoodFats('');
  };

  const addPreset = (preset: Omit<Meal, 'time'>) => {
    setMeals([{ ...preset, time: getCurrentTime() }, ...meals]);
  };

  const removeMeal = (index: number) => {
    setMeals(meals.filter((_, i) => i !== index));
  };

  const totalCal = meals.reduce((acc, m) => acc + m.calories, 0);
  const totalPro = meals.reduce((acc, m) => acc + m.proteins, 0);
  const totalCarb = meals.reduce((acc, m) => acc + m.carbs, 0);
  const totalFat = meals.reduce((acc, m) => acc + m.fats, 0);

  const getPct = (val: number, goal: number) => Math.min(100, Math.round((val / goal) * 100));

  return (
    <div className="space-y-8">
      
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-violet-600">Biométrie & Macronutriments</span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight mt-1">
            Architecture Nutritionnelle
          </h1>
        </div>
        {meals.length > 0 && (
          <button
            onClick={() => setMeals([])}
            className="text-xs font-semibold text-slate-400 hover:text-rose-600 transition self-start sm:self-auto cursor-pointer"
          >
            Réinitialiser la journée
          </button>
        )}
      </div>

      {/* Cartes de Progression des Macros */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Calories */}
        <div className="bg-slate-950 text-white p-6 rounded-2xl shadow-md flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Énergie Totale</span>
            <span className="text-xs font-bold text-violet-400">{getPct(totalCal, goals.calories)}%</span>
          </div>
          <div>
            <p className="text-3xl font-black">{totalCal}</p>
            <p className="text-xs text-slate-400 mt-0.5">Objectif : {goals.calories} kcal</p>
          </div>
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-violet-500 rounded-full transition-all duration-500" style={{ width: `${getPct(totalCal, goals.calories)}%` }} />
          </div>
        </div>

        {/* Protéines */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Protéines</span>
            <span className="text-xs font-bold text-emerald-600">{getPct(totalPro, goals.proteins)}%</span>
          </div>
          <div>
            <p className="text-3xl font-black text-slate-950">{totalPro}g</p>
            <p className="text-xs text-slate-400 mt-0.5">Cible : {goals.proteins}g</p>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${getPct(totalPro, goals.proteins)}%` }} />
          </div>
        </div>

        {/* Glucides */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Glucides</span>
            <span className="text-xs font-bold text-amber-500">{getPct(totalCarb, goals.carbs)}%</span>
          </div>
          <div>
            <p className="text-3xl font-black text-slate-950">{totalCarb}g</p>
            <p className="text-xs text-slate-400 mt-0.5">Cible : {goals.carbs}g</p>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-amber-500 rounded-full transition-all duration-500" style={{ width: `${getPct(totalCarb, goals.carbs)}%` }} />
          </div>
        </div>

        {/* Lipides */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Lipides</span>
            <span className="text-xs font-bold text-rose-500">{getPct(totalFat, goals.fats)}%</span>
          </div>
          <div>
            <p className="text-3xl font-black text-slate-950">{totalFat}g</p>
            <p className="text-xs text-slate-400 mt-0.5">Cible : {goals.fats}g</p>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-rose-500 rounded-full transition-all duration-500" style={{ width: `${getPct(totalFat, goals.fats)}%` }} />
          </div>
        </div>

      </div>

      {/* Ajout Rapide 1-Clic */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">Ajout rapide (Standards Athlétiques)</h3>
          <span className="text-xs text-slate-400">1 clic pour enregistrer</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {quickPresets.map((item) => (
            <button
              key={item.name}
              onClick={() => addPreset(item)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-violet-50 border border-slate-200/80 hover:border-violet-200 text-xs font-semibold text-slate-700 hover:text-violet-700 transition cursor-pointer"
            >
              <span>+ {item.name}</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white text-slate-500 border border-slate-200/60">
                {item.calories} kcal
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Formulaire Personnalisé */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900">Saisie personnalisée</h3>
        <form onSubmit={handleAddMeal} className="grid grid-cols-1 sm:grid-cols-6 gap-3">
          <input
            type="text"
            placeholder="Nom du repas ou aliment"
            value={foodName}
            onChange={(e) => setFoodName(e.target.value)}
            required
            className="sm:col-span-2 px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-violet-600 bg-slate-50/50"
          />
          <input
            type="number"
            placeholder="Calories (kcal)*"
            value={foodCalories}
            onChange={(e) => setFoodCalories(e.target.value)}
            required
            className="px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-violet-600 bg-slate-50/50"
          />
          <input
            type="number"
            placeholder="Protéines (g)*"
            value={foodProteins}
            onChange={(e) => setFoodProteins(e.target.value)}
            required
            className="px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-violet-600 bg-slate-50/50"
          />
          <input
            type="number"
            placeholder="Glucides (g) (opt.)"
            value={foodCarbs}
            onChange={(e) => setFoodCarbs(e.target.value)}
            className="px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-violet-600 bg-slate-50/50"
          />
          <button
            type="submit"
            className="bg-slate-950 hover:bg-violet-600 text-white font-semibold rounded-xl text-xs sm:text-sm py-2.5 transition shadow-sm cursor-pointer"
          >
            Enregistrer
          </button>
        </form>
      </div>

      {/* Journal des Repas */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">Journal nutritionnel du jour</h3>
          <span className="text-xs font-semibold text-slate-400">{meals.length} entrée(s)</span>
        </div>

        <div className="divide-y divide-slate-100">
          {meals.length === 0 ? (
            <div className="text-center py-10 space-y-2">
              <p className="text-sm font-semibold text-slate-700">Aucune entrée enregistrée</p>
              <p className="text-xs text-slate-400">Utilise les boutons d'ajout rapide ci-dessus ou le formulaire pour démarrer ton suivi.</p>
            </div>
          ) : (
            meals.map((meal, index) => (
              <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between py-4 gap-3 text-sm">
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <span className="text-[11px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                      {meal.time || 'Aujourd’hui'}
                    </span>
                    <span className="font-bold text-slate-900">{meal.name}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span className="text-emerald-600 font-semibold">{meal.proteins}g Protéines</span>
                    <span>•</span>
                    <span className="text-amber-600 font-semibold">{meal.carbs}g Glucides</span>
                    <span>•</span>
                    <span className="text-rose-500 font-semibold">{meal.fats}g Lipides</span>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4">
                  <span className="text-base font-black text-slate-950">{meal.calories} kcal</span>
                  <button
                    onClick={() => removeMeal(index)}
                    aria-label="Supprimer"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}
