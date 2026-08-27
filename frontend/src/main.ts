import { renderSupportSection } from './components/support';

// Sekme Yönetimi
const buttons = document.querySelectorAll<HTMLButtonElement>('.nav-btn');
const tabs = document.querySelectorAll<HTMLElement>('.tab-content');

buttons.forEach((btn) => {
  btn.addEventListener('click', () => {
    const targetTab = btn.getAttribute('data-tab');

    buttons.forEach((b) => b.classList.remove('active'));
    tabs.forEach((t) => t.classList.remove('active'));

    btn.classList.add('active');
    if (targetTab) {
      document.getElementById(targetTab)?.classList.add('active');
      
      // İlgili sekme açıldığında dinamik içeriği yükle
      if (targetTab === 'support') renderSupportSection();
    }
  });
});