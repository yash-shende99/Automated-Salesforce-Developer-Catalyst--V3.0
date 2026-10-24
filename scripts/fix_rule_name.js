const { chromium } = require('playwright');
const { execSync } = require('child_process');

(async () => {
  const urlRes = execSync('sf org open -r -o trailhead --json', { encoding: 'utf8' });
  const frontdoorUrl = JSON.parse(urlRes).result.url;
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1400, height: 1200 } });
  await page.goto(frontdoorUrl, { waitUntil: 'load' });
  await page.waitForTimeout(3000);

  const targetUrl = 'https://creative-badger-i5mqnc-dev-ed.trailblaze.my.salesforce.com/setup/own/shareRule.jsp?id=03Fg8000001T0qT&entity=a0A';
  await page.goto(targetUrl, { waitUntil: 'load' });
  await page.waitForTimeout(3000);

  page.on('dialog', async dialog => {
    console.log('Dialog popped up:', dialog.message());
    await dialog.accept();
  });

  // Set ruleDevName to Campus_Outreach_Programs
  await page.locator('#ruleDevName').fill('Campus_Outreach_Programs');
  console.log('Filled ruleDevName with Campus_Outreach_Programs');

  // Click Save
  await page.locator('input[name="save"]').first().click();
  console.log('Clicked Save!');
  await page.waitForTimeout(6000);

  console.log('Current URL after save:', page.url());
  await browser.close();
})();
