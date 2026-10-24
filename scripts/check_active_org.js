const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const auth = JSON.parse(fs.readFileSync('scripts/trailhead_auth.json', 'utf8'));
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ storageState: auth });
  const page = await context.newPage();
  await page.goto('https://trailhead.salesforce.com/content/learn/modules/data_security/data_security_sharing_rules', { waitUntil: 'networkidle' });
  await page.waitForTimeout(4000);

  const data = await page.evaluate(() => {
    const textNodes = Array.from(document.querySelectorAll('*'))
      .filter(el => el.children.length === 0 && (el.innerText || '').includes('creative-badger'))
      .map(el => el.innerText);
    
    // Also look for any org launch buttons or labels
    const launchElements = Array.from(document.querySelectorAll('button, a, span, div'))
      .filter(el => (el.innerText || '').includes('Launch') || (el.innerText || '').includes('creative') || (el.innerText || '').includes('TP-'))
      .map(el => el.innerText.trim())
      .filter((v, i, a) => a.indexOf(v) === i && v.length < 100);

    return { textNodes, launchElements };
  });

  console.log('Detected Org info on page:', data);
  await browser.close();
})();
