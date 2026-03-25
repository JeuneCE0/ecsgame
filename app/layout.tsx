import type { Metadata } from 'next';
import { Inter, Rajdhani, Press_Start_2P } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

const rajdhani = Rajdhani({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-display',
  display: 'swap',
});

const pressStart2P = Press_Start_2P({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-pixel',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'ECS GAME — The Business Game',
  description: 'Gamifie ton activité commerciale. Gagne de l\'XP, monte en niveau, domine le leaderboard.',
  icons: {
    icon: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className="dark">
      <body className={`${inter.variable} ${rajdhani.variable} ${pressStart2P.variable} font-body`}>
        {children}
      </body>
    </html>
  );
}
