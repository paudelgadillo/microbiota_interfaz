'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const path = usePathname();
  const [colapsado, setColapsado] = useState(false);

  const links = [
    { href: '/',        label: 'Dashboard',      icon: 'ti-layout-dashboard' },
    { href: '/nuevo',   label: 'Nuevo Paciente', icon: 'ti-user-plus' },
    { href: '/buscar',  label: 'Buscar por ID',  icon: 'ti-search' },
  ];

  return (
    <aside 
      className={`${
        colapsado ? 'w-20' : 'w-64'
      } bg-white border-r border-[#e8e4db] sticky top-0 h-screen flex flex-col py-6 shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-50 transition-all duration-300 ease-in-out shrink-0 overflow-x-hidden`}
    >
      
      {/* ── BOTÓN HAMBURGUESA ── */}
      <div className={`flex items-center px-6 mb-8 h-10 transition-all duration-300 ${colapsado ? 'justify-center px-0' : 'justify-between'}`}>
        <span className={`text-[10px] font-bold text-gray-400 uppercase tracking-widest transition-all duration-300 whitespace-nowrap overflow-hidden ${colapsado ? 'w-0 opacity-0' : 'w-10 opacity-100'}`}>
          Menú
        </span>
        <button 
          onClick={() => setColapsado(!colapsado)}
          className="flex flex-col gap-1.5 items-center justify-center p-2 rounded-xl text-gray-500 hover:text-[#8c3a5d] hover:bg-[#fcfbf9] transition-all group outline-none shrink-0"
        >
          <span className="block w-5 h-0.5 bg-current rounded-full group-hover:bg-[#8c3a5d]"></span>
          <span className="block w-5 h-0.5 bg-current rounded-full group-hover:bg-[#8c3a5d]"></span>
          <span className="block w-5 h-0.5 bg-current rounded-full group-hover:bg-[#8c3a5d]"></span>
        </button>
      </div>

      {/* ── LOGO DEL PROYECTO ── */}
      <div className="flex items-center gap-3 px-6 mb-10 overflow-hidden">
        <div className="relative w-10 h-10 rounded-full overflow-hidden shadow-sm border border-[#e8e4db] shrink-0 transition-transform duration-300">
          <Image 
            src="/nuevo_logo.png" 
            alt="Microbiota Score Logo" 
            fill
            className="object-cover"
          />
        </div>
        <div className={`flex flex-col justify-center transition-all duration-300 overflow-hidden ${colapsado ? 'w-0 opacity-0' : 'w-32 opacity-100'}`}>
          <h1 className="font-bold text-[#2d2828] text-lg leading-none whitespace-nowrap">Microbiota</h1>
          <span className="text-xs text-gray-500 font-medium whitespace-nowrap mt-0.5">Score</span>
        </div>
      </div>

      {/* ── NAVEGACIÓN PRINCIPAL ── */}
      <nav className="flex flex-col gap-2 flex-1 overflow-hidden px-4">
        {links.map(l => {
          const active = path === l.href;
          return (
            <Link
              key={l.href}
              href={l.href}
              title={colapsado ? l.label : ''}
              className={`flex items-center gap-3 py-3.5 rounded-xl text-sm font-semibold transition-all duration-300 ease-in-out ${
                colapsado ? 'px-0 justify-center' : 'px-4'
              } ${
                active && !colapsado
                  ? 'bg-[#8c3a5d] text-white shadow-md shadow-[#8c3a5d]/20' 
                  : active && colapsado
                  ? 'text-[#8c3a5d] bg-[#fdfbf7]' 
                  : 'text-gray-500 hover:bg-[#fcfbf9] hover:text-[#8c3a5d]'
              }`}
            >
              <i className={`ti ${l.icon} text-xl shrink-0 transition-transform duration-300`} aria-hidden />
              
              {/* Animación fluida del texto: en lugar de desaparecer, su ancho se va a cero */}
              <span className={`whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out ${
                colapsado ? 'w-0 opacity-0' : 'w-32 opacity-100'
              }`}>
                {l.label}
              </span>
            </Link>
          );
        })}
      </nav>

    </aside>
  );
}