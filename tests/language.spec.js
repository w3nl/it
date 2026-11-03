// UK English and Dutch: the language switch, the Dutch versions of the word puzzles, and the translation files.
const { test, expect } = require('@playwright/test');
const { execFileSync } = require('child_process');
const path = require('path');
const { KEY, seed, hs, skip, closeModal, expectWin } = require('./helpers');

/** Like seed(), but in Dutch. */
async function seedNl(page, state = null, unlocked = []) {
  await seed(page, state, unlocked);
  await page.evaluate(KEY => localStorage.setItem(KEY + '-lang', 'nl'), KEY);
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('lang', 'nl');
  await expect(page.locator('#title')).not.toHaveClass(/loading/);
}

test('the language button switches between UK English and Dutch, and remembers it', async ({ page }) => {
  await seed(page);
  await expect(page.locator('#title')).not.toHaveClass(/loading/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'en-GB');
  await expect(page.locator('#btn-new')).toHaveText('New game');

  await page.locator('#btn-lang').click();
  await expect(page.locator('#btn-new')).toHaveText('Nieuw spel');
  await expect(page.locator('html')).toHaveAttribute('lang', 'nl');
  await page.reload();
  await expect(page.locator('#btn-new')).toHaveText('Nieuw spel');

  await page.locator('#btn-new').click();
  await expect(page.locator('#d-who')).toHaveText('Kelder');
  await skip(page);
  await expect(page.locator('#chap')).toHaveText('Hoofdstuk 1 · Opgesloten in de kelder');
  await hs(page, 'clock');
  await page.locator('#dialog').click();
  await expect(page.locator('#d-txt')).toContainText('De klok staat op 12:58');
  await skip(page);
  await expect(page.locator('#sc-office [data-hs="exit"]')).toHaveAttribute('data-label', 'Nooduitgang');

  // and back: everything on the page returns to English
  await page.locator('#btn-lang').click();
  await expect(page.locator('#chap')).toHaveText('Chapter 1 · The Basement Lockdown');
  await expect(page.locator('#sc-office [data-hs="exit"]')).toHaveAttribute('data-label', 'Exit door');
  await expect(page.locator('#tray-hint')).toContainText('Select an item');
});

test('in Dutch, the word puzzles have Dutch answers', async ({ page }) => {
  // Chapter 1: the ROT13 note decodes to Dutch
  await seedNl(page, { pc: 'term', f: { loggedIn: true } });
  await page.locator('#btn-cont').click();
  await skip(page);
  await hs(page, 'pc');
  await page.locator('#tin').fill("cat note_to_self.rot13 | tr 'A-Za-z' 'N-ZA-Mn-za-m'");
  await page.locator('#tin').press('Enter');
  await expect(page.locator('#tout')).toContainText('het antwoord op de ultieme vraag');
  await closeModal(page);

  // Chapter 2: Jen's speaker notes say INTERNET DING in ROT13, and the SmartLock takes the Dutch answer
  await seedNl(page, { ch: 2, scene: 'jen', inv: ['duck'], sl: [1, 1, 1, 1, 1, 1, 1], f: { duckTaken: true, lap: true, wifi: true, sent: true, readCode: true } }, ['-ch2']);
  await page.locator('#btn-cont').click();
  await skip(page);
  await hs(page, 'laptop');
  await page.locator('[data-app="slides"]').click();
  await page.locator('[data-s="6"]').click();
  await expect(page.locator('.notes code')).toHaveText('VAGREARG QVAT');
  await closeModal(page);
  await hs(page, 'jdoor');
  await page.locator('#sla').fill('Internet ding');
  await page.locator('#slc').fill('8086');
  await page.locator('#slf button[type="submit"]').click();
  await expectWin(page, 'Deur open · hoofdstuk 2 voltooid');

  // Chapter 5: the sorted potions spell ENERGIE
  await seedNl(page, { ch: 5, scene: 'dungeon', inv: ['duck'], f: { duckTaken: true } }, ['-ch2', '-ch3', '-ch4', '-ch5']);
  await page.locator('#btn-cont').click();
  await skip(page);
  await hs(page, 'potions');
  const word = await page.evaluate(() => [1, 3, 5, 8, 13, 21, 42].map(potionLetter).join(''));
  expect(word).toBe('ENERGIE');
  await closeModal(page);

  // Chapter 6: the logbook says KIJK ONDER DE BEL in ASCII
  await seedNl(page, { ch: 6, scene: 'yacht', inv: ['duck'], f: { duckTaken: true } }, ['-ch2', '-ch3', '-ch4', '-ch5', '-ch6']);
  await page.locator('#btn-cont').click();
  await skip(page);
  await hs(page, 'logbook');
  await expect(page.locator('.logp .nums')).toHaveText('75 73 74 75 32 79 78 68 69 82 32 68 69 32 66 69 76');
  await page.locator('#login').fill('kijk onder de bel');
  await page.locator('#logf button[type="submit"]').click();
  await expect(page.locator('#logfb')).toHaveClass(/good/);
});

test('every Dutch translation still matches the English text', () => {
  // Fails when English text changed without updating lang/nl (a stale key), or one text has two translations.
  const tool = path.join(__dirname, '..', 'tools', 'i18n-check.js');
  let out = '';
  try { out = execFileSync(process.execPath, [tool, '--stale'], { encoding: 'utf8' }); }
  catch (e) { out = e.stdout; throw new Error('tools/i18n-check.js --stale failed:\n' + out); }
  expect(out).toContain('0 stale keys, 0 conflicts');
});
