import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import Sidebar from '@/components/Sidebar';
import './globals.css';

// 1. Configuración de la fuente Poppins
const poppins = Poppins({ 
  subsets: ['latin'],
  // Poppins requiere que especifiques los grosores (weights) que vas a utilizar.
  // 300=Light, 400=Normal, 500=Medium, 600=SemiBold, 700=Bold
  weight: ['300', '400', '500', '600', '700'], 
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Microbiota Score',
  description: 'Portal de análisis clínico de salud intestinal',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      {/* 2. Se aplica la clase de Poppins (poppins.className) directamente al body */}
      <body className={`${poppins.className} bg-[#fdfbf7] text-[#2d2828] flex min-h-screen overflow-x-hidden`}>
        <Sidebar />
        <main className="flex-1 flex flex-col min-h-screen w-full transition-all duration-300">
          {children}
        </main>
      </body>
    </html>
  );
}