const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const auth = JSON.parse(fs.readFileSync('scripts/trailhead_auth.json', 'utf8'));
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ storageState: auth });

  const steps = ['create-custom-profiles', 'fls-perm-sets-sharing'];
  for (const s of steps) {
    const page = await context.newPage();
    const url = `https://trailhead.salesforce.com/content/learn/projects/keep-data-secure-in-a-recruiting-app/${s}`;
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(4000);

    const bodyText = await page.evaluate(() => document.body.innerText);
    const idx = bodyText.indexOf('Hands-on Challenge');
    console.log(`\n================ STEP: ${s} ================`);
    if (idx !== -1) {
      console.log(bodyText.slice(idx, idx + 2500));
    } else {
      console.log(bodyText.slice(-2000));
    }
    await page.close();
  }
  await browser.close();
})();
