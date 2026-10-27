// components/Navbar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();

  const getLinkClass = (path: string) => {
    const isActive = pathname === path;
    return `font-semibold pb-1 transition cursor-pointer ${
      isActive 
        ? 'text-violet-600 border-b-2 border-violet-600' 
        : 'text-slate-400 hover:text-slate-600'
    }`;
  };

  return (
    <nav className="bg-white border-b border-slate-200 shadow-sm flex justify-center space-x-12 py-3 sticky top-0 z-10">
      <Link href="/" className={getLinkClass('/')}>
        🏠 Accueil
      </Link>
      <Link href="/exercises" className={getLinkClass('/exercises')}>
        🏋️‍♂️ Catalogue d'exercices
      </Link>
      <Link href="/nutrition" className={getLinkClass('/nutrition')}>
        🍎 Bilan Nutritionnel
      </Link>
    </nav>
  );
}
