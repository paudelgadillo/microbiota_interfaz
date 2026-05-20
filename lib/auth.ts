import Cookies from 'js-cookie';

const TOKEN_KEY = 'ms_token';
const API_URL   = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export async function login(username: string, password: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body   : JSON.stringify({ username, password }),
    });

    if (!res.ok) return false;

    const data = await res.json();
    Cookies.set(TOKEN_KEY, data.access_token, {
      expires : 0.33,      // 8 horas
      sameSite: 'strict',
    });
    return true;
  } catch {
    return false;
  }
}

export function logout() {
  Cookies.remove(TOKEN_KEY);
}

export function getToken(): string | undefined {
  return Cookies.get(TOKEN_KEY);
}

export async function verificarSesion(): Promise<boolean> {
  const token = getToken();
  if (!token) return false;

  try {
    const res = await fetch(`${API_URL}/auth/verificar`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.ok;
  } catch {
    return false;
  }
}