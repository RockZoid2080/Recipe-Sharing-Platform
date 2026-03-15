import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './Providers';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'RecipeShare - A Modern Culinary Experience',
  description: 'Discover, share, and enjoy premium recipes from around the world.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className="bg-mesh min-h-screen flex flex-col antialiased">
        <Providers>
          <Navbar />
          <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            {children}
          </main>
          {/* Subtle global gradient glow behind content */}
          <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[500px] bg-primary-500/20 rounded-full blur-[120px] -z-10 pointer-events-none opacity-50 mix-blend-screen" />
        </Providers>
      </body>
    </html>
  );
}
