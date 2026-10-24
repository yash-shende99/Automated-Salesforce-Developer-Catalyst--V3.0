const { chromium } = require('playwright');
const fs = require('fs');

const units = [
  'data_security_overview',
  'data_security_org',
  'data_security_objects',
  'data_security_fields',
  'data_security_records',
  'data_security_roles',
  'data_security_sharing_rules'
];

(async () => {
  const auth = JSON.parse(fs.readFileSync('scripts/trailhead_auth.json', 'utf8'));
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ storageState: auth });
  const page = await context.newPage();

  const details = {};

  for (const u of units) {
    const url = 'https://trailhead.salesforce.com/content/learn/modules/data_security/' + u;
    console.log('Fetching', u);
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(4000);
    const content = await page.evaluate(() => {
      const fullText = document.body.innerText;
      // find challenge start
      const challengeIdx = fullText.lastIndexOf('Hands-on Challenge');
      const quizIdx = fullText.lastIndexOf('Take the Quiz');
      const startIdx = Math.max(challengeIdx, quizIdx);
      if (startIdx !== -1) {
        return fullText.slice(startIdx);
      }
      return fullText.slice(-2500);
    });
    details[u] = content;
  }
  fs.writeFileSync('scripts/data_security_requirements.json', JSON.stringify(details, null, 2));
  console.log('Saved requirements to scripts/data_security_requirements.json');
  await browser.close();
})();
