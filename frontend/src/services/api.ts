import {
  User,
  Book,
  ShelfItem,
  ShelfType,
  Review,
  Thread,
  Post,
  DashboardStats,
  ReadingChartPoint,
  AIRecommendationResponse,
} from '../types';

const BASE_URL = '/api/v1';

export function getToken(): string | null {
  return localStorage.getItem('noveli_token');
}

export function setToken(token: string): void {
  localStorage.setItem('noveli_token', token);
}

export function clearToken(): void {
  localStorage.removeItem('noveli_token');
}

let isRefreshing = false;
let refreshSubscribers: ((token: string | null) => void)[] = [];

function onTokenRefreshed(token: string | null) {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
}

function addRefreshSubscriber(callback: (token: string | null) => void) {
  refreshSubscribers.push(callback);
}

async function refreshAccessToken(): Promise<string | null> {
  try {
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      clearToken();
      return null;
    }

    const data = await res.json();
    if (data.accessToken) {
      setToken(data.accessToken);
      return data.accessToken;
    }
    return null;
  } catch {
    clearToken();
    return null;
  }
}

async function fetchWithAuth<T>(endpoint: string, options: RequestInit = {}, retry = true): Promise<T> {
  const token = getToken();
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    credentials: 'include',
    headers,
  });

  if (res.status === 401 && retry && !endpoint.startsWith('/auth/login') && !endpoint.startsWith('/auth/refresh') && !endpoint.startsWith('/auth/register')) {
    if (!isRefreshing) {
      isRefreshing = true;
      const newToken = await refreshAccessToken();
      isRefreshing = false;
      onTokenRefreshed(newToken);

      if (newToken) {
        return fetchWithAuth<T>(endpoint, options, false);
      }
    } else {
      return new Promise<T>((resolve, reject) => {
        addRefreshSubscriber((newToken) => {
          if (newToken) {
            resolve(fetchWithAuth<T>(endpoint, options, false));
          } else {
            reject(new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.'));
          }
        });
      });
    }
  }

  if (!res.ok) {
    let errorMsg = 'Đã có lỗi xảy ra';
    try {
      const data = await res.json();
      errorMsg = data.error || errorMsg;
    } catch {
      // ignore
    }
    throw new Error(errorMsg);
  }

  return res.json() as Promise<T>;
}

export const api = {
  // ── Auth ─────────────────────────────────────────────
  login: async (biDanh: string, password: string): Promise<{ user: User; accessToken: string }> => {
    const res = await fetchWithAuth<{ user: User; accessToken: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ biDanh, password }),
    });
    setToken(res.accessToken);
    return res;
  },

  register: async (biDanh: string, password: string): Promise<{ user: User; accessToken: string; recoveryKey: string }> => {
    const res = await fetchWithAuth<{ user: User; accessToken: string; recoveryKey: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ biDanh, password }),
    });
    setToken(res.accessToken);
    return res;
  },

  getMe: async (): Promise<{ user: User }> => {
    return fetchWithAuth<{ user: User }>('/auth/me');
  },

  updateMe: async (data: { avatarSeed?: string; preferences?: Record<string, unknown> }): Promise<{ user: User }> => {
    return fetchWithAuth<{ user: User }>('/auth/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  changePassword: async (currentPassword: string, newPassword: string): Promise<{ message: string }> => {
    return fetchWithAuth<{ message: string }>('/auth/password', {
      method: 'PATCH',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },

  recoverPassword: async (biDanh: string, recoveryKey: string, newPassword: string): Promise<{ message: string }> => {
    return fetchWithAuth<{ message: string }>('/auth/recover', {
      method: 'POST',
      body: JSON.stringify({ biDanh, recoveryKey, newPassword }),
    });
  },

  refreshToken: async (): Promise<string | null> => {
    return refreshAccessToken();
  },

  logout: async (): Promise<void> => {
    try {
      await fetchWithAuth('/auth/logout', { method: 'POST' }, false);
    } catch {
      // ignore network errors on logout
    } finally {
      clearToken();
    }
  },

  logoutAll: async (): Promise<void> => {
    try {
      await fetchWithAuth('/auth/logout-all', { method: 'POST' }, false);
    } catch {
      // ignore network errors
    } finally {
      clearToken();
    }
  },

  // ── Books ────────────────────────────────────────────
  getBooks: async (params?: { category?: string; search?: string; page?: number; limit?: number }): Promise<{ books: Book[]; pagination: { page: number; limit: number; total: number; totalPages: number } }> => {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.set('category', params.category);
    if (params?.search) searchParams.set('search', params.search);
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));

    const qs = searchParams.toString();
    return fetchWithAuth(`/books${qs ? `?${qs}` : ''}`);
  },

  searchGoogleBooks: async (query: string): Promise<{ books: Book[]; source: string }> => {
    return fetchWithAuth(`/books/search?q=${encodeURIComponent(query)}`);
  },

  getBookDetail: async (id: string): Promise<{ book: Book }> => {
    return fetchWithAuth(`/books/${id}`);
  },

  getBookReviews: async (bookId: string): Promise<{ reviews: Review[]; pagination: unknown }> => {
    return fetchWithAuth(`/books/${bookId}/reviews`);
  },

  addReview: async (bookId: string, review: { rating: number; content: string; hasSpoilers: boolean; isAnonymous: boolean; anonymousAlias?: string }): Promise<{ review: Review }> => {
    return fetchWithAuth(`/books/${bookId}/reviews`, {
      method: 'POST',
      body: JSON.stringify(review),
    });
  },

  // ── Shelves ──────────────────────────────────────────
  getUserShelves: async (type?: ShelfType): Promise<{ shelves: ShelfItem[] }> => {
    const qs = type ? `?type=${type}` : '';
    return fetchWithAuth(`/shelves${qs}`);
  },

  upsertShelf: async (bookId: string, type: ShelfType): Promise<{ shelf: ShelfItem }> => {
    return fetchWithAuth('/shelves', {
      method: 'PUT',
      body: JSON.stringify({ bookId, type }),
    });
  },

  updateProgress: async (bookId: string, currentPage: number): Promise<{ shelf: ShelfItem; isFinished: boolean }> => {
    return fetchWithAuth(`/shelves/${bookId}/progress`, {
      method: 'PATCH',
      body: JSON.stringify({ currentPage }),
    });
  },

  removeFromShelf: async (bookId: string): Promise<{ success: boolean }> => {
    return fetchWithAuth(`/shelves/${bookId}`, {
      method: 'DELETE',
    });
  },

  // ── Analytics & Stats ────────────────────────────────
  getDashboard: async (): Promise<DashboardStats> => {
    return fetchWithAuth('/analytics/dashboard');
  },

  getReadingChart: async (days = 7): Promise<{ chartData: ReadingChartPoint[] }> => {
    return fetchWithAuth(`/analytics/reading-chart?days=${days}`);
  },

  // ── Reading Logs ─────────────────────────────────────
  logReadingSession: async (log: { bookId: string; startPage: number; endPage: number; durationMinutes: number; note?: string }): Promise<unknown> => {
    const pagesRead = Math.max(0, log.endPage - log.startPage);
    return fetchWithAuth('/reading-logs/sync', {
      method: 'POST',
      body: JSON.stringify({
        logs: [
          {
            clientLogId: crypto.randomUUID(),
            bookId: log.bookId,
            startPage: log.startPage,
            endPage: log.endPage,
            pagesRead,
            durationMinutes: log.durationMinutes,
            note: log.note,
            loggedAt: new Date().toISOString(),
          },
        ],
      }),
    });
  },

  // ── Anonymous Forum ──────────────────────────────────
  getThreads: async (params?: { bookId?: string; page?: number; limit?: number }): Promise<{ threads: Thread[]; pagination: unknown }> => {
    const searchParams = new URLSearchParams();
    if (params?.bookId) searchParams.set('bookId', params.bookId);
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));

    const qs = searchParams.toString();
    return fetchWithAuth(`/forum/threads${qs ? `?${qs}` : ''}`);
  },

  getThread: async (threadId: string): Promise<{ thread: Thread }> => {
    return fetchWithAuth(`/forum/threads/${threadId}`);
  },

  getThreadPosts: async (threadId: string): Promise<{ posts: Post[]; nextCursor: string | null; hasMore: boolean }> => {
    return fetchWithAuth(`/forum/threads/${threadId}/posts`);
  },

  createThread: async (data: { title: string; content: string; tags: string[]; hasSpoilers: boolean; bookId?: string }): Promise<{ thread: Thread }> => {
    return fetchWithAuth('/forum/threads', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  createPost: async (data: { threadId: string; content: string; hasSpoilers: boolean; parentPostId?: string }): Promise<{ post: Post }> => {
    return fetchWithAuth('/forum/posts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // ── AI Recommendations ───────────────────────────────
  getAIRecommendations: async (moodPrompt?: string): Promise<AIRecommendationResponse> => {
    return fetchWithAuth('/ai/recommendations', {
      method: 'POST',
      body: JSON.stringify({ moodPrompt: moodPrompt || '' }),
    });
  },
};
