import Cookies from 'js-cookie';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Token'ı cookie'den al
export const getAuthToken = (): string | null => {
  return Cookies.get('admin_token') || null;
};

// API isteği yap
export const apiRequest = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> => {
  const token = getAuthToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Token varsa Authorization header'ına ekle
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  // 401 Unauthorized durumunda token'ı sil ve login sayfasına yönlendir
  if (response.status === 401) {
    Cookies.remove('admin_token');
    if (typeof window !== 'undefined' && !window.location.pathname.includes('/admin')) {
      window.location.href = '/admin';
    }
  }

  return response;
};

// API helper fonksiyonları
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

  // Form data için özel method
  postFormData: (endpoint: string, formData: FormData, options?: RequestInit) => {
    const token = getAuthToken();
    const headers: HeadersInit = {};
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

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
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      method: 'PATCH',
      headers,
      body: formData,
      credentials: 'include',
    });
  },
};

