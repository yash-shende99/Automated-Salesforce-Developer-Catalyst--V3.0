const { chromium } = require('playwright');
const { execSync } = require('child_process');

(async () => {
  const urlRes = execSync('sf org open -r -o trailhead --json', { encoding: 'utf8' });
  const frontdoorUrl = JSON.parse(urlRes).result.url;
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
  
  console.log('Opening frontdoor...');
  await page.goto(frontdoorUrl, { waitUntil: 'load' });
  await page.waitForTimeout(6000);

  const psQuery = execSync('sf data query -q "SELECT Id FROM PermissionSet WHERE Name = \'Manage_Job_Applications\'" -o trailhead --json', { encoding: 'utf8' });
  const psId = JSON.parse(psQuery).result.records[0].Id;
  console.log('PermissionSet Id:', psId);

  // Navigate to Permission Set setup page
  const targetUrl = `https://creative-badger-i5mqnc-dev-ed.trailblaze.lightning.force.com/lightning/setup/PermSets/page?address=%2F${psId}%3Fs%3DEntityPermissions`;
  console.log('Navigating to:', targetUrl);
  await page.goto(targetUrl, { waitUntil: 'load' });
  await page.waitForTimeout(6000);

  // Take screenshot of iframe or page
  await page.screenshot({ path: 'scripts/permset_setup.png', fullPage: true });
  console.log('Saved permset_setup.png');

  // Let's check frames
  for (const f of page.frames()) {
    const frameText = await f.evaluate(() => document.body ? document.body.innerText : '');
    if (frameText.includes('Job Application')) {
      console.log('Frame contains Job Application!');
      const jobLink = f.locator('text="Job Applications"').or(f.locator('text="Job Application"')).first();
      if (await jobLink.count() > 0) {
        console.log('Found Job Application link in frame, clicking...');
        await jobLink.click();
        await page.waitForTimeout(5000);
        await page.screenshot({ path: 'scripts/jobapp_fls.png', fullPage: true });
        console.log('Saved jobapp_fls.png');
        const flsText = await f.evaluate(() => document.body.innerText);
        console.log('FLS Text:\n', flsText.slice(0, 3000));
      }
    }
  }

  await browser.close();
})();
