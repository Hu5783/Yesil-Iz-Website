import { fetchData, postData, deleteData } from './api';
import { SECTIONS } from './sections';
import { card, el } from './dom';

interface Entry { id: number; section: string; title: string; content: string; date: string; }
interface Volunteer { id: number; name: string; email: string; message: string; date: string; }
interface Settings { isApplicationOpen: boolean; }

const entryForm = document.querySelector<HTMLFormElement>('#entry-form');
const entrySection = document.querySelector<HTMLSelectElement>('#entry-section');
const entryMessage = document.querySelector<HTMLParagraphElement>('#entry-message');
const filter = document.querySelector<HTMLSelectElement>('#filter-section');
const entryList = document.querySelector<HTMLDivElement>('#entry-list');
const volunteerList = document.querySelector<HTMLDivElement>('#volunteer-list');
const logoutBtn = document.querySelector<HTMLButtonElement>('#logout-btn');
const toggleAppBtn = document.querySelector<HTMLButtonElement>('#toggle-app-btn');
const appStatusText = document.querySelector<HTMLSpanElement>('#app-status-text');

if (!entryForm || !entrySection || !entryMessage || !filter || !entryList || !volunteerList || !logoutBtn) {
  throw new Error('Panel elemanları bulunamadı');
}

function fillOptions(select: HTMLSelectElement): void {
  select.replaceChildren();
  for (const s of SECTIONS) {
    const option = document.createElement('option');
    option.value = s.id;
    option.textContent = s.label;
    select.append(option);
  }
}

function fillFilterOptions(select: HTMLSelectElement): void {
  select.replaceChildren();
  const allOpt = document.createElement('option');
  allOpt.value = 'all';
  allOpt.textContent = 'Tümü (All)';
  select.append(allOpt);

  for (const s of SECTIONS) {
    const option = document.createElement('option');
    option.value = s.id;
    option.textContent = s.label;
    select.append(option);
  }
}

const updateAppStatusUI = (isOpen: boolean): void => {
  if (appStatusText) {
    appStatusText.textContent = isOpen ? 'AÇIK' : 'KAPALI';
    appStatusText.style.color = isOpen ? '#6b8e4e' : '#d9534f';
  }
  if (toggleAppBtn) {
    toggleAppBtn.textContent = isOpen ? 'Başvuruları Kapat' : 'Başvuruları Aç';
    toggleAppBtn.style.backgroundColor = isOpen ? '#d9534f' : '#6b8e4e';
    toggleAppBtn.style.color = '#ffffff';
  }
};

const checkAppStatus = async (): Promise<void> => {
  try {
    const settings = await fetchData<Settings>('/settings');
    updateAppStatusUI(settings.isApplicationOpen);
  } catch (err) {
    console.error('Başvuru durumu çekilemedi:', err);
    if (appStatusText) appStatusText.textContent = 'Hata oluştu';
  }
};

toggleAppBtn?.addEventListener('click', async () => {
  if (toggleAppBtn) toggleAppBtn.disabled = true;
  try {
    const res = await postData<Settings>('/admin/toggle-applications', {});
    updateAppStatusUI(res.isApplicationOpen);
  } catch {
    alert('Başvuru durumu değiştirilemedi.');
  } finally {
    if (toggleAppBtn) toggleAppBtn.disabled = false;
  }
});

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

  if (list.length === 0) {
    volunteerList.replaceChildren(el('p', '', 'Henüz başvuru bulunmuyor.'));
    return;
  }

  const table = document.createElement('table');
  table.className = 'admin-table';

  const thead = document.createElement('thead');
  thead.innerHTML = `
    <tr>
      <th>Tarih</th>
      <th>İsim</th>
      <th>E-posta</th>
      <th>Mesaj</th>
    </tr>
  `;
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  list.forEach((v) => {
    const tr = document.createElement('tr');

    const tdDate = el('td', '', v.date);
    const tdName = el('td', '', v.name);

    const tdEmail = document.createElement('td');
    const mailLink = el('a', '', v.email) as HTMLAnchorElement;
    mailLink.href = `mailto:${v.email}`;
    tdEmail.appendChild(mailLink);

    const tdMsg = el('td', '', v.message || '—');

    tr.append(tdDate, tdName, tdEmail, tdMsg);
    tbody.appendChild(tr);
  });

  table.appendChild(tbody);
  volunteerList.replaceChildren(table);
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
    await fetchData('/admin/panel');
  } catch {
    window.location.href = '/admin_login.html';
    return;
  }
  fillOptions(entrySection);
  fillFilterOptions(filter);
  await checkAppStatus(); // <-- Yükleniyor durumunu anında günceller
  await Promise.all([loadEntries(), loadVolunteers()]);
};

init();