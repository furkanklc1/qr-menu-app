import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const token = request.cookies.get('admin_token')?.value;

  // 1. KORUMALI ALANLAR (Mutfak, Dashboard, Products)
  // "/admin" ile başlıyorsa AMA tam olarak "/admin" değilse (yani alt sayfalar ise)
  if (path.startsWith('/admin') && path !== '/admin') {
    
    // Token yoksa -> Giriş sayfasına (/admin) yönlendir
    if (!token) {
      // ESKİDEN: new URL('/login', ...) idi.
      // YENİ:
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }

  // 2. GİRİŞ YAPMIŞ KULLANICIYI YÖNLENDİRME
  // Eğer zaten giriş yapmışsa (token varsa) ve giriş sayfasına (/admin) girmeye çalışıyorsa
  // Onu direkt mutfağa atalım.
  if (path === '/admin' && token) {
    return NextResponse.redirect(new URL('/admin/home', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/admin/:path*',
};