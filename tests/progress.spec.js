const { test, expect } = require('@playwright/test');
const { KEY, seed, hs, skip, closeModal } = require('./helpers');

test('progress is saved and survives a refresh', async ({ page }) => {
  await seed(page);
  await page.locator('#btn-new').click();
  await skip(page);
  await hs(page, 'ext');
  await skip(page);
  await page.reload();
  await expect(page.locator('#btn-cont')).toBeVisible();
  await page.locator('#btn-cont').click();
  await expect(page.locator('.slot[title="Fire extinguisher"]')).toBeVisible();
  // the welcome-back line comes from the narrator, not from "You: sys"
  await expect(page.locator('#d-who')).toHaveText('Basement');
  await expect(page.locator('#d-txt')).toContainText('Back in the basement', { timeout: 5_000 });
});

test('hints and the rubber duck give advice', async ({ page }) => {
  await seed(page);
  await page.locator('#btn-new').click();
  await skip(page);
  await page.locator('#btn-hint').click();
  await expect(page.locator('#d-txt')).toContainText('answering machine', { timeout: 5_000 });
  await expect(page.locator('#hint-count')).toHaveText('1');
});

test('achievements carry over into the next chapter', async ({ page }) => {
  await seed(page, { ch: 1, scene: 'office', f: { escaped: true }, ach: { internet: true } }, ['-ch2']);
  await page.locator('#btn-cont').click();
  await expect(page.locator('#chap')).toHaveText("Chapter 2 · Jen's Office");
  const ach = await page.evaluate(KEY => JSON.parse(localStorage.getItem(KEY)).ach, KEY);
  expect(ach.internet).toBe(true);
});

test('after escaping, the door leads to the next chapter', async ({ page }) => {
  await seed(page, { ch: 2, scene: 'jen', f: { duckTaken: true, lap: true, wifi: true, sent: true }, sl: [1,1,1,1,1,1,1], inv: ['duck'] }, ['-ch2']);
  await page.locator('#btn-cont').click();
  await skip(page);
  await hs(page, 'jdoor');
  await page.locator('#sla').fill('internet thing');
  await page.locator('#slc').fill('8086');
  await page.locator('#slf button[type=submit]').click();
  await expect(page.locator('#modal')).toBeHidden({ timeout: 10_000 });
  await skip(page);
  await page.locator('#btn-stay').click();
  await skip(page);
  await expect(page.locator('#sc-jen [data-hs="jdoor"]').first()).toHaveAttribute('data-label', 'Door: on to Chapter 3');
  await hs(page, 'jdoor');
  await expect(page.locator('#chap')).toHaveText('Chapter 3 · The Executive Floor');
});

test('the title screen lists every unlocked chapter', async ({ page }) => {
  await seed(page, { ch: 3, scene: 'doug' }, ['-ch2', '-ch3']);
  await expect(page.locator('#chapters')).toBeVisible();
  await expect(page.locator('#btn-ch1')).toBeVisible();
  await expect(page.locator('#btn-ch3')).toBeVisible();
  await expect(page.locator('#btn-ch4')).toBeHidden();
  await page.locator('#btn-ch1').click();
  await expect(page.locator('#chap')).toHaveText('Chapter 1 · The Basement Lockdown');
});

test('computers stay as you left them when you close them, even after a reload', async ({ page }) => {
  const reopen = async (spot) => { await closeModal(page); await page.reload(); await page.locator('#btn-cont').click(); await skip(page); await hs(page, spot); };

  // Moss's terminal: the screen, the command history and a half-typed command
  await seed(page, { pc: 'term', f: { loggedIn: true } });
  await page.locator('#btn-cont').click();
  await skip(page);
  await hs(page, 'pc');
  await page.locator('#tin').fill('ls');
  await page.locator('#tin').press('Enter');
  await page.locator('#tin').fill('cat read');
  await reopen('pc');
  await expect(page.locator('#tout')).toContainText('note_to_self.rot13');
  await expect(page.locator('#tin')).toHaveValue('cat read');
  await page.locator('#tin').fill('');
  await page.locator('#tin').press('ArrowUp');
  await expect(page.locator('#tin')).toHaveValue('ls');
  await closeModal(page);

  // Douglas's computer reopens in the same app, and Denholm's database keeps its screen
  await seed(page, { ch: 3, scene: 'doug', inv: ['duck'], f: { duckTaken: true, pops: true, portrait: true } }, ['-ch2', '-ch3']);
  await page.locator('#btn-cont').click();
  await skip(page);
  await hs(page, 'dpc');
  await page.locator('[data-app="tm"]').click();
  await reopen('dpc');
  await expect(page.locator('.tm th').first()).toHaveText('Process');
  await closeModal(page);
  await hs(page, 'portrait');
  await page.locator('#sqlin').fill('SHOW TABLES');
  await page.locator('#sqlin').press('Enter');
  await page.locator('#dial').fill('19');
  await reopen('portrait');
  await expect(page.locator('#sqlout')).toContainText('staff');
  await expect(page.locator('#dial')).toHaveValue('19');
  await closeModal(page);

  // Douglas's phone reopens on the same app
  await seed(page, { ch: 4, scene: 'lift', inv: ['duck', 'dphone'], f: { duckTaken: true, charged: true, unlocked: true } }, ['-ch2', '-ch3', '-ch4']);
  await page.locator('#btn-cont').click();
  await skip(page);
  await hs(page, 'dphone');
  await page.locator('[data-app="settings"]').click();
  await reopen('dphone');
  await expect(page.locator('.ptop span')).toHaveText('Settings · Battery & apps');
});
