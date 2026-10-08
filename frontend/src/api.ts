const API_BASE_URL = 'http://localhost:5023/api';

export async function fetchData<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {credentials: 'include'});
  if (!response.ok) throw new Error('Ağ hatası oluştu');
  return response.json();
}

export async function postData<T>(endpoint: string, body: unknown): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {method: 'POST', body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' }, credentials: 'include'});
  if(!response.ok) throw new Error('Mesajı gönderirken hata oluştu');
  return response.json();

}