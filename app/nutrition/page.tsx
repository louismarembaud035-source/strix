// app/nutrition/page.tsx
'use client';

import { useState, useEffect } from 'react';

interface Meal {
  name: string;
  calories: number;
  proteins: number;
  carbs: number;
  fats: number;
}

export default function NutritionPage() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [foodName, setFoodName] = useState('');
  const [foodCalories, setFoodCalories] = useState('');
  const [foodProteins, setFoodProteins] = useState('');

  // Charger les repas depuis le localStorage au démarrage
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

  // Sauvegarder dans le localStorage à chaque modification
  useEffect(() => {
    localStorage.setItem('strix_meals', JSON.stringify(meals));
  }, [meals]);

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

  const totalCal = meals.reduce((acc, m) => acc + m.calories, 0);
  const totalPro = meals.reduce((acc, m) => acc + m.proteins, 0);
  const totalCarb = meals.reduce((acc, m) => acc + m.carbs, 0);
  const totalFat = meals.reduce((acc, m) => acc + m.fats, 0);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black text-slate-800 tracking-tight">Bilan Nutritionnel du Jour</h2>

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
  );
}
