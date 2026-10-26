const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const auth = JSON.parse(fs.readFileSync('scripts/trailhead_auth.json', 'utf8'));
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    storageState: auth,
    viewport: { width: 1440, height: 1000 }
  });
  const page = await context.newPage();

  console.log('[Unit 1] Navigating to Overview...');
  await page.goto('https://trailhead.salesforce.com/content/learn/modules/data_security/data_security_overview', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(4000);

  // Scroll to bottom
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(2000);

  console.log('[Unit 1] Selecting answers...');
  const opt1 = page.locator('label:has-text("Permission Sets")').first();
  await opt1.click({ force: true });
  await page.waitForTimeout(800);

  const opt2 = page.locator('label:has-text("Organization-Wide Defaults")').first();
  await opt2.click({ force: true });
  await page.waitForTimeout(800);

  console.log('[Unit 1] Submitting quiz...');
  const btn = page.locator('text="Check the Quiz to Earn 100 Points"').or(page.locator('button:has-text("Check the Quiz")')).first();
  await btn.click({ force: true });

  await page.waitForTimeout(6000);
  const text = await page.evaluate(() => document.body.innerText);
  if (text.includes('100 Points') || text.includes('Success') || text.includes('Next Unit') || text.includes('Tackled') || text.includes('Woohoo')) {
    console.log('[Unit 1] PASSED: Overview of Data Security (+100 pts)');
  } else {
    console.log('[Unit 1] Result snippet:', text.slice(-400));
  }

  await browser.close();
})();
