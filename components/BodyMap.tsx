// components/BodyMap.tsx
'use client';

interface BodyMapProps {
  recovery: Record<string, number>;
}

export default function BodyMap({ recovery }: BodyMapProps) {
  // Détermine la couleur d'un muscle selon son score (0 à 100)
  // < 30% : Rouge (Fatigue critique)
  // < 70% : Violet (En récupération)
  // > 70% : Ardoise (Frais / Prêt)
  const getFill = (muscle: string) => {
    const score = recovery[muscle] ?? 100;
    if (score < 30) return '#f43f5e'; // rose-500
    if (score < 70) return '#8b5cf6'; // violet-500
    return '#334155'; // slate-700
  };

  const baseClass = "transition-colors duration-700 ease-in-out";

  return (
    <svg viewBox="0 0 100 160" className="w-full h-full drop-shadow-2xl">
      {/* Tête (Neutre) */}
      <rect x="40" y="5" width="20" height="20" rx="10" fill="#1e293b" />
      <rect x="46" y="25" width="8" height="8" fill={getFill('dos')} className={baseClass} />

      {/* Épaules */}
      <rect x="22" y="33" width="14" height="14" rx="4" fill={getFill('epaules')} className={baseClass} />
      <rect x="64" y="33" width="14" height="14" rx="4" fill={getFill('epaules')} className={baseClass} />

      {/* Grand Dorsal (Dos - visible derrière) */}
      <rect x="32" y="38" width="4" height="20" rx="2" fill={getFill('dos')} className={baseClass} />
      <rect x="64" y="38" width="4" height="20" rx="2" fill={getFill('dos')} className={baseClass} />

      {/* Pectoraux */}
      <rect x="37" y="33" width="12.5" height="16" rx="3" fill={getFill('pectoraux')} className={baseClass} />
      <rect x="50.5" y="33" width="12.5" height="16" rx="3" fill={getFill('pectoraux')} className={baseClass} />

      {/* Sangle Abdominale & Bassin */}
      <rect x="39" y="51" width="22" height="26" rx="4" fill={getFill('abdos')} className={baseClass} />
      <rect x="37" y="79" width="26" height="12" rx="4" fill={getFill('abdos')} className={baseClass} />

      {/* Bras (Biceps/Triceps + Avant-bras) */}
      <rect x="22" y="49" width="12" height="20" rx="4" fill={getFill('bras')} className={baseClass} />
      <rect x="23" y="71" width="10" height="22" rx="4" fill={getFill('bras')} className={baseClass} />
      <rect x="66" y="49" width="12" height="20" rx="4" fill={getFill('bras')} className={baseClass} />
      <rect x="67" y="71" width="10" height="22" rx="4" fill={getFill('bras')} className={baseClass} />

      {/* Jambes (Quadriceps + Mollets) */}
      <rect x="37" y="93" width="12" height="30" rx="4" fill={getFill('jambes')} className={baseClass} />
      <rect x="51" y="93" width="12" height="30" rx="4" fill={getFill('jambes')} className={baseClass} />
      <rect x="38" y="125" width="10" height="25" rx="3" fill={getFill('jambes')} className={baseClass} />
      <rect x="52" y="125" width="10" height="25" rx="3" fill={getFill('jambes')} className={baseClass} />
    </svg>
  );
}
