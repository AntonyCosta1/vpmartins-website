const toggle = document.getElementById('menu-toggle');
const menu = document.getElementById('menu-principal');

function setMenuOpen(open) {
  menu.classList.toggle('is-open', open);
  toggle.setAttribute('aria-expanded', String(open));
  toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
}

toggle.addEventListener('click', () => setMenuOpen(!menu.classList.contains('is-open')));
menu.addEventListener('click', (event) => {
  if (event.target.closest('a')) setMenuOpen(false);
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && menu.classList.contains('is-open')) {
    setMenuOpen(false);
    toggle.focus();
  }
});

const lightbox = document.getElementById('lightbox');
if (lightbox) {
  const galeria = document.getElementById('galeria');
  const closeLightbox = () => lightbox.close();

  galeria.addEventListener('click', (event) => {
    const link = event.target.closest('a');
    if (!link || event.ctrlKey || event.metaKey || event.shiftKey) return;
    event.preventDefault();
    const photo = document.createElement('img');
    photo.src = link.getAttribute('href');
    photo.alt = link.querySelector('img').alt;
    photo.className = 'block max-h-[95vh] max-w-[95vw] object-contain';
    lightbox.append(photo);
    lightbox.showModal();
  });

  // Clique fora da foto cai no próprio dialog, que é o fundo.
  lightbox.addEventListener('click', (event) => {
    if (event.target === lightbox) closeLightbox();
  });
  document.getElementById('lightbox-fechar').addEventListener('click', closeLightbox);
  lightbox.addEventListener('close', () => lightbox.querySelector('img')?.remove());
}
