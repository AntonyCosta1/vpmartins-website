import fs from 'node:fs';
import path from 'node:path';
import { test, expect } from '@playwright/test';

const PAGES = ['index.html', 'projetos.html', 'orcamento.html', 'privacidade.html'];
const COPYRIGHT = '© 2026 Vanderlei Pereira Martins (VP Martins). Fotos: acervo próprio. Todos os direitos reservados.';

const read = (page) => fs.readFileSync(page, 'utf8');
const attr = (tag, name) => tag.match(new RegExp(`\\s${name}="([^"]*)"`))?.[1];
const tags = (html, name) => html.match(new RegExp(`<${name}\\b[^>]*>`, 'g')) ?? [];
const hrefs = (html, pattern) => tags(html, 'a').map((t) => attr(t, 'href')).filter((h) => h && pattern.test(h));
const count = (html, pattern) => (html.match(pattern) ?? []).length;
const text = (html) => html.replace(/<[^>]+>/g, ' ').replace(/&copy;/g, '©').replace(/\s+/g, ' ');
const block = (html, name) => html.match(new RegExp(`<${name}[\\s>][\\s\\S]*?</${name}>`))?.[0].replace(/\s+/g, ' ');

// O GitHub Pages diferencia maiúsculas de minúsculas e o Windows não.
function existsWithExactCase(relative) {
  let dir = '.';
  for (const part of relative.split('/')) {
    if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory() || !fs.readdirSync(dir).includes(part)) return false;
    dir = path.join(dir, part);
  }
  return true;
}

function localPaths(html) {
  const urls = [
    ...tags(html, 'a').map((t) => attr(t, 'href')),
    ...tags(html, 'link').map((t) => attr(t, 'href')),
    ...tags(html, 'img').map((t) => attr(t, 'src')),
    ...tags(html, 'script').map((t) => attr(t, 'src')),
  ];
  return urls
    .filter((u) => u && !/^(#|https?:|tel:|mailto:)/.test(u))
    .map((u) => decodeURI(u.split('#')[0].split('?')[0]))
    .filter(Boolean);
}

for (const page of PAGES) {
  test.describe(page, () => {
    test(`${page}: sem CDNs nem dados errados`, () => {
      const html = read(page);
      expect(html).not.toMatch(/cdn\.tailwindcss|unpkg\.com|cdnjs\.|fonts\.g(oogleapis|static)|cdn\.jsdelivr/);
      expect(html).not.toMatch(/5511999999999|99250-?8321|99150-?8321|gmail\.com\.br|vpmartinscomercial|vpmartinsinstaladora|#projetos\.html|youtube\.com|\b24h\b|formsubmit|<form\b/i);
      for (const tel of hrefs(html, /^tel:/)) expect(tel).toBe('tel:+5547991012690');
      for (const wa of hrefs(html, /wa\.me/)) expect(wa.startsWith('https://wa.me/5547991012690')).toBe(true);
    });

    test(`${page}: identificação legal e um único h1`, () => {
      const html = read(page);
      expect(count(html, /<h1[\s>]/g)).toBe(1);
      expect(html).toContain('04.982.483/0001-28');
      expect(html).toContain('href="privacidade.html"');
      expect(text(html)).toContain(COPYRIGHT);
    });

    test(`${page}: imagens descritas e com dimensões`, () => {
      for (const img of tags(read(page), 'img')) {
        expect(attr(img, 'alt'), img).toBeTruthy();
        expect(attr(img, 'width'), img).toBeTruthy();
        expect(attr(img, 'height'), img).toBeTruthy();
        expect(attr(img, 'src'), img).not.toMatch(/\s|%20/);
      }
    });

    test(`${page}: caminhos locais existem com a caixa exata`, () => {
      for (const local of localPaths(read(page))) {
        expect(existsWithExactCase(local), local).toBe(true);
      }
    });
  });
}

test('cabeçalho e rodapé idênticos nas 4 páginas', () => {
  const [first, ...others] = PAGES.map(read);
  for (const html of others) {
    expect(block(html, 'header')).toBe(block(first, 'header'));
    expect(block(html, 'footer')).toBe(block(first, 'footer'));
  }
});

test('limpeza: arquivos sem uso foram removidos', () => {
  for (const removed of ['PHPMailer-master', 'SETUP.md', 'img/3.jpg', 'img/construction-worker.jpg']) {
    expect(fs.existsSync(removed), removed).toBe(false);
  }
});
