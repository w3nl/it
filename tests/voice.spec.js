// Optional voices (js/voice.js): the dialogue is read aloud with speechSynthesis when the Voices button is on.
// The test browser has no real voices, so speechSynthesis is replaced by a recorder.
const { test, expect } = require('@playwright/test');
const { seed, hs, skip } = require('./helpers');

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.__spoken = []; window.__cancels = 0;
    Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: {
      speak: u => window.__spoken.push({ text: u.text, lang: u.lang, pitch: u.pitch }),
      cancel: () => { window.__cancels++; },
      getVoices: () => []
    } });
  });
});
const spoken = page => page.evaluate(() => window.__spoken);

test('voices are off by default, read each line aloud when on, and follow the language', async ({ page }) => {
  await seed(page);
  await expect(page.locator('#title')).not.toHaveClass(/loading/);
  await expect(page.locator('#btn-voice')).toHaveText('Voices off');

  // off: a new game says nothing out loud
  await page.locator('#btn-new').click();
  await skip(page);
  expect(await spoken(page)).toEqual([]);

  // on: Moss confirms, then every line is spoken in British English, each character with their own pitch
  await page.locator('#btn-voice').click();
  await expect(page.locator('#btn-voice')).toHaveText('Voices on');
  await expect.poll(async () => (await spoken(page)).length).toBe(1);
  expect((await spoken(page))[0].lang).toBe('en-GB');
  expect((await spoken(page))[0].pitch).toBeCloseTo(1.35);   // Moss
  expect((await spoken(page))[0].text).toContain('Voices on.');
  await skip(page);
  await hs(page, 'clock');
  await expect.poll(async () => (await spoken(page)).at(-1).text).toContain('The clock says 12:58');
  await page.locator('#dialog').click();   // the line is also written on screen, as without voices
  await expect(page.locator('#d-txt')).toContainText('The clock says 12:58');
  expect((await spoken(page)).at(-1).lang).toBe('en-GB');
  expect((await spoken(page)).at(-1).pitch).toBeCloseTo(1.05);   // you
  await skip(page);

  // remembered after a reload, and Dutch lines are read with a Dutch voice
  await page.reload();
  await expect(page.locator('#btn-voice')).toHaveText('Voices on');
  await page.locator('#btn-lang').click();
  await expect(page.locator('#btn-voice')).toHaveText('Stemmen aan');
  await page.locator('#btn-cont').click();
  await skip(page);
  await hs(page, 'clock');
  await expect.poll(async () => (await spoken(page)).at(-1).text).toContain('De klok staat op 12:58');
  expect((await spoken(page)).at(-1).lang).toBe('nl-NL');

  // off again: speech stops and nothing new is spoken
  await skip(page);
  const before = (await spoken(page)).length;
  await page.locator('#btn-voice').click();
  await hs(page, 'clock');
  await page.waitForTimeout(300);
  expect((await spoken(page)).length).toBe(before);
});
