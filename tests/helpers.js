// Shared helpers for playing Hello, IT in tests.
const { expect } = require('@playwright/test');

const KEY = 'hello-it-basement-v1';

/** Start from a clean browser, optionally with a saved game and unlocked chapters (e.g. ['-ch2', '-ch3']). */
async function seed(page, state = null, unlocked = []) {
  await page.goto('/');
  await page.evaluate(([KEY, state, unlocked]) => {
    localStorage.clear();
    localStorage.setItem(KEY + '-norotate', '1');
    unlocked.forEach(k => localStorage.setItem(KEY + k, '1'));
    if (state) localStorage.setItem(KEY, JSON.stringify({ v: 1, pc: 'bsod', inv: [], hl: {}, hints: 0, t: 0, ach: {}, started: true, f: {}, ...state }));
  }, [KEY, state, unlocked]);
  await page.reload();
}

/** Click a hotspot (by its data-hs id) in the scene that is currently showing. */
async function hs(page, id) {
  await page.evaluate(id => {
    const scene = [...document.querySelectorAll('.scene')].find(s => s.classList.contains('on'));
    const el = scene && scene.querySelector(`[data-hs="${id}"]`);
    if (!el) throw new Error(`No hotspot "${id}" in the current scene`);
    el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  }, id);
  await page.waitForTimeout(120);
}

/** Click through the dialogue strip until it closes (stops if a close-up opens). */
async function skip(page, max = 40) {
  for (let i = 0; i < max; i++) {
    if (await page.locator('#dialog').isHidden()) return;
    if (await page.locator('#modal').isVisible()) return;
    await page.locator('#dialog').click();
    await page.waitForTimeout(25);
  }
}

/** Select an inventory item by its name. */
async function useSlot(page, name) {
  await page.locator(`.slot[title="${name}"]`).click();
}

async function closeModal(page) {
  await page.locator('#m-close').click();
  await expect(page.locator('#modal')).toBeHidden();
}

/** Wait for a close-up to close by itself (after a solved puzzle), then read the dialogue. */
async function waitModalClosed(page) {
  await expect(page.locator('#modal')).toBeHidden({ timeout: 15_000 });
  await skip(page);
}

/** Read the end-of-chapter dialogue and check the end screen. */
async function expectWin(page, eyebrow) {
  await expect(page.locator('#modal')).toBeHidden({ timeout: 15_000 });
  await skip(page);
  await expect(page.locator('#win')).toBeVisible();
  await expect(page.locator('#w-eyebrow')).toHaveText(eyebrow);
}

module.exports = { KEY, seed, hs, skip, useSlot, closeModal, waitModalClosed, expectWin };
