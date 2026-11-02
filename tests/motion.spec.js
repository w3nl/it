const { test, expect } = require('@playwright/test');
const { KEY, seed, skip } = require('./helpers');

const feetAnimation = page => page.locator('#sc-jen .walk').first().evaluate(e => getComputedStyle(e).animationName);

test('devices that prefer reduced motion stand still, unless the player picks "Motion on"', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await seed(page, { ch: 2, scene: 'jen', f: { duckTaken: true }, inv: ['duck'] });
  await page.locator('#btn-cont').click();
  await skip(page);
  await expect(page.locator('#btn-motion')).toHaveText('Motion auto');
  expect(await feetAnimation(page)).toBe('none');

  await page.locator('#btn-motion').click();
  await expect(page.locator('#btn-motion')).toHaveText('Motion on');
  await expect.poll(() => feetAnimation(page)).toBe('walk');

  // the tour boat now sails by itself too
  await page.evaluate(() => { S.scene = 'yacht'; S.ch = 6; applyVisuals(); sendBoat(); });
  await expect(page.locator('#tourboat')).toHaveClass(/pass/);
  await expect.poll(() => page.locator('#tourboat').evaluate(b => getComputedStyle(b).animationName)).toBe('sail');

  // the choice is remembered
  expect(await page.evaluate(KEY => localStorage.getItem(KEY + '-motion'), KEY)).toBe('on');
  await page.reload();
  await expect(page.locator('#btn-motion')).toHaveText('Motion on');
});

test('"Motion off" stops everything, even on devices with full motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await seed(page, { ch: 2, scene: 'jen', f: { duckTaken: true }, inv: ['duck'] });
  await page.locator('#btn-cont').click();
  await skip(page);
  expect(await feetAnimation(page)).toBe('walk');
  await page.locator('#btn-motion').click();   // on
  await page.locator('#btn-motion').click();   // off
  await expect(page.locator('#btn-motion')).toHaveText('Motion off');
  await expect.poll(() => feetAnimation(page)).toBe('none');
  const smilPaused = await page.evaluate(() => document.querySelector('#sc-yacht').animationsPaused());
  expect(smilPaused).toBe(true);
});
