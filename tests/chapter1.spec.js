const { test, expect } = require('@playwright/test');
const { seed, hs, skip, useSlot, closeModal, waitModalClosed, expectWin } = require('./helpers');

test('Chapter 1: escape the basement', async ({ page }) => {
  await seed(page);
  await page.locator('#btn-new').click();
  await skip(page);
  await expect(page.locator('#chap')).toHaveText('Chapter 1 · The Basement Lockdown');

  // Moss's crashed PC: off and on again, then log in
  await hs(page, 'pc');
  await page.locator('#pwr').click();
  await page.locator('#pwr').click();
  await expect(page.locator('#pw')).toBeVisible({ timeout: 10_000 });
  await page.locator('#pw').fill('password');
  await page.locator('#pw').press('Enter');
  await expect(page.locator('#pwmsg')).not.toBeEmpty();
  await page.locator('#pw').fill('127.0.0.1');
  await page.locator('#pw').press('Enter');

  // the terminal
  await page.locator('#tin').fill('sudo make me a sandwich');
  await page.locator('#tin').press('Enter');
  await expect(page.locator('#tout')).toContainText('Okay.');
  await page.locator('#tin').fill('cat note_to_self.rot13');
  await page.locator('#tin').press('Enter');
  await expect(page.locator('#tout')).toContainText('Abgr gb frys');

  // ...and let the computer decode it with tr
  const term = async cmd => { await page.locator('#tin').fill(cmd); await page.locator('#tin').press('Enter'); };
  await term('rot13 note_to_self.rot13');
  await expect(page.locator('#tout')).toContainText('man tr');
  await term('man tr');
  await expect(page.locator('#tout')).toContainText('A-Z means all the letters');
  await term('tr A-Z N-Z');
  await expect(page.locator('#tout')).toContainText('it needs something to translate');
  await term("echo 'hello' | tr 'a-z' 'A-Z'");
  await expect(page.locator('#tout')).toContainText('HELLO');
  await term("cat note_to_self.rot13 | tr 'A-Za-z' 'N-ZA-Mn-za-m'");
  await expect(page.locator('#tout')).toContainText('the answer to life, the universe and everything');
  await term("tr 'A-Za-z' 'N-ZA-Mn-za-m' < note_to_self.rot13");
  await expect(page.locator('#tout')).toContainText('Do not tell Roy.');
  await closeModal(page);

  // binary DIP switches: 42
  await hs(page, 'sdoor');
  for (const i of [2, 4, 6]) await page.locator(`.dip[data-i="${i}"]`).click();
  await expect(page.locator('#dip-fb')).toContainText('ACCESS GRANTED');
  await waitModalClosed(page);

  // fire extinguisher, then into the server room
  await hs(page, 'ext');
  await skip(page);
  await hs(page, 'sdoor');
  await page.waitForTimeout(800);
  await skip(page);
  await useSlot(page, 'Fire extinguisher');
  await hs(page, 'fire');
  await skip(page);

  // logic gates
  await hs(page, 'panel');
  await page.locator('.sw[data-k="A"]').click();
  await page.locator('.sw[data-k="D"]').click();
  await expect(page.locator('#lg-fb')).toContainText('CLUNK');
  await waitModalClosed(page);

  // hex PIN on the exit keypad
  await hs(page, 'back');
  await page.waitForTimeout(800);
  await hs(page, 'exit');
  for (const k of ['1', '2', '3', '4', 'OK']) await page.locator(`.keys [data-k="${k}"]`).click();
  await expect(page.locator('#km')).toContainText('LUGGAGE');
  for (const k of ['1', '3', '3', '7', 'OK']) await page.locator(`.keys [data-k="${k}"]`).click();
  await expect(page.locator('#km')).toContainText('OVERRIDE ACCEPTED');
  await expectWin(page, 'Lockdown lifted · Chapter 1 complete');
  await expect(page.locator('#btn-next')).toHaveText('Continue to Chapter 2');
});
