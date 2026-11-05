import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const PAGES = ['index.html', 'projetos.html', 'orcamento.html', 'privacidade.html'];

// Força o carregamento das fotos com lazy, para testar todas de verdade.
function loadAllImages(page) {
  return page.locator('img').evaluateAll((imgs) => Promise.all(imgs.map((img) => {
    img.loading = 'eager';
    return img.decode().catch(() => {});
  })));
}

for (const file of PAGES) {
  test.describe(file, () => {
    for (const width of [360, 768, 1280]) {
      test(`${file}: sem rolagem horizontal em ${width}px`, async ({ page }) => {
        await page.setViewportSize({ width, height: 800 });
        await page.goto(`/${file}`);
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        expect(overflow).toBeLessThanOrEqual(0);
      });
    }

    test(`${file}: sem violações sérias de acessibilidade`, async ({ page }) => {
      await page.goto(`/${file}`);
      const { violations } = await new AxeBuilder({ page }).analyze();
      const serious = violations.filter((v) => ['serious', 'critical'].includes(v.impact));
      expect(serious.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(', ')}`)).toEqual([]);
    });

    test(`${file}: sem requisições a terceiros e sem cookies`, async ({ page, context }) => {
      const external = [];
      page.on('request', (request) => {
        const { hostname, protocol } = new URL(request.url());
        if (protocol.startsWith('http') && hostname !== 'localhost') external.push(request.url());
      });
      await page.goto(`/${file}`);
      await loadAllImages(page);
      await page.waitForLoadState('networkidle');
      expect(external).toEqual([]);
      expect(await context.cookies()).toEqual([]);
    });

    test(`${file}: todas as imagens carregam`, async ({ page }) => {
      await page.goto(`/${file}`);
      await loadAllImages(page);
      const broken = await page.locator('img').evaluateAll((imgs) => imgs.filter((i) => i.naturalWidth === 0).map((i) => i.src));
      expect(broken).toEqual([]);
    });
  });
}
