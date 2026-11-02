// app/quiz/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ExerciseItem,
  WorkoutSession,
  saveWorkoutToDB,
} from '@/app/data/workoutsDB';

interface QuizQuestion {
  id: string;
  question: string;
  subtitle: string;
  options: { label: string; value: string; desc: string }[];
}

const questionsList: QuizQuestion[] = [
  {
    id: 'goal',
    question: '1. Quel est ton objectif principal pour cette séance ?',
    subtitle: 'Oriente le choix des exercices, le nombre de répétitions et la dépense calorique.',
    options: [
      { label: 'Volume & Prise de muscle', value: 'hypertrophy', desc: 'Séries de 8 à 12 répétitions sous tension mécanique' },
      { label: 'Dépense calorique & Définition', value: 'fatloss', desc: 'Rythme soutenu pour brûler un maximum d’énergie' },
      { label: 'Force athlétique & Gainage', value: 'strength', desc: 'Priorité aux mouvements polyarticulaires lourds' },
    ],
  },
  {
    id: 'zone',
    question: '2. Quelle zone musculaire souhaites-tu cibler aujourd’hui ?',
    subtitle: 'Sélectionne la répartition anatomique de ta séance.',
    options: [
      { label: 'Haut du corps — Poussée (Pectoraux, Épaules, Triceps)', value: 'push', desc: 'Idéal pour développer le buste et la carrure' },
      { label: 'Haut du corps — Tirage (Dos, Trapèzes, Biceps)', value: 'pull', desc: 'Pour la largeur du dos et la posture' },
      { label: 'Bas du corps (Quadriceps, Fessiers, Ischios)', value: 'lower', desc: 'Séance dédiée à la puissance des jambes' },
      { label: 'Corps entier (Full Body)', value: 'full', desc: 'Sollicite l’ensemble des grands groupes musculaires' },
    ],
  },
  {
    id: 'equipment',
    question: '3. De quel matériel disposes-tu autour de toi ?',
    subtitle: 'Filtre uniquement les mouvements réalisables dans ton environnement.',
    options: [
      { label: 'Salle de sport complète', value: 'gym', desc: 'Barres olympiques, haltères, bancs et poulies' },
      { label: 'Haltères à domicile', value: 'dumbbells', desc: 'Une paire d’haltères réglables avec ou sans banc' },
      { label: 'Poids du corps uniquement', value: 'bodyweight', desc: 'Aucun matériel requis, 100 % calisthenics' },
    ],
  },
  {
    id: 'level',
    question: '4. Quel est ton niveau d’expérience en entraînement ?',
    subtitle: 'Adapte la complexité technique et le volume total.',
    options: [
      { label: 'Débutant', value: 'Débutant', desc: 'Moins de 6 mois de pratique régulière' },
      { label: 'Intermédiaire', value: 'Intermédiaire', desc: '6 mois à 2 ans de pratique structurée' },
      { label: 'Avancé', value: 'Avancé', desc: 'Plus de 2 ans avec maîtrise des charges libres' },
    ],
  },
  {
    id: 'duration',
    question: '5. Combien de temps as-tu devant toi ?',
    subtitle: 'Calibre le nombre d’exercices et de séries de ta séance.',
    options: [
      { label: '30 minutes (Format Express)', value: '30', desc: '3 exercices ciblés sans temps mort' },
      { label: '45 minutes (Format Standard)', value: '45', desc: '4 exercices complets pour un travail équilibré' },
      { label: '60 minutes (Format Volume Complet)', value: '60', desc: '5 exercices avec finition abdominale' },
    ],
  },
  {
    id: 'energy',
    question: '6. Comment évalues-tu ton niveau d’énergie aujourd’hui ?',
    subtitle: 'Ajuste les charges recommandées et l’intensité nerveuse.',
    options: [
      { label: 'Énergie maximale (100 %)', value: 'high', desc: 'Surcharge progressive et séries intenses' },
      { label: 'Énergie normale', value: 'normal', desc: 'Volume de travail standard et maîtrisé' },
      { label: 'Fatigue ressentie', value: 'low', desc: 'Charges modérées et priorité à la qualité d’exécution' },
    ],
  },
  {
    id: 'style',
    question: '7. Quel rythme d’entraînement préfères-tu ?',
    subtitle: 'Définit l’organisation de tes séries.',
    options: [
      { label: 'Séries classiques avec repos fixe', value: 'classic', desc: '60 à 90 secondes de récupération entre les séries' },
      { label: 'Format dynamique / Circuit', value: 'circuit', desc: 'Enchaînement fluide pour garder le rythme cardiaque haut' },
    ],
  },
  {
    id: 'finisher',
    question: '8. Quel accent final veux-tu ajouter en fin de séance ?',
    subtitle: 'Personnalise le dernier bloc de ton programme.',
    options: [
      { label: 'Renforcement Sangle Abdominale & Core', value: 'core', desc: 'Gainage et travail profond des abdominaux' },
      { label: 'Série métabolique Brûle-Graisse', value: 'burn', desc: 'Dernier exercice à haute dépense calorique' },
      { label: 'Répétitions d’isolation musculaire', value: 'pump', desc: 'Congestion maximale sur la zone travaillée' },
    ],
  },
];

export default function QuizPage() {
  const router = useRouter();
  const [step, setStep] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const handleSelect = (optionValue: string) => {
    const currentQ = questionsList[step];
    const updated = { ...answers, [currentQ.id]: optionValue };
    setAnswers(updated);

    if (step < questionsList.length - 1) {
      setStep(step + 1);
    } else {
      buildAndRedirect(updated);
    }
  };

  const buildAndRedirect = (finalAnswers: Record<string, string>) => {
    const goal = (finalAnswers.goal || 'hypertrophy') as WorkoutSession['goal'];
    const zone = (finalAnswers.zone || 'full') as WorkoutSession['zone'];
    const equipment = (finalAnswers.equipment || 'gym') as WorkoutSession['equipment'];
    const level = (finalAnswers.level || 'Intermédiaire') as WorkoutSession['level'];
    const duration = parseInt(finalAnswers.duration || '45', 10);
    const energy = finalAnswers.energy || 'normal';
    const style = (finalAnswers.style || 'classic') as WorkoutSession['style'];
    const finisher = finalAnswers.finisher || 'core';

    const setsBase = energy === 'high' ? 4 : energy === 'low' ? 3 : 4;
    const repsBase = goal === 'strength' ? 8 : goal === 'fatloss' ? 15 : 10;
    const weightMult = equipment === 'bodyweight' ? 0 : energy === 'high' ? 1.15 : energy === 'low' ? 0.85 : 1;

    const generatedExercises: ExerciseItem[] = [];
    const baseId = Date.now();

    // Sélection d'exercices selon la zone et le matériel
    if (zone === 'push' || zone === 'upper' || zone === 'full') {
      generatedExercises.push({
        id: baseId + 1,
        name:
          equipment === 'bodyweight'
            ? 'Pompes déclinées & Pompes diamant'
            : equipment === 'dumbbells'
            ? 'Développé haltères sur mesure'
            : 'Développé couché & Presse inclinée',
        muscle: 'pectoraux',
        equipment: equipment === 'bodyweight' ? 'Poids du corps' : 'Haltères / Barre',
        level,
        defaultSets: setsBase,
        defaultReps: repsBase,
        defaultWeight: Math.round(26 * weightMult),
        kcal: 155,
        desc: 'Mouvement principal de poussée calibré selon tes réponses au questionnaire.',
      });
      generatedExercises.push({
        id: baseId + 2,
        name:
          equipment === 'bodyweight'
            ? 'Pike Push-ups (Épaules & Triceps)'
            : 'Développé épaules & Élévations latérales',
        muscle: 'epaules',
        equipment: equipment === 'bodyweight' ? 'Poids du corps' : 'Haltères',
        level,
        defaultSets: setsBase,
        defaultReps: repsBase + 2,
        defaultWeight: Math.round(14 * weightMult),
        kcal: 130,
        desc: 'Sollicitation ciblée des deltoïdes et des triceps.',
      });
    }

    if (zone === 'pull' || zone === 'upper' || zone === 'full') {
      generatedExercises.push({
        id: baseId + 3,
        name:
          equipment === 'bodyweight'
            ? 'Tractions australiennes / Pronation'
            : equipment === 'dumbbells'
            ? 'Rowing haltères bilatéral'
            : 'Tirage vertical & Rowing barre',
        muscle: 'dos',
        equipment: equipment === 'bodyweight' ? 'Poids du corps / Barre' : 'Haltères / Poulie',
        level,
        defaultSets: setsBase,
        defaultReps: repsBase,
        defaultWeight: Math.round(32 * weightMult),
        kcal: 165,
        desc: 'Travail en épaisseur et largeur de toute la chaîne postérieure haute.',
      });
    }

    if (zone === 'lower' || zone === 'full') {
      generatedExercises.push({
        id: baseId + 4,
        name:
          equipment === 'bodyweight'
            ? 'Squats bulgares & Squats sautés'
            : equipment === 'dumbbells'
            ? 'Goblet Squat & Fentes haltères'
            : 'Back Squat & Presse à cuisses',
        muscle: 'jambes',
        equipment: equipment === 'bodyweight' ? 'Poids du corps' : 'Charges libres',
        level,
        defaultSets: setsBase,
        defaultReps: repsBase,
        defaultWeight: Math.round(50 * weightMult),
        kcal: 205,
        desc: 'Recrutement complet des quadriceps, ischio-jambiers et fessiers.',
      });
    }

    // Ajout d'un exercice complémentaire si la séance est longue (45 ou 60 min)
    if (duration >= 45 && generatedExercises.length < 3) {
      generatedExercises.push({
        id: baseId + 5,
        name:
          zone === 'lower'
            ? 'Soulevé de terre jambes semi-tendues'
            : 'Dips & Extension triceps',
        muscle: zone === 'lower' ? 'jambes' : 'pectoraux',
        equipment: equipment === 'bodyweight' ? 'Poids du corps' : 'Haltères',
        level,
        defaultSets: setsBase,
        defaultReps: 12,
        defaultWeight: Math.round(20 * weightMult),
        kcal: 145,
        desc: 'Volume additionnel pour atteindre la durée cible sélectionnée.',
      });
    }

    // Finisher personnalisé (Question 8)
    generatedExercises.push({
      id: baseId + 6,
      name:
        finisher === 'core'
          ? 'Circuit Gainage Planche & Hollow Body'
          : finisher === 'burn'
          ? 'Finisher Métabolique Haute Intensité'
          : 'Série Dégressive Congestion Ciblée',
      muscle: 'abdos',
      equipment: 'Poids du corps',
      level,
      defaultSets: 3,
      defaultReps: 20,
      defaultWeight: 0,
      kcal: 115,
      desc: 'Bloc final sélectionné à la question 8 pour clôturer ta séance.',
    });

    const totalKcal = generatedExercises.reduce((sum, ex) => sum + ex.kcal, 0);
    const zoneNames: Record<string, string> = {
      push: 'Push (Pecs / Épaules)',
      pull: 'Pull (Dos / Bras)',
      lower: 'Lower Body (Jambes)',
      upper: 'Upper Body',
      full: 'Full Body Athlétique',
    };

    const customSession: WorkoutSession = {
      id: `custom-session-${Date.now()}`,
      title: `Séance Sur-Mesure : ${zoneNames[zone] || 'Complète'}`,
      subtitle: `Programme ${level} • ${duration} min • Format ${style === 'circuit' ? 'Circuit' : 'Classique'}`,
      goal,
      zone,
      equipment,
      level,
      duration,
      style,
      totalKcal,
      isCustomGenerated: true,
      createdAt: new Date().toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      }),
      exercises: generatedExercises,
    };

    saveWorkoutToDB(customSession);
    router.push(`/exercises?session=${customSession.id}`);
  };

  const currentQuestion = questionsList[step];
  const progressPct = Math.round(((step + 1) / questionsList.length) * 100);

  return (
    <div className="max-w-2xl mx-auto space-y-8 py-4">
      
      {/* En-tête du Questionnaire */}
      <div className="bg-slate-950 text-white p-6 sm:p-8 rounded-3xl shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md bg-violet-500/20 text-violet-300 border border-violet-500/30">
            Diagnostic Athlétique Strix
          </span>
          <span className="text-xs font-bold text-slate-400">
            Question {step + 1} / {questionsList.length}
          </span>
        </div>

        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-violet-500 to-emerald-400 rounded-full transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Carte de la Question Active */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
        <div className="space-y-2">
          <h1 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
            {currentQuestion.question}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">{currentQuestion.subtitle}</p>
        </div>

        <div className="space-y-3">
          {currentQuestion.options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleSelect(opt.value)}
              className="w-full text-left p-4 sm:p-5 rounded-2xl border border-slate-200/80 hover:border-violet-600 hover:bg-violet-50/40 transition-all flex items-center justify-between gap-4 group cursor-pointer"
            >
              <div className="space-y-1">
                <p className="font-bold text-slate-900 group-hover:text-violet-700 transition-colors text-sm sm:text-base">
                  {opt.label}
                </p>
                <p className="text-xs text-slate-500">{opt.desc}</p>
              </div>
              <div className="w-8 h-8 rounded-xl bg-slate-100 group-hover:bg-violet-600 group-hover:text-white text-slate-400 flex items-center justify-center transition-colors shrink-0">
                →
              </div>
            </button>
          ))}
        </div>

        {step > 0 && (
          <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
            <button
              onClick={() => setStep(step - 1)}
              className="text-xs font-bold text-slate-500 hover:text-slate-900 transition cursor-pointer"
            >
              ← Question précédente
            </button>
            <span className="text-[11px] text-slate-400">
              Progression : {progressPct}%
            </span>
          </div>
        )}
      </div>

    </div>
  );
}
