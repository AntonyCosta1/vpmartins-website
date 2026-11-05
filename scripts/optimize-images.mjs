// Gera img/site/ a partir de scripts/images.json. Rodar de novo só ao mudar fotos.
import fs from 'node:fs';
import sharp from 'sharp';

const manifest = JSON.parse(fs.readFileSync('scripts/images.json', 'utf8'));
const COVER_LIMIT = 300 * 1024;
fs.rmSync('img/site', { recursive: true, force: true });
fs.mkdirSync('img/site', { recursive: true });

const sizes = {};
for (const item of manifest) {
  // Aplica a rotação antes, para o recorte valer sobre a foto em pé.
  const rotated = await sharp(item.src).rotate().toBuffer();
  const { width, height } = await sharp(rotated).metadata();
  const cropped = await sharp(rotated)
    .extract({ left: 0, top: 0, width, height: Math.round(height * (item.keepTop ?? 1)) })
    .toBuffer();

  const render = (maxWidth, quality) =>
    sharp(cropped)
      .resize({ width: maxWidth, withoutEnlargement: true })
      .webp({ quality })
      .toBuffer({ resolveWithObject: true });

  let quality = 72;
  let full = await render(1600, quality);
  while (item.slug === 'capa' && full.info.size > COVER_LIMIT && quality > 30) {
    quality -= 6;
    full = await render(1600, quality);
  }
  const thumb = await render(600, 68);

  fs.writeFileSync(`img/site/${item.slug}.webp`, full.data);
  fs.writeFileSync(`img/site/${item.slug}-thumb.webp`, thumb.data);
  sizes[item.slug] = {
    width: full.info.width,
    height: full.info.height,
    thumbWidth: thumb.info.width,
    thumbHeight: thumb.info.height,
  };
}
// O arquivo original do logo tem muita margem branca em volta.
const logo = await sharp('img/logovp.png').flatten({ background: '#ffffff' }).trim().resize({ height: 120 }).webp({ quality: 90 }).toBuffer({ resolveWithObject: true });
fs.writeFileSync('img/site/logo.webp', logo.data);
sizes.logo = { width: logo.info.width, height: logo.info.height };

fs.writeFileSync('scripts/image-sizes.json', `${JSON.stringify(sizes, null, 2)}\n`);
