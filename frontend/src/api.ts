const API_BASE_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:5023/api'
  : 'https://yesiliz-backend.vercel.app/api'; 
export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

async function request<T>(method: string, endpoint: string, body?: unknown): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    credentials: 'include',
    headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!response.ok) throw new HttpError(response.status, `HTTP ${response.status}`);
  return response.json();
}

export const fetchData = <T>(endpoint: string) => request<T>('GET', endpoint);
export const postData = <T>(endpoint: string, body: unknown) => request<T>('POST', endpoint, body);
export const deleteData = <T>(endpoint: string) => request<T>('DELETE', endpoint);