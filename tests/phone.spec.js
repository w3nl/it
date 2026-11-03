const { test, expect } = require('@playwright/test');
const { KEY, seed, skip } = require('./helpers');

const noSideScroll = page => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);

test('portrait: rotate banner, swipeable room, tappable hotspots', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#rotate')).toBeVisible();
  await expect(page.locator('#rot-line')).not.toBeEmpty();
  expect(await noSideScroll(page)).toBe(true);
  await page.locator('#btn-new').tap();
  await skip(page);
  await expect(page.locator('.swipe')).toBeVisible();
  await page.locator('#pan').evaluate(e => e.scrollLeft = 420);
  const box = await page.locator('#sc-office [data-hs="mug"]').boundingBox();
  expect(box.width).toBeGreaterThan(20);
  await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
  await expect(page.locator('#d-txt')).toContainText("Moss's mug", { timeout: 5_000 });
  await expect(page.locator('#d-more')).toContainText('tap');
  await page.locator('#rot-x').tap();
  await expect(page.locator('#rotate')).toBeHidden();
});

test('landscape: the whole room and the title screen fit', async ({ page }) => {
  await page.setViewportSize({ width: 915, height: 412 });
  await seed(page, { ch: 3, scene: 'doug' }, ['-ch2', '-ch3', '-ch4', '-ch5', '-ch6']);
  const fits = await page.locator('#title').evaluate(e => e.scrollHeight <= e.clientHeight + 1);
  expect(fits).toBe(true);
  await expect(page.locator('#rotate')).toBeHidden();
  expect(await noSideScroll(page)).toBe(true);
});

test('every close-up fits on a phone without sideways scrolling', async ({ page }) => {
  const rooms = [
    ['office', 1, ['pc', 'board', 'shelf', 'exit']],
    ['jen', 2, ['laptop', 'shoes', 'jdoor']],
    ['doug', 3, ['dpc', 'fax', 'douglas']],
    ['lift', 4, ['bag', 'mirror', 'cert']],
    ['dungeon', 5, ['hanoi', 'potions', 'cabinet']],
    ['yacht', 6, ['logbook', 'engine', 'radio', 'poster6']],
  ];
  // the scores overview from the title menu
  await seed(page);
  await expect(page.locator('#title')).not.toHaveClass(/loading/);
  await page.evaluate(() => { recordScore(1, 754, 2); recordScore(5, 3599, 11); });
  await page.locator('#btn-scores').tap();
  expect(await page.locator('.panel').evaluate(e => e.scrollWidth <= e.clientWidth + 1), 'scores are wider than the screen').toBe(true);
  await page.locator('#m-close').tap();
  for (const [scene, ch, spots] of rooms) {
    await seed(page, { ch, scene, f: { duckTaken: true, charged: true, engine: true, helm: true } });
    await page.locator('#btn-cont').tap();
    await skip(page);
    for (const id of spots) {
      await page.evaluate(([scene, id]) => document.querySelector(`#sc-${scene} [data-hs="${id}"]`).dispatchEvent(new MouseEvent('click', { bubbles: true })), [scene, id]);
      await page.waitForTimeout(150);
      if (await page.locator('#modal').isVisible()) {
        const ok = await page.locator('.panel').evaluate(e => e.scrollWidth <= e.clientWidth + 1);
        expect(ok, `${scene} › ${id} is wider than the screen`).toBe(true);
        await page.locator('#m-close').tap();
      } else await skip(page);
      expect(await noSideScroll(page), `${scene} › ${id} made the page scroll sideways`).toBe(true);
    }
  }
});
