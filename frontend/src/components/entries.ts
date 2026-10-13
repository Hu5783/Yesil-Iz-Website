import { fetchData } from '../api';
import { card } from '../dom';

interface Entry { id: number; title: string; content: string; date: string; }

export async function renderEntries(section: string): Promise<void> {
  const container = document.getElementById(`${section}-entries`);
  if (!container) return; // 'home' gibi içeriksiz sekmeler burada çıkar
  try {
    const entries = await fetchData<Entry[]>(`/entries/${section}`);
    container.replaceChildren(...entries.map((e) => card(e.title, e.content, e.date)));
  } catch {
    container.textContent = 'Veriler yüklenirken bir sorun oluştu.';
  }
}