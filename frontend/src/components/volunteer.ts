import { postData, HttpError } from '../api';

export function initVolunteerForm(): void {
  const form = document.querySelector<HTMLFormElement>('#volunteer-form');
  const message = document.querySelector<HTMLParagraphElement>('#volunteer-message');
  if (!form || !message) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    message.textContent = '';

    const data = new FormData(form);
    const name = data.get('name');
    const email = data.get('email');
    const text = data.get('message');
    if (typeof name !== 'string' || typeof email !== 'string' || typeof text !== 'string') return;

    try {
      await postData('/volunteers', {
        name,
        email,
        message: text,
        consent: data.get('consent') === 'on',
      });
      form.reset();
      message.textContent = 'Thank you! Your application has been received.';
    } catch (error) {
      message.textContent =
        error instanceof HttpError && error.status === 429
          ? 'Too many attempts. Please try again later.'
          : 'Something went wrong. Please check your details and try again.';
    }
  });
}