const BASE_URL = '/api';

class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  adminToken?: string
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (adminToken) {
    headers['Authorization'] = `Bearer ${adminToken}`;
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new ApiError(response.status, body.error || 'Request failed');
  }

  // Handle CSV downloads
  const contentType = response.headers.get('Content-Type') || '';
  if (contentType.includes('text/csv')) {
    return (await response.text()) as unknown as T;
  }

  return response.json();
}

// Participants
export const participantsApi = {
  register: (pseudonym: string) =>
    request<{ pseudonym: string; message: string }>('/participants', {
      method: 'POST',
      body: JSON.stringify({ pseudonym }),
    }),

  get: (pseudonym: string) =>
    request<{ pseudonym: string; created_at: string }>(`/participants/${encodeURIComponent(pseudonym)}`),
};

// Sessions
export const sessionsApi = {
  log: (data: {
    pseudonym: string;
    session_date: string;
    duration_minutes: number;
    word_count: number;
    topic: string;
  }) =>
    request('/sessions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getForParticipant: (
    pseudonym: string,
    params?: { from?: string; to?: string; limit?: number; offset?: number }
  ) => {
    const qs = new URLSearchParams();
    if (params?.from) qs.set('from', params.from);
    if (params?.to) qs.set('to', params.to);
    if (params?.limit !== undefined) qs.set('limit', String(params.limit));
    if (params?.offset !== undefined) qs.set('offset', String(params.offset));
    const query = qs.toString() ? `?${qs.toString()}` : '';
    return request<import('../types').Session[]>(`/sessions/${encodeURIComponent(pseudonym)}${query}`);
  },
};

// Admin
export const adminApi = {
  login: (password: string) =>
    request<{ token: string; expiresAt: string }>('/admin/login', {
      method: 'POST',
      body: JSON.stringify({ password }),
    }),

  getStats: (token: string) =>
    request<import('../types').AdminStats>('/admin/stats', {}, token),

  getParticipants: (token: string) =>
    request<import('../types').AdminParticipantSummary[]>('/admin/participants', {}, token),

  getParticipantDetail: (pseudonym: string, token: string) =>
    request<import('../types').AdminParticipantDetail>(
      `/admin/participants/${encodeURIComponent(pseudonym)}`,
      {},
      token
    ),

  exportCsv: (token: string, pseudonym?: string) => {
    const qs = pseudonym ? `?pseudonym=${encodeURIComponent(pseudonym)}` : '';
    return request<string>(`/admin/export${qs}`, {}, token);
  },
};

export { ApiError };
