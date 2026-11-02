'use client';

import { useState, useEffect } from 'react';

interface Meal {
  name: string;
  grams: number;
  calories: number;
  proteins: number;
  carbs: number;
  fats: number;
  time: string;
}

interface FoodItemDB {
  id: string;
  name: string;
  calPer100g: number;
  proPer100g: number;
  carbPer100g: number;
  fatPer100g: number;
}

interface MacroGoals {
  calories: number;
  proteins: number;
  carbs: number;
  fats: number;
}

const defaultFoodDatabase: FoodItemDB[] = [
  { id: 'poulet', name: 'Blanc de poulet cuit', calPer100g: 165, proPer100g: 31, carbPer100g: 0, fatPer100g: 3.6 },
  { id: 'riz', name: 'Riz basmati cuit', calPer100g: 130, proPer100g: 2.7, carbPer100g: 28, fatPer100g: 0.3 },
  { id: 'avoine', name: 'Flocons d’avoine', calPer100g: 379, proPer100g: 13.2, carbPer100g: 67.7, fatPer100g: 6.5 },
  { id: 'oeuf', name: 'Oeufs entiers', calPer100g: 155, proPer100g: 12.6, carbPer100g: 1.1, fatPer100g: 10.6 },
  { id: 'saumon', name: 'Pavé de saumon', calPer100g: 208, proPer100g: 20, carbPer100g: 0, fatPer100g: 13 },
  { id: 'whey', name: 'Whey Protéine Isolat', calPer100g: 375, proPer100g: 82, carbPer100g: 4, fatPer100g: 3 },
  { id: 'patate', name: 'Patate douce cuite', calPer100g: 86, proPer100g: 1.6, carbPer100g: 20, fatPer100g: 0.1 },
  { id: 'banane', name: 'Banane fraîche', calPer100g: 89, proPer100g: 1.1, carbPer100g: 22.8, fatPer100g: 0.3 },
  { id: 'amandes', name: 'Amandes entières', calPer100g: 579, proPer100g: 21, carbPer100g: 21.5, fatPer100g: 49.9 },
  { id: 'fromageblanc', name: 'Fromage blanc 0%', calPer100g: 48, proPer100g: 8, carbPer100g: 4, fatPer100g: 0 },
];

export default function NutritionPage() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [foodDB, setFoodDB] = useState<FoodItemDB[]>(defaultFoodDatabase);
  const [waterMl, setWaterMl] = useState<number>(0);

  // Calculateur par grammage via la base de données
  const [selectedFoodId, setSelectedFoodId] = useState<string>('poulet');
  const [selectedGrams, setSelectedGrams] = useState<string>('150');

  // Formulaire de saisie libre / enrichissement de la base
  const [foodName, setFoodName] = useState<string>('');
  const [foodCalories, setFoodCalories] = useState<string>('');
  const [foodProteins, setFoodProteins] = useState<string>('');
  const [foodCarbs, setFoodCarbs] = useState<string>('');
  const [foodFats, setFoodFats] = useState<string>('');
  const [saveToDB, setSaveToDB] = useState<boolean>(true);

  // Objectifs & Calculateur métabolique BMR/TDEE
  const [goals, setGoals] = useState<MacroGoals>({
    calories: 2400,
    proteins: 160,
    carbs: 260,
    fats: 75,
  });
  const [showGoalCalc, setShowGoalCalc] = useState<boolean>(false);
  const [userWeight, setUserWeight] = useState<string>('75');
  const [userHeight, setUserHeight] = useState<string>('178');
  const [userAge, setUserAge] = useState<string>('24');
  const [userObjective, setUserObjective] = useState<'cut' | 'maintain' | 'bulk'>('maintain');

  useEffect(() => {
    const savedMeals = localStorage.getItem('strix_meals');
    if (savedMeals) {
      try {
        setMeals(JSON.parse(savedMeals));
      } catch (e) {
        console.error(e);
      }
    }

    const savedCustomDB = localStorage.getItem('strix_food_db');
    if (savedCustomDB) {
      try {
        setFoodDB([...defaultFoodDatabase, ...JSON.parse(savedCustomDB)]);
      } catch (e) {
        console.error(e);
      }
    }

    const savedGoals = localStorage.getItem('strix_goals');
    if (savedGoals) {
      try {
        setGoals(JSON.parse(savedGoals));
      } catch (e) {
        console.error(e);
      }
    }

    const savedWater = localStorage.getItem('strix_water');
    if (savedWater) {
      setWaterMl(parseInt(savedWater, 10) || 0);
    }
  }, []);

  const syncMeals = (updatedMeals: Meal[]) => {
    setMeals(updatedMeals);
    localStorage.setItem('strix_meals', JSON.stringify(updatedMeals));
    window.dispatchEvent(new Event('strix-update'));
  };

  const updateWater = (delta: number) => {
    const nextVal = Math.max(0, waterMl + delta);
    setWaterMl(nextVal);
    localStorage.setItem('strix_water', String(nextVal));
    window.dispatchEvent(new Event('strix-update'));
  };

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  // Calcul dynamique selon l'aliment choisi et le grammage
  const selectedFood = foodDB.find((f) => f.id === selectedFoodId) || foodDB[0];
  const gramsNum = Math.max(1, parseInt(selectedGrams, 10) || 100);
  const ratio = gramsNum / 100;
  const previewCal = Math.round(selectedFood.calPer100g * ratio);
  const previewPro = Math.round(selectedFood.proPer100g * ratio);
  const previewCarb = Math.round(selectedFood.carbPer100g * ratio);
  const previewFat = Math.round(selectedFood.fatPer100g * ratio);

  const handleAddFromDB = (e: React.FormEvent) => {
    e.preventDefault();
    const newMeal: Meal = {
      name: `${selectedFood.name}`,
      grams: gramsNum,
      calories: previewCal,
      proteins: previewPro,
      carbs: previewCarb,
      fats: previewFat,
      time: getCurrentTime(),
    };
    syncMeals([newMeal, ...meals]);
  };

  // Saisie manuelle complète + ajout optionnel à la base de données
  const handleAddManualMeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!foodName || !foodCalories) return;

    const cal = parseInt(foodCalories, 10) || 0;
    const pro = parseInt(foodProteins, 10) || 0;
    const carbs = foodCarbs !== '' ? parseInt(foodCarbs, 10) : Math.round((cal * 0.4) / 4);
    const fats = foodFats !== '' ? parseInt(foodFats, 10) : Math.round((cal * 0.3) / 9);

    const newMeal: Meal = {
      name: foodName.trim(),
      grams: 100,
      calories: cal,
      proteins: pro,
      carbs,
      fats,
      time: getCurrentTime(),
    };

    syncMeals([newMeal, ...meals]);

    if (saveToDB) {
      const customItem: FoodItemDB = {
        id: `custom_${Date.now()}`,
        name: foodName.trim(),
        calPer100g: cal,
        proPer100g: pro,
        carbPer100g: carbs,
        fatPer100g: fats,
      };
      const savedCustom = localStorage.getItem('strix_food_db');
      const customArr: FoodItemDB[] = savedCustom ? JSON.parse(savedCustom) : [];
      localStorage.setItem('strix_food_db', JSON.stringify([customItem, ...customArr]));
      setFoodDB([customItem, ...foodDB]);
    }

    setFoodName('');
    setFoodCalories('');
    setFoodProteins('');
    setFoodCarbs('');
    setFoodFats('');
  };

  // Calculateur automatique BMR / TDEE
  const handleCalculateMetabolism = (e: React.FormEvent) => {
    e.preventDefault();
    const w = parseFloat(userWeight) || 75;
    const h = parseFloat(userHeight) || 178;
    const a = parseFloat(userAge) || 24;

    // Formule de Mifflin-St Jeor + facteur d'activité sportive (1.55)
    const bmr = 10 * w + 6.25 * h - 5 * a + 5;
    let targetCalories = Math.round(bmr * 1.55);

    if (userObjective === 'cut') targetCalories -= 400;
    if (userObjective === 'bulk') targetCalories += 350;

    const targetProteins = Math.round(w * 2.1); // 2.1g / kg
    const targetFats = Math.round(w * 1.0); // 1g / kg
    const remainingCal = Math.max(400, targetCalories - targetProteins * 4 - targetFats * 9);
    const targetCarbs = Math.round(remainingCal / 4);

    const newGoals: MacroGoals = {
      calories: targetCalories,
      proteins: targetProteins,
      carbs: targetCarbs,
      fats: targetFats,
    };

    setGoals(newGoals);
    localStorage.setItem('strix_goals', JSON.stringify(newGoals));
    window.dispatchEvent(new Event('strix-update'));
    setShowGoalCalc(false);
  };

  const removeMeal = (index: number) => {
    syncMeals(meals.filter((_, i) => i !== index));
  };

  const totalCal = meals.reduce((acc, m) => acc + m.calories, 0);
  const totalPro = meals.reduce((acc, m) => acc + m.proteins, 0);
  const totalCarb = meals.reduce((acc, m) => acc + m.carbs, 0);
  const totalFat = meals.reduce((acc, m) => acc + m.fats, 0);

  const getPct = (val: number, goal: number) => Math.min(100, Math.round((val / goal) * 100));

  return (
    <div className="space-y-8">
      
      {/* En-tête + Bouton Calculateur Métabolique */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-violet-600">
            Biométrie & Base de Données Alimentaire
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight mt-1">
            Architecture Nutritionnelle
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowGoalCalc(!showGoalCalc)}
            className="px-4 py-2 rounded-xl bg-slate-950 hover:bg-violet-600 text-white text-xs font-bold transition cursor-pointer"
          >
            {showGoalCalc ? 'Fermer le calculateur' : '⚙️ Calculer mes objectifs (Poids/Taille)'}
          </button>
          {meals.length > 0 && (
            <button
              onClick={() => syncMeals([])}
              className="text-xs font-semibold text-slate-400 hover:text-rose-600 transition cursor-pointer"
            >
              Vider le journal
            </button>
          )}
        </div>
      </div>

      {/* Panneau Calculateur Métabolique (Sèche / Maintien / Prise de masse) */}
      {showGoalCalc && (
        <form
          onSubmit={handleCalculateMetabolism}
          className="bg-slate-950 text-white p-6 rounded-2xl shadow-lg space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">
              Calculateur Métabolique Automatique (Mifflin-St Jeor)
            </h3>
            <span className="text-xs text-violet-300">Adapte tes cibles en 1 clic</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Poids (kg)</label>
              <input
                type="number"
                value={userWeight}
                onChange={(e) => setUserWeight(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/15 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Taille (cm)</label>
              <input
                type="number"
                value={userHeight}
                onChange={(e) => setUserHeight(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/15 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Âge</label>
              <input
                type="number"
                value={userAge}
                onChange={(e) => setUserAge(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/15 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Objectif</label>
              <select
                value={userObjective}
                onChange={(e) => setUserObjective(e.target.value as 'cut' | 'maintain' | 'bulk')}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/15 text-xs text-white"
              >
                <option value="cut">Sèche / Perte de gras (-400 kcal)</option>
                <option value="maintain">Maintien & Recomposition</option>
                <option value="bulk">Prise de muscle (+350 kcal)</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs transition cursor-pointer"
              >
                Appliquer mes cibles
              </button>
            </div>
          </div>
        </form>
      )}

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
            <div
              className="h-full bg-violet-500 rounded-full transition-all duration-500"
              style={{ width: `${getPct(totalCal, goals.calories)}%` }}
            />
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
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden
