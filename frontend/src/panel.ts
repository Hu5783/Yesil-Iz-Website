import { fetchData, postData, deleteData } from './api';
import { SECTIONS, SectionId } from './sections';
import { card } from './dom';

interface Entry { id: number; section: SectionId; title: string; content: string; date: string; }
interface Volunteer { id: number; name: string; email: string; message: string; date: string; }

const entryForm = document.querySelector<HTMLFormElement>('#entry-form');
const entrySection = document.querySelector<HTMLSelectElement>('#entry-section');
const entryMessage = document.querySelector<HTMLParagraphElement>('#entry-message');
const filter = document.querySelector<HTMLSelectElement>('#filter-section');
const entryList = document.querySelector<HTMLDivElement>('#entry-list');
const volunteerList = document.querySelector<HTMLDivElement>('#volunteer-list');
const logoutBtn = document.querySelector<HTMLButtonElement>('#logout-btn');
if (!entryForm || !entrySection || !entryMessage || !filter || !entryList || !volunteerList || !logoutBtn) {
  throw new Error('Panel elemanları bulunamadı');
}

function fillOptions(select: HTMLSelectElement): void {
  for (const s of SECTIONS) {
    const option = document.createElement('option');
    option.value = s.id;
    option.textContent = s.label;
    select.append(option);
  }
}

// function yerine const arrow: TS, const'ların null kontrolünü arrow'ların içine taşır
const loadEntries = async (): Promise<void> => {
  const entries = await fetchData<Entry[]>(`/entries/${filter.value}`);
  entryList.replaceChildren(
    ...entries.map((e) =>
      card(e.title, e.content, e.date, async () => {
        if (!confirm('Silinsin mi?')) return;
        await deleteData(`/admin/entries/${e.id}`);
        await loadEntries();
      }),
    ),
  );
};

const loadVolunteers = async (): Promise<void> => {
  const list = await fetchData<Volunteer[]>('/admin/volunteers');
  volunteerList.replaceChildren(
    ...list.map((v) => card(`${v.name} (${v.email})`, v.message || '—', v.date)),
  );
};

entryForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  entryMessage.textContent = '';
  const data = new FormData(entryForm);
  const section = data.get('section');
  const title = data.get('title');
  const content = data.get('content');
  if (typeof section !== 'string' || typeof title !== 'string' || typeof content !== 'string') return;

  try {
    await postData('/admin/entries', { section, title, content });
    entryForm.reset();
    entryMessage.textContent = 'Yayınlandı';
    filter.value = section;
    await loadEntries();
  } catch {
    entryMessage.textContent = 'Yayınlanamadı';
  }
});

filter.addEventListener('change', loadEntries);

logoutBtn.addEventListener('click', async () => {
  await postData('/admin/logout', {});
  window.location.href = '/admin_login.html';
});

const init = async (): Promise<void> => {
  try {
    await fetchData('/admin/panel'); // oturum var mı? (cookie httpOnly, sunucuya soruyoruz)
  } catch {
    window.location.href = '/admin_login.html';
    return;
  }
  fillOptions(entrySection);
  fillOptions(filter);
  await Promise.all([loadEntries(), loadVolunteers()]);
};

init();