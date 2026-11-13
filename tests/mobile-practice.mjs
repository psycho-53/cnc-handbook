import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const base = process.env.CNC_TEST_URL || 'http://127.0.0.1:8765';
const fail = message => { throw new Error(message); };
function assert(ok, message) { if (!ok) fail(message); }
async function checkOverflow(page, label) {
  const dims = await page.evaluate(() => ({
    viewport: window.innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
    bodyScrollWidth: document.body.scrollWidth
  }));
  assert(dims.scrollWidth <= dims.viewport + 2, label + ': horizontal overflow ' + JSON.stringify(dims));
}
const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
await mkdir('test-results', { recursive: true });
let failures = 0;
try {
  for (const width of [375, 390]) {
    const context = await browser.newContext({
      viewport: { width, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1
    });
    const page = await context.newPage();
    const problems = [];
    page.on('pageerror', err => problems.push(err.message));
    await page.goto(base + '/#/practice', { waitUntil: 'load' });
    await page.locator('.prac-shell').waitFor({ timeout: 15000 });
    assert((await page.locator('[data-action="practice-answer"]').count()) === 3, 'Expected three actual options on ' + width);
    await checkOverflow(page, 'Initial ' + width);
    await page.screenshot({ path: 'test-results/practice-' + width + '-initial.png', fullPage: true });
    await page.locator('[data-action="practice-answer"][data-id="cut-01"][data-opt="1"]').click();
    await page.locator('.prac-feedback-title').waitFor();
    assert((await page.locator('.prac-numbers').count()) === 1, 'Numerical analysis absent');
    assert((await page.locator('.prac-references a').count()) > 0, 'Manufacturer sources missing');
    assert((await page.locator('.prac-feedback-title').innerText()).includes('обосновано'), 'Correct choice rejected');
    await checkOverflow(page, 'Answered ae/ap ' + width);
    await page.screenshot({ path: 'test-results/practice-' + width + '-engagement.png', fullPage: true });
    await page.reload();
    await page.locator('.prac-feedback-title').waitFor();
    assert((await page.locator('.prac-feedback-title').innerText()).includes('обосновано'), 'Progress not persisted');

    await page.locator('[data-action="practice-next"]').click();
    assert((await page.locator('.prac-counter').innerText()).includes('2 / 30'), 'Next case not loaded');
    await page.locator('[data-action="practice-group"][data-group="Вибрации"]').click();
    assert((await page.locator('.prac-counter').innerText()).includes('1 / 9'), 'Vibration filter failed');
    await page.locator('[data-action="practice-answer"][data-id="cut-13"][data-opt="0"]').click();
    await page.locator('.prac-feedback-title').waitFor();
    await checkOverflow(page, 'Vibration feedback ' + width);
    await page.screenshot({ path: 'test-results/practice-' + width + '-vibration.png', fullPage: true });

    await page.locator('[data-action="practice-group"][data-group="Износ и сколы"]').click();
    await page.locator('[data-action="practice-answer"][data-id="cut-22"][data-opt="1"]').click();
    await page.locator('.prac-feedback-title').waitFor();
    assert((await page.locator('.prac-feedback-title').innerText()).includes('пересмотреть'), 'Wrong choice not explained');
    assert((await page.locator('.prac-errors p').count()) === 3, 'No explanations for all answers');
    await checkOverflow(page, 'Wear feedback ' + width);
    await page.screenshot({ path: 'test-results/practice-' + width + '-wear.png', fullPage: true });
    await page.locator('[data-action="practice-retry"]').click();
    assert((await page.locator('.prac-feedback').count()) === 0, 'Retry did not reset selected case');
    assert(problems.length === 0, 'JS page errors: ' + problems.join('; '));
    console.log('PASS mobile ' + width + 'px: ae/ap, persistence, next, vibration, wear, retry and no overflow');
    await context.close();
  }
} catch (err) {
  failures++;
  console.error(err.stack || String(err));
} finally {
  await browser.close();
}
if (failures) process.exit(1);
