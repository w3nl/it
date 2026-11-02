const { test, expect } = require('@playwright/test');
const { KEY, seed, hs, skip } = require('./helpers');

test('dialogue shows the speaker\'s portrait (none for the narrator)', async ({ page }) => {
  await seed(page);
  await page.locator('#btn-new').click();
  // first intro line is the narrator: no portrait
  await expect(page.locator('#dialog')).toBeVisible();
  await expect(page.locator('#d-face')).toBeHidden();
  await page.locator('#dialog').click(); await page.locator('#dialog').click();   // finish typing, next line (You)
  await expect(page.locator('#d-face')).toHaveAttribute('src', 'portraits/you.svg');
  await page.locator('#dialog').click(); await page.locator('#dialog').click();   // Moss
  await expect(page.locator('#d-face')).toHaveAttribute('src', 'portraits/moss.svg');
  const loaded = await page.locator('#d-face').evaluate(img => img.complete && img.naturalWidth > 0);
  expect(loaded).toBe(true);
});

test('talk windows show a portrait, and Douglas wears his captain\'s hat on the yacht', async ({ page }) => {
  await seed(page, { ch: 4, scene: 'lift', f: { duckTaken: true }, inv: ['duck', 'dphone'] });
  await page.locator('#btn-cont').click();
  await skip(page);
  await hs(page, 'roy');
  await expect(page.locator('.talk-face')).toHaveAttribute('src', 'portraits/roy.svg');
  await page.locator('#m-close').click();
  await seed(page, { ch: 6, scene: 'yacht', f: { duckTaken: true }, inv: ['duck'] });
  await page.locator('#btn-cont').click();
  await skip(page);
  await hs(page, 'doug6');
  await expect(page.locator('.talk-face')).toHaveAttribute('src', 'portraits/douglas-captain.svg');
});

test('each room has its own ambience, which follows the story and the Sound button', async ({ page }) => {
  await seed(page, { ch: 1, scene: 'server', f: {} });
  await page.locator('#btn-cont').click();
  await expect.poll(() => page.evaluate(() => AMB.cur)).toBe('server+fire');
  await page.evaluate(() => { S.f.fireOut = true; S.f.power = true; });
  await expect.poll(() => page.evaluate(() => AMB.cur)).toBe('server+on');

  await page.locator('#btn-sound').click();
  await expect(page.locator('#btn-sound')).toHaveText('Sound off');
  await expect.poll(() => page.evaluate(() => AMB.cur)).toBe(null);
  expect(await page.evaluate(KEY => localStorage.getItem(KEY + '-sound'), KEY)).toBe('0');
  await page.reload();
  await expect(page.locator('#btn-sound')).toHaveText('Sound off');
  await page.locator('#btn-sound').click();

  for (const [ch, scene, key] of [[3, 'doug', 'doug+alarm'], [4, 'lift', 'lift'], [5, 'dungeon', 'dungeon'], [6, 'yacht', 'yacht']]) {
    await seed(page, { ch, scene, f: { duckTaken: true }, inv: ['duck'] });
    await page.locator('#btn-cont').click();
    await expect.poll(() => page.evaluate(() => AMB.cur)).toBe(key);
  }
  // the title screen is quiet
  await page.locator('#btn-menu').click();
  await expect.poll(() => page.evaluate(() => AMB.cur)).toBe(null);
});
