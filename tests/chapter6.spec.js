const { test, expect } = require('@playwright/test');
const { seed, hs, skip, useSlot, closeModal, waitModalClosed, expectWin } = require('./helpers');

test('Chapter 6: the yacht', async ({ page }) => {
  await seed(page, null, ['-ch2', '-ch3', '-ch4', '-ch5', '-ch6']);
  await page.locator('#btn-ch6').click();
  await skip(page);
  await expect(page.locator('#chap')).toHaveText('Chapter 6 · The Yacht');

  // ASCII logbook, then the key under the bell
  await hs(page, 'logbook');
  await page.locator('#login').fill('look under the bell');
  await page.locator('#login').press('Enter');
  await expect(page.locator('#logfb')).toContainText('LOOK UNDER THE BELL');
  await closeModal(page);
  await hs(page, 'bell');
  await skip(page);

  // engine systems in dependency order
  await hs(page, 'engine');
  await page.locator('[data-k="engine"]').click();
  await expect(page.locator('#engfb')).toContainText('npm ERR!');
  await page.locator('#ignb').click();
  for (const k of ['battery', 'fuel', 'bilge', 'nav', 'engine', 'prop']) await page.locator(`.sysb[data-k="${k}"]`).click();
  await expect(page.locator('#engfb')).toContainText('rumbles to life');
  await waitModalClosed(page);

  // SKIPPER-OS speaks HTTP
  await hs(page, 'helm');
  await page.locator('[data-r="0"]').click();
  await expect(page.locator('#hcode')).toContainText('401');
  await page.locator('[data-r="1"]').click();
  await expect(page.locator('#hcode')).toContainText('418');
  await page.locator('[data-r="7"]').click();
  await page.locator('[data-r="0"]').click();
  await expect(page.locator('#hcode')).toContainText('200');
  await waitModalClosed(page);

  // parity bits on the harbour radio
  await hs(page, 'radio');
  await page.locator('.bit[data-r="0"][data-c="0"]').click();
  await expect(page.locator('#radfb')).toContainText('fine');
  await page.locator('.bit[data-r="2"][data-c="1"]').click();
  await expect(page.locator('#radfb')).toContainText('Berth 7');
  await closeModal(page);

  // program the autopilot
  await hs(page, 'chart');
  for (const c of 'FFF') await page.locator(`[data-cmd="${c}"]`).click();
  await page.locator('#prun').click();
  await expect(page.locator('#apfb')).toContainText('tourist boat', { timeout: 5_000 });
  await page.locator('#pclear').click();
  for (const c of 'FFRFLFFFFF') await page.locator(`[data-cmd="${c}"]`).click();
  await page.locator('#prun').click();
  await expect(page.locator('#apfb')).toContainText('Docked at Berth 7', { timeout: 10_000 });
  await expect(page.locator('#modal')).toBeHidden({ timeout: 10_000 });
  await skip(page);

  // the dragon CAPTCHA opens after the dialogue
  await expect(page.locator('#m-title')).toHaveText('Smart gangway');
  await page.locator('[data-t="1"]').click();
  await page.locator('#cverify').click();
  await expect(page.locator('#cfb')).toContainText('insect');
  await page.locator('[data-t="1"]').click();
  for (const t of [0, 2, 4, 6, 8]) await page.locator(`[data-t="${t}"]`).click();
  await page.locator('#cverify').click();
  await expectWin(page, 'Docked · Chapter 6 complete');
  await expect(page.locator('#btn-next')).toBeHidden();
});
