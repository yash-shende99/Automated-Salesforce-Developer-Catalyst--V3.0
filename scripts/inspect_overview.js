const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const auth = JSON.parse(fs.readFileSync('scripts/trailhead_auth.json', 'utf8'));
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ storageState: auth });
  const page = await context.newPage();
  await page.goto('https://trailhead.salesforce.com/content/learn/modules/data_security/data_security_overview', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);
  
  // Click Challenge +100 points
  const btn = page.locator('button:has-text("Challenge")');
  if (await btn.count() > 0) {
    console.log('Found button:', await btn.first().innerText());
    await btn.first().click();
    await page.waitForTimeout(3000);
  }

  // Check quiz questions piercing shadow root
  const questions = await page.evaluate(() => {
    const list = [];
    document.querySelectorAll('*').forEach(el => {
      if (el.shadowRoot) {
        el.shadowRoot.querySelectorAll('.question, legend, .header, c-trailhead-quiz-question').forEach(q => {
          list.push(q.innerText);
        });
      }
    });
    return list;
  });
  console.log('Shadow questions:', questions);

  const bodySnippet = await page.evaluate(() => document.body.innerText.slice(-2500));
  console.log('Bottom snippet:\n', bodySnippet);

  await browser.close();
})();
