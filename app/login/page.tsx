'use client';
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { login } from '@/lib/auth';

function LoginForm() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const redirect     = searchParams.get('redirect') || '/';

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [cargando, setCargando] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      setError('Completa todos los campos.');
      return;
    }
    setCargando(true);
    setError('');

    const ok = await login(username, password);

    if (ok) {
      router.push(redirect);
    } else {
      setError('Usuario o contraseña incorrectos.');
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f2f8] flex items-center justify-center px-4">
      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-md p-10 w-full max-w-md flex flex-col gap-6">

        {/* Logo */}
        <div className="flex flex-col items-center gap-2 mb-2">
          <div className="w-14 h-14 rounded-full bg-[#0f1f3d] flex items-center justify-center">
            <span className="text-white text-lg font-semibold tracking-tight">MS</span>
          </div>
          <h1 className="text-xl font-semibold text-[#0f1f3d]">Microbiota Score</h1>
          <p className="text-xs text-gray-400">Portal de análisis clínico</p>
        </div>

        {/* Campos */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Usuario
            </label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              placeholder="admin"
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#0f1f3d]/10 focus:border-[#0f1f3d]/40 transition-all"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              placeholder="••••••••"
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#0f1f3d]/10 focus:border-[#0f1f3d]/40 transition-all"
            />
          </div>

          {error && (
            <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5">
              {error}
            </p>
          )}

          <button
            onClick={handleLogin}
            disabled={cargando}
            className="bg-[#0f1f3d] hover:bg-[#1a3060] text-white font-semibold py-2.5 rounded-xl text-sm transition-all disabled:opacity-50 mt-2"
          >
            {cargando ? 'Verificando...' : 'Iniciar sesión'}
          </button>
        </div>

      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}