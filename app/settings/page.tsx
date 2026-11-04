// app/settings/page.tsx
'use client';

import { useState } from 'react';

export default function SettingsPage() {
  const [statusMessage, setStatusMessage] = useState<string>('');

  const exportData = () => {
    const keys = [
      'strix_workouts_db',
      'strix_workout_history',
      'strix_exercise_perfs',
      'strix_personal_records',
      'strix_completed_exercises',
      'strix_meals',
      'strix_goals',
      'strix_water',
      'strix_weekly_kcal'
    ];

    const data: Record<string, string | null> = {};
    keys.forEach((k) => {
      data[k] = localStorage.getItem(k);
    });

    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `strix_backup_${new Date().toLocaleDateString('fr-FR').replace(/\//g, '-')}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setStatusMessage('INFO : Données sauvegardées avec succès.');
    setTimeout(() => setStatusMessage(''), 3000);
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        Object.keys(data).forEach((k) => {
          if (data[k]) localStorage.setItem(k, data[k]);
        });
        setStatusMessage('INFO : Restauration réussie. Recharge l\'application.');
      } catch (error) {
        setStatusMessage('ERREUR : Fichier de sauvegarde invalide.');
      }
    };
    reader.readAsText(file);
  };

  const clearData = () => {
    if (confirm('ATTENTION : Cela supprimera définitivement toutes tes données locales. Continuer ?')) {
      localStorage.clear();
      setStatusMessage('INFO : Toutes les données ont été effacées.');
      setTimeout(() => window.location.reload(), 1500);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-6">
      <div className="bg-slate-950 text-white p-8 rounded-3xl space-y-2">
        <h1 className="text-2xl font-black">Paramètres & Données</h1>
        <p className="text-sm text-slate-400">Gère tes sauvegardes et l'installation de l'application.</p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Sauvegarde Locale</h2>
        <p className="text-xs text-slate-500">
          Strix fonctionne hors-ligne. Exporte tes données régulièrement pour ne rien perdre si tu vides le cache de ton navigateur.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={exportData}
            className="flex-1 py-3 bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs rounded-xl transition cursor-pointer"
          >
            Télécharger ma sauvegarde
          </button>
          
          <label className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition cursor-pointer text-center border border-slate-300">
            Importer une sauvegarde
            <input type="file" accept=".json" onChange={importData} className="hidden" />
          </label>
        </div>

        {statusMessage && (
          <p className={`text-xs font-bold pt-2 text-center ${statusMessage.startsWith('ERREUR') ? 'text-rose-600' : 'text-emerald-600'}`}>
            {statusMessage}
          </p>
        )}
      </div>

      <div className="bg-white p-6 rounded-2xl border border-rose-200 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-rose-600">Zone de danger</h2>
        <button
          onClick={clearData}
          className="w-full py-3 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs rounded-xl transition cursor-pointer border border-rose-200"
        >
          Réinitialiser l'application
        </button>
      </div>
    </div>
  );
}
