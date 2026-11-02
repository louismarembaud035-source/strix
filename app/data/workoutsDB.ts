// app/data/workoutsDB.ts

export interface ExerciseItem {
  id: number;
  name: string;
  muscle: 'pectoraux' | 'dos' | 'jambes' | 'abdos' | 'epaules';
  equipment: string;
  level: 'Débutant' | 'Intermédiaire' | 'Avancé';
  defaultSets: number;
  defaultReps: number;
  defaultWeight: number;
  kcal: number;
  desc: string;
}

export interface WorkoutSession {
  id: string;
  title: string;
  subtitle: string;
  goal: 'hypertrophy' | 'fatloss' | 'strength';
  zone: 'upper' | 'lower' | 'full' | 'push' | 'pull';
  equipment: 'gym' | 'dumbbells' | 'bodyweight';
  level: 'Débutant' | 'Intermédiaire' | 'Avancé';
  duration: number;
  style: 'classic' | 'circuit';
  totalKcal: number;
  isCustomGenerated?: boolean;
  createdAt?: string;
  exercises: ExerciseItem[];
}

export const defaultWorkoutsDB: WorkoutSession[] = [
  {
    id: 'push-hypertrophy-gym',
    title: 'Push Day Pro — Volume Pectoraux & Épaules',
    subtitle: 'Hypertrophie maximale sur les chaînes de poussée en salle.',
    goal: 'hypertrophy',
    zone: 'push',
    equipment: 'gym',
    level: 'Intermédiaire',
    duration: 50,
    style: 'classic',
    totalKcal: 440,
    exercises: [
      {
        id: 101,
        name: 'Développé couché haltères',
        muscle: 'pectoraux',
        equipment: 'Haltères & Banc',
        level: 'Intermédiaire',
        defaultSets: 4,
        defaultReps: 10,
        defaultWeight: 28,
        kcal: 150,
        desc: 'Amplitude complète et recrutement symétrique des fibres pectorales.',
      },
      {
        id: 102,
        name: 'Dips lestés aux barres parallèles',
        muscle: 'pectoraux',
        equipment: 'Barres parallèles',
        level: 'Intermédiaire',
        defaultSets: 4,
        defaultReps: 10,
        defaultWeight: 10,
        kcal: 155,
        desc: 'Cible la portion inférieure des pectoraux et les trois faisceaux du triceps.',
      },
      {
        id: 103,
        name: 'Développé militaire haltères assis',
        muscle: 'epaules',
        equipment: 'Haltères',
        level: 'Intermédiaire',
        defaultSets: 4,
        defaultReps: 12,
        defaultWeight: 18,
        kcal: 135,
        desc: 'Renforce les deltoïdes antérieurs et moyens avec un gainage strict du tronc.',
      },
    ],
  },
  {
    id: 'pull-strength-gym',
    title: 'Pull Power — Dos Large & Densité',
    subtitle: 'Travail de tirage vertical et horizontal pour un dos épais.',
    goal: 'strength',
    zone: 'pull',
    equipment: 'gym',
    level: 'Avancé',
    duration: 55,
    style: 'classic',
    totalKcal: 465,
    exercises: [
      {
        id: 201,
        name: 'Tractions pronation strictes',
        muscle: 'dos',
        equipment: 'Barre de traction',
        level: 'Intermédiaire',
        defaultSets: 4,
        defaultReps: 10,
        defaultWeight: 0,
        kcal: 165,
        desc: 'Développe la largeur du grand dorsal et la force de préhension.',
      },
      {
        id: 202,
        name: 'Rowing barre buste penché',
        muscle: 'dos',
        equipment: 'Barre olympique',
        level: 'Avancé',
        defaultSets: 4,
        defaultReps: 8,
        defaultWeight: 70,
        kcal: 180,
        desc: 'Recrute les rhomboïdes, les trapèzes moyens et les lombaires en isométrie.',
      },
      {
        id: 203,
        name: 'Gainage dynamique & Crunchs lestés',
        muscle: 'abdos',
        equipment: 'Poids libre',
        level: 'Intermédiaire',
        defaultSets: 4,
        defaultReps: 15,
        defaultWeight: 10,
        kcal: 120,
        desc: 'Solidifie la sangle abdominale pour protéger la colonne vertébrale.',
      },
    ],
  },
  {
    id: 'legs-athletic-gym',
    title: 'Lower Body — Force & Puissance Jambes',
    subtitle: 'Séance polyarticulaire ciblant quadriceps, ischios et fessiers.',
    goal: 'hypertrophy',
    zone: 'lower',
    equipment: 'gym',
    level: 'Avancé',
    duration: 60,
    style: 'classic',
    totalKcal: 530,
    exercises: [
      {
        id: 301,
        name: 'Back Squat barre libre',
        muscle: 'jambes',
        equipment: 'Barre olympique',
        level: 'Avancé',
        defaultSets: 4,
        defaultReps: 8,
        defaultWeight: 85,
        kcal: 220,
        desc: 'Mouvement roi pour la force des membres inférieurs et la densité osseuse.',
      },
      {
        id: 302,
        name: 'Fentes bulgares unilatérales',
        muscle: 'jambes',
        equipment: 'Haltères',
        level: 'Intermédiaire',
        defaultSets: 3,
        defaultReps: 12,
        defaultWeight: 20,
        kcal: 190,
        desc: 'Élimine les déséquilibres de force entre la jambe gauche et la jambe droite.',
      },
      {
        id: 303,
        name: 'Relevés de jambes suspendu',
        muscle: 'abdos',
        equipment: 'Barre fixe',
        level: 'Intermédiaire',
        defaultSets: 4,
        defaultReps: 12,
        defaultWeight: 0,
        kcal: 120,
        desc: 'Cible le bas du grand droit et les fléchisseurs de hanche.',
      },
    ],
  },
  {
    id: 'upper-dumbbells-home',
    title: 'Upper Body Home — Haltères & Banc',
    subtitle: 'Séance haut du corps complète réalisable à domicile.',
    goal: 'hypertrophy',
    zone: 'upper',
    equipment: 'dumbbells',
    level: 'Intermédiaire',
    duration: 45,
    style: 'classic',
    totalKcal: 410,
    exercises: [
      {
        id: 401,
        name: 'Développé couché ou sol aux haltères',
        muscle: 'pectoraux',
        equipment: 'Haltères',
        level: 'Intermédiaire',
        defaultSets: 4,
        defaultReps: 12,
        defaultWeight: 22,
        kcal: 145,
        desc: 'Permet un travail sécurisé et puissant des pectoraux à la maison.',
      },
      {
        id: 402,
        name: 'Rowing haltère unilatéral (Bûcheron)',
        muscle: 'dos',
        equipment: 'Haltères',
        level: 'Débutant',
        defaultSets: 4,
        defaultReps: 12,
        defaultWeight: 24,
        kcal: 150,
        desc: 'Étirement maximal du grand dorsal sans contrainte sur le bas du dos.',
      },
      {
        id: 403,
        name: 'Élévations latérales strictes',
        muscle: 'epaules',
        equipment: 'Haltères',
        level: 'Débutant',
        defaultSets: 4,
        defaultReps: 15,
        defaultWeight: 10,
        kcal: 115,
        desc: 'Isole le faisceau moyen de l’épaule pour élargir la carrure.',
      },
    ],
  },
  {
    id: 'fullbody-hiit-bodyweight',
    title: 'Full Body Burn — Calisthenics & Cardio',
    subtitle: 'Circuit haute intensité au poids du corps sans matériel.',
    goal: 'fatloss',
    zone: 'full',
    equipment: 'bodyweight',
    level: 'Débutant',
    duration: 30,
    style: 'circuit',
    totalKcal: 395,
    exercises: [
      {
        id: 501,
        name: 'Pompes explosives Plyo',
        muscle: 'pectoraux',
        equipment: 'Poids du corps',
        level: 'Intermédiaire',
        defaultSets: 4,
        defaultReps: 15,
        defaultWeight: 0,
        kcal: 140,
        desc: 'Active les fibres rapides du haut du corps et augmente la fréquence cardiaque.',
      },
      {
        id: 502,
        name: 'Squats sautés & Fentes alternées',
        muscle: 'jambes',
        equipment: 'Poids du corps',
        level: 'Débutant',
        defaultSets: 4,
        defaultReps: 20,
        defaultWeight: 0,
        kcal: 155,
        desc: 'Brûle un maximum de calories tout en tonifiant les cuisses et les fessiers.',
      },
      {
        id: 503,
        name: 'Mountain Climbers & Planche active',
        muscle: 'abdos',
        equipment: 'Poids du corps',
        level: 'Débutant',
        defaultSets: 4,
        defaultReps: 30,
        defaultWeight: 0,
        kcal: 100,
        desc: 'Gainage dynamique à haute dépense énergétique.',
      },
    ],
  },
  {
    id: 'lower-dumbbells-sculpt',
    title: 'Lower Body Haltères — Galbe & Endurance',
    subtitle: 'Focus jambes et sangle abdominale avec une paire d’haltères.',
    goal: 'fatloss',
    zone: 'lower',
    equipment: 'dumbbells',
    level: 'Débutant',
    duration: 35,
    style: 'circuit',
    totalKcal: 380,
    exercises: [
      {
        id: 601,
        name: 'Goblet Squat haltère',
        muscle: 'jambes',
        equipment: 'Haltères',
        level: 'Débutant',
        defaultSets: 4,
        defaultReps: 15,
        defaultWeight: 20,
        kcal: 150,
        desc: 'Maintient le buste droit et sollicite profondément les quadriceps et fessiers.',
      },
      {
        id: 602,
        name: 'Soulevé de terre roumain haltères',
        muscle: 'jambes',
        equipment: 'Haltères',
        level: 'Intermédiaire',
        defaultSets: 4,
        defaultReps: 12,
        defaultWeight: 22,
        kcal: 140,
        desc: 'Cible toute la chaîne postérieure : ischio-jambiers et fessiers.',
      },
      {
        id: 603,
        name: 'Russian Twists & Gainage',
        muscle: 'abdos',
        equipment: 'Poids du corps',
        level: 'Débutant',
        defaultSets: 3,
        defaultReps: 20,
        defaultWeight: 0,
        kcal: 90,
        desc: 'Engage les obliques et affine la taille.',
      },
    ],
  },
];

// Récupère l'intégralité de la base de données (séances par défaut + séances générées dans localStorage)
export function getAllWorkoutsFromDB(): WorkoutSession[] {
  if (typeof window === 'undefined') return defaultWorkoutsDB;
  const saved = localStorage.getItem('strix_workouts_db');
  if (!saved) {
    localStorage.setItem('strix_workouts_db', JSON.stringify(defaultWorkoutsDB));
    return defaultWorkoutsDB;
  }
  try {
    const parsed: WorkoutSession[] = JSON.parse(saved);
    const existingIds = new Set(parsed.map((w) => w.id));
    const merged = [
      ...parsed,
      ...defaultWorkoutsDB.filter((w) => !existingIds.has(w.id)),
    ];
    return merged;
  } catch {
    return defaultWorkoutsDB;
  }
}

// Sauvegarde une nouvelle séance dans la base de données locale
export function saveWorkoutToDB(newSession: WorkoutSession): WorkoutSession[] {
  const current = getAllWorkoutsFromDB();
  const filtered = current.filter((w) => w.id !== newSession.id);
  const updated = [newSession, ...filtered];
  localStorage.setItem('strix_workouts_db', JSON.stringify(updated));

  // Ajoute aussi ses exercices dans le catalogue global pour qu'ils soient tous accessibles
  const savedEx = localStorage.getItem('strix_custom_exercises');
  const existingEx: ExerciseItem[] = savedEx ? JSON.parse(savedEx) : [];
  const existingNames = new Set(existingEx.map((e) => e.name.toLowerCase()));
  const newExercises = newSession.exercises.filter(
    (e) => !existingNames.has(e.name.toLowerCase())
  );
  if (newExercises.length > 0) {
    localStorage.setItem(
      'strix_custom_exercises',
      JSON.stringify([...newExercises, ...existingEx])
    );
  }

  window.dispatchEvent(new Event('strix-update'));
  return updated;
}
