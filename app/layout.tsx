import './globals.css';
import Navbar from '@/components/Navbar';

export const metadata = {
  title: 'STRIX — Plateforme de Performance & Nutrition',
  description: 'Suivi analytique des entraînements et de la nutrition quotidienne.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans antialiased selection:bg-violet-600 selection:text-white">
        
        <Navbar />

        <main className="flex-grow max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">
          {children}
        </main>

        <footer className="border-t border-slate-200/80 bg-white mt-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-400 font-medium">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-violet-600" />
              <span className="font-bold text-slate-700">STRIX OS</span>
              <span>— Architecture d'entraînement haute performance</span>
            </div>
            <div>Système v2.0 • Next.js & Tailwind CSS</div>
          </div>
        </footer>

      </body>
    </html>
  );
}
