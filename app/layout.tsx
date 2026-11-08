// app/layout.tsx
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import BottomNav from '@/components/BottomNav';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Strix - Dépasse tes standards',
  description: 'Système biométrique et générateur de séances d\'entraînement.',
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  themeColor: '#020617',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // Empêche le zoom intempestif sur mobile
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      {/* Le pb-20 (padding-bottom) réserve l'espace pour que le BottomNav ne cache pas le contenu */}
      <body className={`${inter.className} bg-slate-50 min-h-screen pb-20 sm:pb-0`}>
        <Navbar />
        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
          {children}
        </main>
        <BottomNav />
      </body>
    </html>
  );
}
