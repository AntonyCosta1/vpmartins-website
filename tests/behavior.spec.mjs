import { test, expect } from '@playwright/test';
import fs from 'node:fs';

test.describe('página inicial', () => {
  test('menu abre no celular', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto('/index.html');
    const toggle = page.locator('#menu-toggle');
    const menu = page.locator('#menu-principal');
    await expect(menu).toBeHidden();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await toggle.click();
    await expect(menu).toBeVisible();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  });

  test('menu sem JavaScript continua acessível no celular', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 360, height: 740 } });
    const page = await context.newPage();
    await page.goto('http://localhost:4173/index.html');
    await expect(page.locator('#menu-principal').getByRole('link', { name: 'Portfólio' })).toBeVisible();
    await context.close();
  });

  test('links do portfólio apontam para a galeria', async ({ page }) => {
    await page.goto('/index.html');
    await expect(page.locator('#menu-principal').getByRole('link', { name: 'Portfólio' })).toHaveAttribute('href', 'projetos.html');
  });

  test('capa mostra o título principal sem carrossel', async ({ page }) => {
    await page.goto('/index.html');
    await expect(page.locator('h1')).toContainText('Projetos Hidráulicos e Elétricos com Precisão');
    await expect(page.locator('.swiper')).toHaveCount(0);
  });

  test('sem boletim e sem botão de vídeo', async ({ page }) => {
    await page.goto('/index.html');
    await expect(page.locator('input[placeholder="Seu e-mail"]')).toHaveCount(0);
    await expect(page.getByRole('link', { name: 'Assistir Vídeo' })).toHaveCount(0);
  });

  test('prévia do portfólio tem 6 fotos e link para a galeria', async ({ page }) => {
    await page.goto('/index.html');
    await expect(page.locator('#portfolio img')).toHaveCount(6);
    await expect(page.locator('#portfolio a[href="projetos.html"]').first()).toBeVisible();
  });
});

test.describe('portfólio', () => {
  const manifest = JSON.parse(fs.readFileSync('scripts/images.json', 'utf8')).filter((i) => i.gallery);

  test('galeria tem 27 fotos carregadas e descritas', async ({ page }) => {
    await page.goto('/projetos.html');
    const links = page.locator('#galeria a');
    await expect(links).toHaveCount(27);
    const alts = await page.locator('#galeria img').evaluateAll((imgs) => imgs.map((i) => i.alt));
    expect(alts).toEqual(manifest.map((i) => i.alt));
  });

  test('lightbox abre e fecha por teclado e devolve o foco', async ({ page }) => {
    await page.goto('/projetos.html');
    const third = page.locator('#galeria a').nth(2);
    await third.focus();
    await page.keyboard.press('Enter');
    const dialog = page.locator('#lightbox');
    await expect(dialog).toBeVisible();
    await expect(dialog.locator('img')).toHaveAttribute('src', `img/site/${manifest[2].slug}.webp`);
    await expect(dialog.locator('img')).toHaveAttribute('alt', manifest[2].alt);
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(third).toBeFocused();
  });

  test('lightbox fecha ao clicar fora da imagem', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/projetos.html');
    await page.locator('#galeria a').first().click();
    await expect(page.locator('#lightbox')).toBeVisible();
    await page.mouse.click(5, 5);
    await expect(page.locator('#lightbox')).toBeHidden();
  });

  test('galeria sem JavaScript abre o arquivo da foto', async ({ browser, request }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto('http://localhost:4173/projetos.html');
    const href = await page.locator('#galeria a').first().getAttribute('href');
    expect(href).toBe(`img/site/${manifest[0].slug}.webp`);
    expect((await request.get(`http://localhost:4173/${href}`)).status()).toBe(200);
    await context.close();
  });
});

test.describe('orçamento', () => {
  test('orçamento oferece WhatsApp, telefone e e-mail, sem formulário', async ({ page }) => {
    await page.goto('/orcamento.html');
    await expect(page.getByRole('link', { name: 'Enviar Mensagem' })).toHaveAttribute('href', /^https:\/\/wa\.me\/5547991012690/);
    await expect(page.getByRole('link', { name: /Ligar/ })).toHaveAttribute('href', 'tel:+5547991012690');
    await expect(page.locator('main').getByRole('link', { name: 'Enviar E-mail' })).toHaveAttribute('href', 'mailto:vpmartinsadm@gmail.com');
    await expect(page.locator('form')).toHaveCount(0);
    await expect(page.locator('main')).not.toContainText('formulário');
  });

  test('estilo antigo foi removido', () => {
    expect(fs.existsSync('css/estilo.css')).toBe(false);
    for (const file of ['index.html', 'projetos.html', 'orcamento.html', 'privacidade.html']) {
      expect(fs.readFileSync(file, 'utf8'), file).not.toContain('estilo.css');
    }
  });
});

test.describe('contato sem formulário', () => {
  test('página inicial oferece WhatsApp, telefone e e-mail, sem formulário', async ({ page }) => {
    await page.goto('/index.html');
    const contato = page.locator('#contato');
    await expect(page.locator('form')).toHaveCount(0);
    await expect(contato.getByRole('link', { name: /WhatsApp/ })).toHaveAttribute('href', /^https:\/\/wa\.me\/5547991012690/);
    await expect(contato.getByRole('link', { name: /99101-2690/ })).toHaveAttribute('href', 'tel:+5547991012690');
    await expect(contato.getByRole('link', { name: /vpmartinsadm@gmail\.com/ })).toHaveAttribute('href', 'mailto:vpmartinsadm@gmail.com');
  });

  test('âncora de contato não fica sob o cabeçalho', async ({ page }) => {
    await page.goto('/index.html#contato');
    await page.waitForTimeout(800);
    const headerBottom = await page.locator('header').evaluate((e) => e.getBoundingClientRect().bottom);
    const titleTop = await page.getByRole('heading', { name: 'Fale Conosco' }).evaluate((e) => e.getBoundingClientRect().top);
    expect(titleTop).toBeGreaterThanOrEqual(headerBottom);
  });

  test('arquivos do formulário foram removidos', () => {
    for (const removed of ['js/contact-form.js', 'obrigado.html']) {
      expect(fs.existsSync(removed), removed).toBe(false);
    }
  });
});

test('conteúdo da política de privacidade', async ({ page }) => {
  await page.goto('/privacidade.html');
  const main = page.locator('main');
  for (const trecho of ['Vanderlei Pereira Martins', '04.982.483/0001-28', 'vpmartinsadm@gmail.com', 'Google', 'GitHub', 'WhatsApp', '12 meses', 'ANPD', 'cookies', 'Última atualização']) {
    await expect(main, trecho).toContainText(trecho);
  }
  await expect(main).not.toContainText('FormSubmit');
  await expect(main).not.toContainText('formulário');
});

test('ícones dos cartões de orçamento ficam centralizados', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/orcamento.html');
  const offsets = await page.locator('main article.text-center').evaluateAll((cards) => cards.map((card) => {
    const c = card.getBoundingClientRect();
    const i = card.querySelector('i').getBoundingClientRect();
    return Math.abs(c.left + c.width / 2 - (i.left + i.width / 2));
  }));
  expect(offsets).toHaveLength(3);
  for (const offset of offsets) expect(offset).toBeLessThan(2);
});

test.describe('sem JavaScript no celular', () => {
  for (const viewport of [{ width: 360, height: 740 }, { width: 740, height: 360 }]) {
    test(`cabeçalho não cobre o conteúdo em ${viewport.width}x${viewport.height}`, async ({ browser }) => {
      const context = await browser.newContext({ javaScriptEnabled: false, viewport });
      const page = await context.newPage();
      await page.goto('http://localhost:4173/index.html#contato');
      const title = page.getByRole('heading', { name: 'Fale Conosco' });
      // A rolagem até a âncora é suave: espera o título chegar à tela.
      await expect.poll(async () => (await title.boundingBox()).y < viewport.height, { timeout: 5000 }).toBe(true);
      await page.waitForTimeout(800);
      const header = await page.locator('header').boundingBox();
      expect((await title.boundingBox()).y).toBeGreaterThanOrEqual(header.y + header.height);
      await expect(page.locator('#menu-toggle')).toBeHidden();
      await context.close();
    });
  }
});
