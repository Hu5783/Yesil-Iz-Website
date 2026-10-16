export function el<K extends keyof HTMLElementTagNameMap>(tag: K, className = '', text = ''): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  node.textContent = text; // innerHTML değil: içeriğe girilen HTML çalışmaz (XSS)
  return node;
}

export function card(title: string, body: string, meta: string, onDelete?: () => void): HTMLElement {
  const footer = el('div', 'card-footer');
  footer.append(el('small', '', meta));

  if (onDelete) {
    const btn = el('button', 'delete-btn', 'Sil');
    btn.type = 'button';
    btn.addEventListener('click', onDelete);
    footer.append(btn);
  }

  const article = el('article', 'entry-card');
  article.append(el('h3', '', title), el('p', '', body), footer);
  return article;
}