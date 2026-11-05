import fs from 'node:fs';
import { test, expect } from '@playwright/test';

const manifestExists = fs.existsSync('scripts/images.json');
const manifest = manifestExists ? JSON.parse(fs.readFileSync('scripts/images.json', 'utf8')) : [];
const size = (file) => fs.statSync(file).size;

test('manifesto existe', () => {
  expect(manifestExists).toBe(true);
});

test('capa e miniaturas dentro do limite de tamanho', () => {
  expect(size('img/site/capa.webp')).toBeLessThanOrEqual(300 * 1024);
  for (const i of manifest) expect(size(`img/site/${i.slug}-thumb.webp`), i.slug).toBeLessThanOrEqual(100 * 1024);
});

test('galeria tem 27 fotos, 6 na prévia e sem a foto repetida', () => {
  expect(manifest.filter((i) => i.gallery)).toHaveLength(27);
  expect(manifest.filter((i) => i.preview)).toHaveLength(6);
  for (const fora of ['projeto2.webp', 'tubuVP.jpeg', '19.07.25', '19.10.37', '19.12.09', '19.12.12', '07.52.42']) {
    expect(manifest.some((i) => i.src.includes(fora)), fora).toBe(false);
  }
});

test('textos alternativos únicos e específicos, slugs seguros', () => {
  expect(new Set(manifest.map((i) => i.alt)).size).toBe(manifest.length);
  for (const i of manifest) {
    expect(i.slug).toMatch(/^[a-z0-9-]+$/);
    expect(i.alt).not.toMatch(/Projeto VP Martins|WhatsApp Image/);
    expect(fs.existsSync(i.src), i.src).toBe(true);
  }
});
