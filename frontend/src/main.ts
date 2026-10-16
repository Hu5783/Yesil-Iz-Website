import { renderEntries } from './components/entries';
import { initVolunteerForm } from './components/volunteer';

const tabButtons = document.querySelectorAll<HTMLButtonElement>('[data-tab]');
const tabs = document.querySelectorAll<HTMLElement>('.tab-content');
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('sidebar-overlay');
const folder = document.querySelector('.sidebar-folder');

const setMenu = (open: boolean): void => {
  sidebar?.classList.toggle('active', open);
  overlay?.classList.toggle('active', open);
};

tabButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    const target = btn.dataset.tab;
    if (!target) return;

    tabButtons.forEach((b) => b.classList.toggle('active', b.dataset.tab === target));
    tabs.forEach((t) => t.classList.toggle('active', t.id === target));
    window.scrollTo({ top: 0 });
    setMenu(false); 
    renderEntries(target);
  });
});

document.getElementById('menu-toggle')?.addEventListener('click', () => setMenu(true));
document.getElementById('menu-close')?.addEventListener('click', () => setMenu(false));
overlay?.addEventListener('click', () => setMenu(false));
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') setMenu(false);
});
document.getElementById('projects-folder-btn')?.addEventListener('click', () => folder?.classList.toggle('open'));

initVolunteerForm();