const { test, expect } = require('@playwright/test');
const { seed, hs, skip, useSlot, closeModal, waitModalClosed, expectWin } = require('./helpers');

test('Chapter 3: the executive floor', async ({ page }) => {
  await seed(page, null, ['-ch2', '-ch3']);
  await page.locator('#btn-ch3').click();
  await skip(page);
  await expect(page.locator('#chap')).toHaveText('Chapter 3 · The Executive Floor');

  // pop-ups: a fake button spawns more, the real ✕ closes them
  await hs(page, 'dpc');
  await page.locator('[data-f="7"]').click();
  await expect(page.locator('.pop')).toHaveCount(10);
  for (let i = 0; i < 30; i++) { const n = await page.locator('[data-x]').count(); if (!n) break; await page.locator(`[data-x="${n - 1}"]`).click(); }
  await expect(page.locator('#dfb')).toContainText('All pop-ups closed');

  // Task Manager
  await page.locator('[data-app="tm"]').click();
  await page.locator('[data-p="explorer.exe"]').click();
  await expect(page.locator('#tmsg')).toContainText('desktop vanishes');
  for (const p of ['totally_not_a_virus.exe', 'free_yacht_screensaver.exe', 'crypto_miner_lite.exe', 'cursor_glitter_trail.exe']) await page.locator(`[data-p="${p}"]`).click();
  await expect(page.locator('#tmsg')).toContainText('CPU back to normal');
  await page.locator('#dback').click();
  await closeModal(page);
  await skip(page);

  // phishing training
  await hs(page, 'dpc');
  await page.locator('[data-app="mail"]').click();
  const legit = [true, false, false, true, false, true, false];
  for (let k = 0; k < 7; k++) await page.locator(`[data-k="${k}"][data-v="${legit[k] ? 'legit' : 'phish'}"]`).click();
  await page.locator('#mcheck').click();
  await expect(page.locator('.mail .mb').first()).toContainText('emergency services advert');

  // restore the right backup
  await page.locator('#dback').click();
  await page.locator('[data-app="bak"]').click();
  await page.locator('[data-b="4"]').click();
  await expect(page.locator('#bmsg')).toContainText('0 KB');
  await page.locator('[data-b="3"]').click();
  await closeModal(page);
  await skip(page);

  // Denholm's safe: SQL
  await hs(page, 'portrait');
  await skip(page);
  await hs(page, 'portrait');
  await page.locator('#sqlin').fill("SELECT code FROM safe WHERE owner = 'Denholm';");
  await page.locator('#sqlin').press('Enter');
  await expect(page.locator('#sqlout')).toContainText('1966');
  await page.locator('#dial').fill('1966');
  await page.locator('#dial').press('Enter');
  await waitModalClosed(page);

  // fax: jam, paper, and dial 9 for an outside line
  await hs(page, 'fax');
  const dial = async n => { await page.locator('[data-d="C"]').click(); for (const d of n) await page.locator(`[data-d="${d}"]`).click(); await page.locator('[data-d="S"]').click(); };
  await page.locator('#fcover').click();
  await page.locator('#fpaper').click();
  await dial('01189998819991197253');
  await expect(page.locator('#lcd')).toContainText('E-04');
  await dial('901189998819991197253');
  await expectWin(page, 'Privacy Mode lifted · Chapter 3 complete');
});
