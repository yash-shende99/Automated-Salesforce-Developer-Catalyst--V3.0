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

  // Find Edit links
  const editLinks = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('a'))
      .filter(a => a.href && a.href.includes('SharingRule') && a.innerText.trim() === 'Edit')
      .map(a => a.href);
  });
  console.log('Edit links found:', editLinks);

  if (editLinks.length > 0) {
    const lastLink = editLinks[editLinks.length - 1]; // Program sharing rule is at the bottom
    console.log('Navigating to last Edit link:', lastLink);
    await page.goto(lastLink, { waitUntil: 'load' });
    await page.waitForTimeout(4000);
    const bodyText = await page.evaluate(() => document.body.innerText);
    console.log('Edit page text:\n', bodyText.slice(0, 1500));
  }

  await browser.close();
})();
