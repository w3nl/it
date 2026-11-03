const { test, expect } = require('@playwright/test');
const { seed, hs, skip, closeModal, waitModalClosed, expectWin } = require('./helpers');

test("Chapter 2: Jen's office", async ({ page }) => {
  await seed(page, null, ['-ch2']);
  await page.locator('#btn-ch2').click();
  await skip(page);
  await expect(page.locator('#chap')).toHaveText("Chapter 2 · Jen's Office");

  // reset Jen's password with clues from the room
  await hs(page, 'laptop');
  await page.locator('#forgot').click();
  await page.locator('#q1').fill('Fluffy');
  await page.locator('#q2').fill('Belladonna');
  await page.locator('#q3').fill('Swindon');
  await page.locator('#rq button[type=submit]').click();
  await expect(page.locator('#rmsg')).toContainText('2 of 3');
  // closing the laptop to look for the last answer keeps the screen, the answers and the check, even after a reload
  await closeModal(page);
  await page.reload();
  await page.locator('#btn-cont').click();
  await skip(page);
  await hs(page, 'laptop');
  await expect(page.locator('#q2')).toHaveValue('Belladonna');
  await expect(page.locator('#q1')).toHaveValue('Fluffy');
  await expect(page.locator('#rmsg')).toContainText('2 of 3');
  await page.locator('#q1').fill('Sir Purrcival');
  await page.locator('#rq button[type=submit]').click();
  await expect(page.locator('[data-app="slides"]')).toBeVisible({ timeout: 5_000 });

  // fix the acronym slides
  await page.locator('[data-app="slides"]').click();
  const answers = [null, 0, 1, 2, 0, 2, 1];
  await page.locator('[data-s="1"]').click();
  await page.locator('[data-o="1"]').click();
  await expect(page.locator('#smsg')).not.toBeEmpty();
  for (let i = 1; i < 7; i++) { await page.locator(`[data-s="${i}"]`).click(); await page.locator(`[data-o="${answers[i]}"]`).click(); }
  await expect(page.locator('#smsg')).toContainText('All slides fixed');
  await page.locator('#aback').click();
  await closeModal(page);
  await skip(page);

  // the Wi-Fi card is in the Crocs
  await hs(page, 'shoes');
  await page.locator('.sbox').nth(5).click();
  await expect(page.locator('#shfb')).toContainText('BOARDROOM WI-FI');
  await closeModal(page);

  // connect and present
  await hs(page, 'laptop');
  await page.locator('[data-app="wifi"]').click();
  await page.locator('[data-n="4"]').click();
  await page.locator('#wkey').fill('shoes4ever');
  await page.locator('#wkey').press('Enter');
  await page.locator('#aback').click();
  await page.locator('[data-app="slides"]').click();
  await page.locator('#present').click();
  await waitModalClosed(page);

  // the SmartLock wants Jen's answer, not the right one
  await hs(page, 'jdoor');
  await page.locator('#sla').fill('Information Technology');
  await page.locator('#slf button[type=submit]').click();
  await expect(page.locator('#slfb')).toContainText("not the owner's");
  await page.locator('#sla').fill('internet thing');
  await page.locator('#slc').fill('8086');
  await page.locator('#slf button[type=submit]').click();
  await expectWin(page, 'Door unlocked · Chapter 2 complete');
});
