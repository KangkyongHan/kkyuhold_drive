const BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export const apiFetch = async (endpoint: string, options: any = {}) => {
  const token = localStorage.getItem('accessToken');
  const headers = {
    ...options.headers,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  }).catch((err) => {
    console.error('Fetch error:', err);
    throw new Error('서버와 통신할 수 없습니다. 서버가 켜져 있는지 확인해 주세요.');
  });

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error('요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.');
    }
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.message || '요청 중 오류가 발생했습니다.');
  }

  if (response.status === 204) return null;
  return response.json();
};

export const apiUpload = async (endpoint: string, formData: FormData) => {
  const token = localStorage.getItem('accessToken');
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'POST',
    body: formData,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      // Do NOT set Content-Type, fetch handles multipart/form-data with boundary
    },
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.message || '업로드 중 오류가 발생했습니다.');
  }

  return response.json();
};
