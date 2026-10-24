const { chromium } = require('playwright');
const fs = require('fs');

const units = [
  'create-custom-profiles',
  'fls-perm-sets-sharing'
];

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const details = {};

  for (const u of units) {
    const url = 'https://trailhead.salesforce.com/content/learn/projects/keep-data-secure-in-a-recruiting-app/' + u;
    console.log('Fetching', u);
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(4000);
    const content = await page.evaluate(() => {
      const fullText = document.body.innerText;
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
  fs.writeFileSync('scripts/proj22_requirements.json', JSON.stringify(details, null, 2));
  console.log('Saved requirements to scripts/proj22_requirements.json');
  await browser.close();
})();
