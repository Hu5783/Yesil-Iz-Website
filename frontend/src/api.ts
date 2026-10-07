const API_BASE_URL = 'http://localhost:5023/api';

export async function fetchData<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`);
  if (!response.ok) throw new Error('Ağ hatası oluştu');
  return response.json();
}
