const { test, expect } = require('@playwright/test');
const { seed, hs, skip, useSlot, closeModal, waitModalClosed, expectWin } = require('./helpers');

test('Chapter 5: Dungeons & Datacenters', async ({ page }) => {
  await seed(page, null, ['-ch2', '-ch3', '-ch4', '-ch5']);
  await page.locator('#btn-ch5').click();
  await skip(page);
  await expect(page.locator('#chap')).toHaveText('Chapter 5 · Dungeons & Datacenters');

  // Tower of Hard Drives in the minimum 15 moves
  await hs(page, 'hanoi');
  const peg = p => page.locator(`.peg[data-p="${p}"]`).click();
  const moves = [[0,1],[0,2],[1,2],[0,1],[2,0],[2,1],[0,1],[0,2],[1,2],[1,0],[2,0],[1,2],[0,1],[0,2],[1,2]];
  for (const [a, b] of moves) { await peg(a); await peg(b); }
  await expect(page.locator('#hfb')).toContainText('minimum possible');
  await waitModalClosed(page);

  // regex rune cabinet
  await hs(page, 'cabinet');
  for (const w of ['Roy', 'Mo']) await page.locator(`[data-w="${w}"]`).click();
  await page.locator('#cast').click();
  await expect(page.locator('#rfb')).toContainText('too short');
  for (const w of ['Mo', 'Moss', 'Rose']) await page.locator(`[data-w="${w}"]`).click();
  await page.locator('#cast').click();
  await waitModalClosed(page);

  // debug the spell
  await useSlot(page, 'USB stick');
  await hs(page, 'cabinet');
  await page.locator('#runsp').click();
  await expect(page.locator('#sfb')).toContainText('NaN');
  await page.locator('#loopsel').selectOption('3');
  await page.locator('#runsp').click();
  await expect(page.locator('#sout')).toContainText('628210');
  await closeModal(page);
  await skip(page);

  // treasure chest
  await hs(page, 'chest');
  await page.locator('#chin').fill('628210');
  await page.locator('#chin').press('Enter');
  await waitModalClosed(page);

  // bubble sort the potions
  await hs(page, 'potions');
  for (let guard = 0; guard < 40; guard++) {
    const order = await page.locator('.bottle .glass').allTextContents();
    const nums = order.map(Number);
    const i = nums.findIndex((v, j) => j < nums.length - 1 && v > nums[j + 1]);
    if (i < 0) break;
    await page.locator(`.swapb[data-i="${i}"]`).click();
  }
  await expect(page.locator('#pofb')).toContainText('BATTERY');
  await waitModalClosed(page);

  // wake the dragon and beat it with a binary search
  await useSlot(page, '4 × AA batteries');
  await hs(page, 'dragon');
  await skip(page);
  await hs(page, 'dragon');
  let lo = 1, hi = 100, won = false;
  for (let k = 0; k < 7 && !won; k++) {
    const g = Math.floor((lo + hi) / 2);
    await page.locator('#dgin').fill(String(g));
    await page.locator('#dgin').press('Enter');
    const said = await page.locator('#dsay').textContent();
    if (said.includes('DEFEATED')) won = true; else if (said.startsWith('HIGHER')) lo = g + 1; else hi = g - 1;
  }
  expect(won).toBe(true);
  await waitModalClosed(page);

  // the Firewall password rules
  await hs(page, 'fwadmin');
  await expect(page.locator('#pwin5')).toHaveValue('password1');
  await expect(page.locator('#pwset')).toBeDisabled();
  await page.locator('#pwin5').fill('Moss#4900');
  await expect(page.locator('#pwset')).toBeEnabled();
  await page.locator('#pwset').click();
  await expectWin(page, 'Firewall lowered · Chapter 5 complete');
});
