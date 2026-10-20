const { chromium } = require('playwright');
const { execSync } = require('child_process');

(async () => {
  const urlRes = execSync('sf org open -r -o trailhead --json', { encoding: 'utf8' });
  const frontdoorUrl = JSON.parse(urlRes).result.url;
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
  await page.goto(frontdoorUrl, { waitUntil: 'load' });
  await page.waitForTimeout(4000);

  const targetUrl = 'https://creative-badger-i5mqnc-dev-ed.trailblaze.my.salesforce.com/setup/own/shareRule.jsp?id=03Fg8000001T0qT&entity=a0A';
  await page.goto(targetUrl, { waitUntil: 'load' });
  await page.waitForTimeout(4000);

  page.on('dialog', async dialog => {
    console.log('Dialog popped up:', dialog.message());
    await dialog.accept();
  });

  const saveBtn = page.locator('input[name="save"]').first();
  await saveBtn.click();
  console.log('Clicked Save on sharing rule!');
  await page.waitForTimeout(8000);

  console.log('After save URL:', page.url());
  const bodyText = await page.evaluate(() => document.body.innerText);
  const idx = bodyText.indexOf('Program Sharing Rules');
  if (idx !== -1) {
    console.log('Page snippet after save:\n', bodyText.slice(idx, idx + 500));
  }

  await browser.close();
})();
