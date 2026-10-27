// app/page.tsx
import Link from 'next/link';

export default function Home() {
  return (
    <div className="space-y-8 py-4">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200/80 text-center space-y-4">
        <h1 className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tight">
          Bienvenue sur <span className="text-violet-600">STRIX</span> ⚡
        </h1>
        <p className="text-slate-500 max-w-lg mx-auto text-sm sm:text-base">
          Ton espace dédié pour suivre tes entraînements, découvrir de nouveaux exercices et maîtriser ta nutrition au quotidien.
        </p>
        
        <div className="flex justify-center gap-4 pt-4">
          <Link href="/exercises" className="bg-violet-600 hover:bg-violet-700 text-white font-semibold px-6 py-3 rounded-xl text-sm transition shadow-sm">
            Explorer les exercices
          </Link>
          <Link href="/nutrition" className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold px-6 py-3 rounded-xl text-sm transition">
            Voir mon bilan
          </Link>
        </div>
      </div>
    </div>
  );
}
