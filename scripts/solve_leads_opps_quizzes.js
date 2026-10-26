// scripts/solve_leads_opps_quizzes.js
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const AUTH_FILE = path.join(__dirname, 'trailhead_auth.json');

const QUIZ_ANSWERS = {
  'sell-as-a-team-and-split-the-credit': [
    'They share information, tips, or contacts that help close the deal',
    'An overlay split'
  ],
  'visualize-success-with-path-and-kanban': [
    'In any list view, click Shuffle to change up every record’s status.',
    'Check the filter panel to see if records are being filtered out.'
  ]
};

async function solveQuiz(page, unitSlug, answers) {
  const url = `https://trailhead.salesforce.com/content/learn/modules/leads_opportunities_lightning_experience/${unitSlug}`;
  console.log(`\nNavigating to: ${url}`);
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(4000);

  const isDone = await page.evaluate(() => {
    return !!document.body.innerText.includes('Challenge Completed') || !!document.querySelector('.c-badge--success');
  });

  if (isDone) {
    console.log(`Unit ${unitSlug} is already completed!`);
    return true;
  }

  for (let i = 0; i < answers.length; i++) {
    const ans = answers[i];
    console.log(`[Q${i+1}] Selecting answer: "${ans}"`);
    try {
      const loc = page.locator('th-enhanced-quiz label').filter({ hasText: ans }).first();
      await loc.scrollIntoViewIfNeeded({ timeout: 5000 });
      await loc.click({ force: true, timeout: 5000 });
      await page.waitForTimeout(1000);
    } catch (e) {
      console.log(`Fallback clicking for: ${ans}`);
      await page.evaluate((targetText) => {
        const labels = Array.from(document.querySelectorAll('label'));
        for (const l of labels) {
          if (l.innerText.includes(targetText)) {
            l.click();
            return;
          }
        }
      }, ans);
    }
  }

  await page.waitForTimeout(2000);

  console.log('Submitting quiz...');
  try {
    const submitBtn = page.locator('th-enhanced-quiz button.button--success, button:has-text("Check Quiz"), button:has-text("Submit")').first();
    await submitBtn.scrollIntoViewIfNeeded({ timeout: 5000 });
    await submitBtn.click({ force: true, timeout: 5000 });
  } catch (e) {
    console.log('Fallback submit button click...');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const b = btns.find(x => x.innerText.includes('Submit') || x.innerText.includes('Check Quiz') || x.className.includes('button--success'));
      if (b) b.click();
    });
  }

  await page.waitForTimeout(8000);
  console.log(`Submitted unit ${unitSlug}!`);
}

async function main() {
  const auth = JSON.parse(fs.readFileSync(AUTH_FILE, 'utf8'));
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  await context.addCookies(auth.cookies);
  const page = await context.newPage();

  const targetUnit = process.argv[2];
  if (targetUnit && QUIZ_ANSWERS[targetUnit]) {
    await solveQuiz(page, targetUnit, QUIZ_ANSWERS[targetUnit]);
  } else {
    for (const [slug, answers] of Object.entries(QUIZ_ANSWERS)) {
      await solveQuiz(page, slug, answers);
      await page.waitForTimeout(5000);
    }
  }

  await browser.close();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { solveQuiz, QUIZ_ANSWERS };
