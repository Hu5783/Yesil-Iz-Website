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

// Navbar scroll efekti
const navbar = document.querySelector('.navbar') as HTMLElement;
window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    navbar?.classList.add('scrolled');
  } else {
    navbar?.classList.remove('scrolled');
  }
});

// Projeler için..
document.querySelectorAll('[data-tab]').forEach((button) => {
  button.addEventListener('click', (e) => {
    const targetTab = (e.currentTarget as HTMLElement).getAttribute('data-tab');

    document.querySelectorAll('.tab-content').forEach((section) => {
      section.classList.remove('active');
    });

    if (targetTab) {
      document.getElementById(targetTab)?.classList.add('active');
    }
  });
});

document.addEventListener('DOMContentLoaded', () => {
  const tabButtons = document.querySelectorAll<HTMLElement>('[data-tab]');
  const tabContents = document.querySelectorAll<HTMLElement>('.tab-content');

  tabButtons.forEach((button) => {
    button.addEventListener('click', (event) => {
      const targetButton = event.currentTarget as HTMLElement;
      const targetTabId = targetButton.dataset.tab;

      if (!targetTabId) return;

      tabContents.forEach((section) => {
        section.classList.remove('active');
      });

      const selectedSection = document.getElementById(targetTabId);
      if (selectedSection) {
        selectedSection.classList.add('active');
      }

      tabButtons.forEach((btn) => btn.classList.remove('active'));
      targetButton.classList.add('active');

      targetButton.blur();
    });
  });
});