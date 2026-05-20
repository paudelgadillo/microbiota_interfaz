'use client';
import { useRouter } from 'next/navigation';
import { logout } from '@/lib/auth';

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-gray-600 transition-colors"
    >
      <i className="ti ti-logout" aria-hidden style={{ fontSize: 15 }} />
      Cerrar sesión
    </button>
  );
}