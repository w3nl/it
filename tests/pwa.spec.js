const { test, expect } = require('@playwright/test');
const { skip } = require('./helpers');

test('the game is an installable web app that works offline', async ({ page, context }) => {
  await page.goto('/');
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.waitForTimeout(500);

  const cdp = await context.newCDPSession(page);
  const { installabilityErrors } = await cdp.send('Page.getInstallabilityErrors');
  expect(installabilityErrors).toEqual([]);
  const { errors } = await cdp.send('Page.getAppManifest');
  expect(errors).toEqual([]);

  const cached = await page.evaluate(async () => { const keys = await caches.keys(); const c = await caches.open(keys[0]); return (await c.keys()).map(r => new URL(r.url).pathname); });
  expect(cached).toEqual(expect.arrayContaining(['/', '/index.html', '/manifest.webmanifest', '/icons/icon-512.png', '/js/core.js', '/js/chapter6.js', '/css/base.css', '/scenes/yacht.svg']));

  await context.setOffline(true);
  await page.reload();
  await expect(page.locator('#sc-office')).toBeAttached();
  await page.locator('#btn-new').click();
  await skip(page);
  await expect(page.locator('#chap')).toHaveText('Chapter 1 · The Basement Lockdown');
  await context.setOffline(false);
});

test('opening index.html from disk explains that a web server is needed', async ({ page }) => {
  await page.goto('file://' + require('path').resolve(__dirname, '..', 'index.html'));
  await expect(page.locator('#title p.keep')).toContainText('npm start');
  await expect(page.locator('#btn-new')).toBeHidden();
});
