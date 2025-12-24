// frontend/lib/api.ts

import Cookies from 'js-cookie';

// ESKİ HALİ:
// const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// YENİ HALİ (Sonuna /api ekliyoruz):
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'; 


export const getAuthToken = (): string | null => {
  return Cookies.get('admin_token') || null;
};

export const apiRequest = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> => {
  const token = getAuthToken();
  
  const headers: HeadersInit = {
    // FormData gönderirken Content-Type 'multipart/form-data' otomatik set edilmeli, 
    // bu yüzden manuel olarak 'application/json' set etmeden önce kontrol ediyoruz.
    ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Endpoint başında / varsa temizleyebiliriz veya olduğu gibi bırakabiliriz,
  // ancak API_BASE_URL sonu ve endpoint başı çakışmamalı.
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include', // CORS cookie paylaşımı için
  });

  if (response.status === 401) {
    // Sadece admin paneli içindeysek login'e atalım. 
    // Müşteri menüde gezerken 401 alırsa (örn: token süresi bitti) login'e gitmemeli.
    if (typeof window !== 'undefined' && window.location.pathname.includes('/admin')) {
        Cookies.remove('admin_token');
        window.location.href = '/admin';
    }
  }

  return response;
};

// ... Geri kalan helper fonksiyonlar aynı kalabilir ...
export const api = {
    get: (endpoint: string, options?: RequestInit) =>
      apiRequest(endpoint, { ...options, method: 'GET' }),
  
    post: (endpoint: string, data?: any, options?: RequestInit) =>
      apiRequest(endpoint, {
        ...options,
        method: 'POST',
        body: data ? JSON.stringify(data) : undefined,
      }),
  
    patch: (endpoint: string, data?: any, options?: RequestInit) =>
      apiRequest(endpoint, {
        ...options,
        method: 'PATCH',
        body: data ? JSON.stringify(data) : undefined,
      }),
  
    delete: (endpoint: string, options?: RequestInit) =>
      apiRequest(endpoint, { ...options, method: 'DELETE' }),
  
    postFormData: (endpoint: string, formData: FormData, options?: RequestInit) => {
      // apiRequest içinde FormData kontrolü ekledim, direkt orayı kullanabiliriz
      // ama özel header yönetimi için burası kalabilir.
      const token = getAuthToken();
      const headers: HeadersInit = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
  
      return fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        method: 'POST',
        headers,
        body: formData,
        credentials: 'include',
      });
    },

    patchFormData: (endpoint: string, formData: FormData, options?: RequestInit) => {
        const token = getAuthToken();
        const headers: HeadersInit = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;
    
        return fetch(`${API_BASE_URL}${endpoint}`, {
          ...options,
          method: 'PATCH',
          headers,
          body: formData,
          credentials: 'include',
        });
      },
};