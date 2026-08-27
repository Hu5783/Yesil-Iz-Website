import { fetchData } from '../api';

interface Entry {
  id: number;
  title: string;
  content: string;
  date: string;
}

export async function renderSupportSection(): Promise<void> {
  const container = document.getElementById('support-entries-container');
  if (!container) return;

  try {
    const entries = await fetchData<Entry[]>('/support');
    container.innerHTML = entries.map(item => `
      <article class="entry-card">
        <h3>${item.title}</h3>
        <p>${item.content}</p>
        <small>${item.date}</small>
      </article>
    `).join('');
  } catch (err) {
    container.innerHTML = `<p>Veriler yüklenirken bir sorun oluştu.</p>`;
  }
}