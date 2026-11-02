const { test, expect } = require('@playwright/test');
const { seed, skip } = require('./helpers');

test('Chapter 6: a tour boat sails past and Douglas waves', async ({ page }) => {
  test.slow();
  await seed(page, { ch: 6, scene: 'yacht', f: { duckTaken: true }, inv: ['duck'] });
  await page.locator('#btn-cont').click();
  await skip(page);
  await expect(page.locator('#doug-wave')).toBeVisible({ timeout: 25_000 });
  await expect(page.locator('#tourboat')).toHaveClass(/pass/);
  await expect(page.locator('#doug-wave')).toBeHidden({ timeout: 15_000 });
});

test('Chapter 6: manually triggered boat animates with reduced motion enabled', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await seed(page, { ch: 6, scene: 'yacht', f: { duckTaken: true }, inv: ['duck'] });
  await page.locator('#btn-cont').click();
  await skip(page);
  await page.evaluate(() => sendBoat(true));
  await expect(page.locator('#tourboat')).toHaveClass(/force-pass/);
  await expect.poll(() => page.locator('#tourboat').evaluate(boat => getComputedStyle(boat).animationName)).toBe('sail');
});
