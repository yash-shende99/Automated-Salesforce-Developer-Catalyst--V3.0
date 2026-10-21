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

  const buttons = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('input[type="button"], input[type="submit"]'))
      .filter(b => b.value && b.value.includes('Recalculate'))
      .map(b => ({ value: b.value, name: b.name, id: b.id }));
  });
  console.log('Recalculate buttons:', buttons);

  await browser.close();
})();
