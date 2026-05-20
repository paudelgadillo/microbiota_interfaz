import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const RUTAS_PUBLICAS  = ['/login'];
const TOKEN_KEY       = 'ms_token';
const SECRET_KEY      = process.env.JWT_SECRET_KEY || '';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (RUTAS_PUBLICAS.includes(pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get(TOKEN_KEY)?.value;

  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const secret = new TextEncoder().encode(SECRET_KEY);
    await jwtVerify(token, secret);
    return NextResponse.next();
  } catch {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete(TOKEN_KEY);
    return response;
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|mascotas).*)',
  ],
};