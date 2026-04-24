const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handleResponse(response: Response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || `Request failed (${response.status})`);
  }
  return data;
}

export async function get(path: string, params?: Record<string, string | number>) {
  const url = new URL(BASE_URL + path, window.location.origin);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value));
      }
    });
  }
  const response = await fetch(url.toString(), { headers: getAuthHeaders() });
  return handleResponse(response);
}

export async function post(path: string, body: unknown) {
  const response = await fetch(BASE_URL + path, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
  });
  return handleResponse(response);
}

export async function put(path: string, body: unknown) {
  const response = await fetch(BASE_URL + path, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
  });
  return handleResponse(response);
}

export async function del(path: string) {
  const response = await fetch(BASE_URL + path, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
}

export async function upload(path: string, file: File) {
  const token = localStorage.getItem('token');
  const formData = new FormData();
  formData.append('image', file);
  const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};
  const response = await fetch(BASE_URL + path, {
    method: 'POST',
    headers,
    body: formData,
  });
  return handleResponse(response);
}
