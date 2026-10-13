import { HttpError, postData } from './api';

const form = document.querySelector<HTMLFormElement>('#login-form');
const errorBox = document.querySelector<HTMLParagraphElement>('#login-error');
if (!form || !errorBox) {
  throw new Error('Gerekli elemanlar bulunamadı');
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  errorBox.textContent = '';

  const data = new FormData(form);
  const email = data.get('email');
  const password = data.get('password');

  if (typeof email !== 'string' || typeof password !== 'string') {
    errorBox.textContent = 'E-posta ve şifre gerekli';
    return;
  }

  try {
    await postData<{ message: string }>('/admin/login', { email, password });
    window.location.href = '/admin.html';
  } catch (error) {
    errorBox.textContent =
      error instanceof HttpError && error.status === 401
        ? 'E-posta veya şifre hatalı'
        : 'Sunucuya ulaşılamadı, tekrar dene';
  }
});