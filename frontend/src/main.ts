import { renderEntries } from './components/entries';
import { initVolunteerForm } from './components/volunteer';

const buttons = document.querySelectorAll<HTMLButtonElement>('[data-tab]');
const tabs = document.querySelectorAll<HTMLElement>('.tab-content');
const navbar = document.querySelector<HTMLElement>('.navbar');

buttons.forEach((btn) => {
  btn.addEventListener('click', () => {
    const targetTab = btn.dataset.tab;
    if (!targetTab) return;

    buttons.forEach((b) => b.classList.remove('active'));
    tabs.forEach((t) => t.classList.remove('active'));

    btn.classList.add('active');
    document.getElementById(targetTab)?.classList.add('active');
    window.scrollTo({ top: 0 }); // yeni sekme sayfanın başından açılsın
    btn.blur();

    renderEntries(targetTab);
  });
});

window.addEventListener('scroll', () => {
  navbar?.classList.toggle('scrolled', window.scrollY > 50);
});

initVolunteerForm();