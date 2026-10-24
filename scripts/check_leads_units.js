const { chromium } = require('playwright');
const fs = require('fs');

async function main() {
  const auth = JSON.parse(fs.readFileSync('scripts/trailhead_auth.json', 'utf8'));
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  await context.addCookies(auth.cookies);
  const page = await context.newPage();
  await page.goto('https://trailhead.salesforce.com/content/learn/modules/leads_opportunities_lightning_experience', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(5000);

  const fullText = await page.evaluate(() => document.body.innerText);
  console.log(fullText.slice(0, 3000));
  await browser.close();
}

main().catch(console.error);
