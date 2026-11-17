const getBaseUrl = () => {
  let url = process.env.NEXT_PUBLIC_API_URL;
  // Vercel 환경변수가 비어있거나 누락된 경우 기본 Render 백엔드로 자동 직결
  if (!url || url === '/api') {
    return 'https://kkyuhold-drive-api.onrender.com/api';
  }
  url = url.replace(/\/+$/, ''); // 끝에 붙은 슬래시 제거
  if (url.startsWith('http') && !url.endsWith('/api')) {
    url += '/api'; // 도메인만 입력된 경우 자동으로 /api 붙임
  }
  return url;
};

export const BASE_URL = getBaseUrl();

export const getFileViewUrl = (fileId: string, token: string | null) => {
  return `${BASE_URL}/drive/files/${fileId}/view${token ? `?token=${token}` : ''}`;
};

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
    const errorMsg = Array.isArray(errorBody.message)
      ? errorBody.message.join('\n')
      : (errorBody.message || `요청 실패 (HTTP ${response.status})\n[호출 주소: ${BASE_URL}${endpoint}]`);
    throw new Error(errorMsg);
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
    const errorMsg = Array.isArray(errorBody.message)
      ? errorBody.message.join('\n')
      : (errorBody.message || '업로드 중 오류가 발생했습니다.');
    throw new Error(errorMsg);
  }

  return response.json();
};
