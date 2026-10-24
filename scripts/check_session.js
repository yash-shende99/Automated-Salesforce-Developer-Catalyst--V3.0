const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const auth = JSON.parse(fs.readFileSync('scripts/trailhead_auth.json', 'utf8'));
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ storageState: auth });
  const page = await context.newPage();
  
  console.log('Navigating to trailhead.salesforce.com/today...');
  await page.goto('https://trailhead.salesforce.com/today');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(5000);
  
  console.log('Final URL:', page.url());
  const title = await page.title();
  console.log('Title:', title);
  
  const text = await page.evaluate(() => document.body.innerText.slice(0, 500));
  console.log('Text snippet:\n', text);

  await browser.close();
})();
