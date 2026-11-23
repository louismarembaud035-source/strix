// components/BodyMap.tsx
'use client';

interface BodyMapProps {
  recovery: Record<string, number>;
}

export default function BodyMap({ recovery }: BodyMapProps) {
  const getFill = (muscle: string) => {
    const score = recovery[muscle] ?? 100;
    if (score < 30) return '#f43f5e'; // rose-500 (Fatigue max)
    if (score < 70) return '#8b5cf6'; // violet-500 (En récupération)
    return '#334155'; // slate-700 (Prêt)
  };

  const baseClass = "transition-colors duration-1000 ease-in-out";

  return (
    <svg viewBox="0 0 200 400" className="w-full h-full drop-shadow-xl" preserveAspectRatio="xMidYMid meet">
      {/* Tête & Cou */}
      <path d="M100 20 C85 20, 80 35, 80 50 C80 65, 90 75, 100 75 C110 75, 120 65, 120 50 C120 35, 115 20, 100 20 Z" fill="#1e293b" />
      <path d="M90 70 L90 85 L110 85 L110 70 Z" fill="#1e293b" />

      {/* Épaules */}
      <path d="M90 85 C70 85, 55 95, 50 110 C45 125, 55 135, 65 135 C70 120, 80 110, 90 100 Z" fill={getFill('epaules')} className={baseClass} />
      <path d="M110 85 C130 85, 145 95, 150 110 C155 125, 145 135, 135 135 C130 120, 120 110, 110 100 Z" fill={getFill('epaules')} className={baseClass} />

      {/* Pectoraux */}
      <path d="M99 90 L65 95 C65 110, 75 130, 99 135 Z" fill={getFill('pectoraux')} className={baseClass} />
      <path d="M101 90 L135 95 C135 110, 125 130, 101 135 Z" fill={getFill('pectoraux')} className={baseClass} />

      {/* Abdos */}
      <path d="M99 138 L75 140 C75 160, 80 180, 99 190 Z" fill={getFill('abdos')} className={baseClass} />
      <path d="M101 138 L125 140 C125 160, 120 180, 101 190 Z" fill={getFill('abdos')} className={baseClass} />

      {/* Dos (Dorsaux visibles de face sur les flancs) */}
      <path d="M73 105 C60 120, 65 150, 75 150 C75 130, 75 115, 73 105 Z" fill={getFill('dos')} className={baseClass} />
      <path d="M127 105 C140 120, 135 150, 125 150 C125 130, 125 115, 127 105 Z" fill={getFill('dos')} className={baseClass} />

      {/* Bras (Biceps/Triceps & Avant-bras) */}
      <path d="M50 115 C40 130, 35 150, 40 170 C45 190, 55 170, 60 145 C65 125, 55 120, 50 115 Z" fill={getFill('bras')} className={baseClass} />
      <path d="M150 115 C160 130, 165 150, 160 170 C155 190, 145 170, 140 145 C135 125, 145 120, 150 115 Z" fill={getFill('bras')} className={baseClass} />
      <path d="M38 175 C30 195, 25 215, 30 230 C35 215, 45 200, 48 180 Z" fill={getFill('bras')} className={baseClass} />
      <path d="M162 175 C170 195, 175 215, 170 230 C165 215, 155 200, 152 180 Z" fill={getFill('bras')} className={baseClass} />

      {/* Jambes (Quadriceps) */}
      <path d="M98 195 L70 195 C65 220, 60 260, 75 290 C85 270, 95 240, 98 195 Z" fill={getFill('jambes')} className={baseClass} />
      <path d="M102 195 L130 195 C135 220, 140 260, 125 290 C115 270, 105 240, 102 195 Z" fill={getFill('jambes')} className={baseClass} />

      {/* Mollets */}
      <path d="M75 300 C65 320, 70 350, 80 380 C85 360, 90 330, 85 300 Z" fill={getFill('jambes')} className={baseClass} />
      <path d="M125 300 C135 320, 130 350, 120 380 C115 360, 110 330, 115 300 Z" fill={getFill('jambes')} className={baseClass} />
    </svg>
  );
}
