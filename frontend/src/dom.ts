export function card(title: string, body: string, meta: string, onDelete?: () => void): HTMLElement {
  const article = document.createElement('article');
  article.className = 'entry-card';

  const h3 = document.createElement('h3');
  h3.textContent = title;
  const p = document.createElement('p');
  p.textContent = body;
  const small = document.createElement('small');
  small.textContent = meta;
  article.append(h3, p, small);

  if (onDelete) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = 'Sil';
    btn.addEventListener('click', onDelete);
    article.append(btn);
  }
  return article;
}