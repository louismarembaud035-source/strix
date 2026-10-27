// app/layout.tsx
import './globals.css';
import Navbar from '@/components/Navbar';

export const metadata = {
  title: 'Strix - Performance & Nutrition',
  description: 'Application de sport et nutrition moderne',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
        
        {/* En-tête global */}
        <header className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg py-4 px-6 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black tracking-wider">⚡ STRIX</span>
            <span className="text-xs bg-white/20 text-white font-medium px-2 py-0.5 rounded-full">V1 Socle</span>
          </div>
          <p className="text-sm text-violet-100 hidden sm:block">Performance & Nutrition</p>
        </header>

        {/* Barre de navigation fixe */}
        <Navbar />

        {/* Contenu de la page active */}
        <main className="flex-grow max-w-4xl w-full mx-auto p-4 sm:p-6">
          {children}
        </main>

        {/* Pied de page global */}
        <footer className="text-center py-6 text-xs text-slate-400 border-t border-slate-200 mt-auto">
          Strix V1 — Propulsé par Next.js & Tailwind CSS
        </footer>

      </body>
    </html>
  );
}
