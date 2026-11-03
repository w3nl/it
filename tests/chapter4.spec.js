const { test, expect } = require('@playwright/test');
const { seed, hs, skip, useSlot, closeModal, waitModalClosed, expectWin } = require('./helpers');

test('Chapter 4: the lift', async ({ page }) => {
  await seed(page, null, ['-ch2', '-ch3', '-ch4']);
  await page.locator('#btn-ch4').click();
  await skip(page);
  await expect(page.locator('#chap')).toHaveText('Chapter 4 · The Lift');

  // the right cable
  await hs(page, 'bag');
  await page.locator('[data-c="cc"]').click();
  await closeModal(page);
  await useSlot(page, 'Cable');
  await hs(page, 'usb');
  await expect(page.locator('#d-txt')).toContainText('So close', { timeout: 5_000 });
  await skip(page);
  await hs(page, 'bag');
  await page.locator('[data-c="ac"]').click();
  await closeModal(page);
  await useSlot(page, 'Cable');
  await hs(page, 'usb');
  await skip(page);

  // pattern lock from the smudges: a D
  await hs(page, 'dphone');
  await page.locator('#ptilt').click();
  for (const d of [1, 5, 7, 6, 3, 0]) await page.locator(`circle[r="38"][data-dot="${d}"]`).click();
  await expect(page.locator('#pfb')).toContainText('Unlocked');
  await closeModal(page);
  await skip(page);

  // uninstall the spyware torch
  await hs(page, 'dphone');
  await page.locator('[data-app="settings"]').click();
  await page.locator('[data-un="flash"]').click();
  await expect(page.locator('#pfb')).toContainText('Uninstalled');
  await closeModal(page);
  await skip(page);

  // Bluetooth pairing (mirror code) and Moss's Morse passphrase; the phone reopens in Settings, where we left it
  await hs(page, 'dphone');
  await expect(page.locator('.ptop span')).toHaveText('Settings · Battery & apps');
  await page.locator('#phome').click();
  await page.locator('[data-app="smart"]').click();
  await page.locator('#pairin').fill('218205');
  await page.locator('#pairin').press('Enter');
  await expect(page.locator('#pmsg')).toContainText('mirror');
  await page.locator('#pairin').fill('205815');
  await page.locator('#pairin').press('Enter');
  await page.locator('#passin').fill('sudo');
  await page.locator('#passin').press('Enter');
  await expect(page.locator('#pfb')).toContainText('Override accepted');

  // the update gets stuck: turn it off and on again
  await page.locator('#prel').click();
  await expect(page.locator('#pmsg')).toContainText('99%', { timeout: 6_000 });
  await closeModal(page);
  await skip(page);
  await hs(page, 'roy');
  await page.locator('[data-t="4"]').click();
  await expect(page.locator('#talk-a')).toContainText('turning it off and on again');
  await closeModal(page);
  await hs(page, 'dphone');
  await page.locator('#ppow').click();
  await page.locator('#poff').click();
  await page.locator('#ppow').click();
  await expectWin(page, 'Lift released · Chapter 4 complete');
});
