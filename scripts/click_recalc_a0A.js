const { chromium } = require('playwright');
const { execSync } = require('child_process');

(async () => {
  const urlRes = execSync('sf org open -r -o trailhead --json', { encoding: 'utf8' });
  const frontdoorUrl = JSON.parse(urlRes).result.url;
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
  await page.goto(frontdoorUrl, { waitUntil: 'load' });
  await page.waitForTimeout(4000);

  const targetUrl = 'https://creative-badger-i5mqnc-dev-ed.trailblaze.my.salesforce.com/p/own/OrgSharingDetail?setupid=SecuritySharing';
  await page.goto(targetUrl, { waitUntil: 'load' });
  await page.waitForTimeout(4000);

  page.on('dialog', async d => {
    console.log('Dialog:', d.message());
    await d.accept();
  });

  const btn = page.locator('input[name="calca0A"]').first();
  if (await btn.count() > 0) {
    console.log('Found calca0A! Clicking Recalculate...');
    await btn.click();
    await page.waitForTimeout(5000);
    console.log('Recalculation triggered!');
  } else {
    console.log('calca0A button not found');
  }

  await browser.close();
})();
