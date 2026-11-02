'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();

  const navItems = [
    {
      name: 'Dashboard',
      path: '/',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      ),
    },
    {
      name: 'Entraînements',
      path: '/exercises',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h2m14 0h2M6 7v6m12-6v6M9 5v10m6-10v10M9 10h6" />
        </svg>
      ),
    },
    {
      name: 'Nutrition',
      path: '/nutrition',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
  ];

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-slate-200/80 transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        
        {/* Identité de marque */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-slate-950 flex items-center justify-center shadow-md shadow-violet-500/10 group-hover:bg-violet-600 transition-colors">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-black tracking-tight text-slate-950">STRIX</span>
            <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md bg-violet-50 text-violet-600 border border-violet-200/60">
              PRO
            </span>
          </div>
        </Link>

        {/* Liens de navigation */}
        <nav className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-white text-slate-950 shadow-sm border border-slate-200/60'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <span className={isActive ? 'text-violet-600' : 'text-slate-400'}>{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Statut d'activité */}
        <div className="hidden md:flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200/80">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-semibold text-slate-700">Série active : 5 jours</span>
        </div>

      </div>
    </header>
  );
}
