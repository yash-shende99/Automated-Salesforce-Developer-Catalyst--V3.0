// scripts/solve_soql_quizzes.js
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const AUTH_FILE = path.join(__dirname, 'trailhead_auth.json');

const QUIZ_ANSWERS = {
  'get-started-with-soql-queries': [
    'SELECT and FROM',
    "SELECT ID, Name FROM Account WHERE Name = 'ACME Inc'"
  ],
  'create-relationship-queries-with-standard-objects': [
    'SELECT Contact.Name, Priority FROM Case',
    'False'
  ],
  'use-bind-variables-and-aggregate-functions': [
    ':',
    'SELECT MAX(Price__c), City__c FROM Property__c Group BY City__c'
  ]
};

async function solveQuiz(page, unitSlug, answers) {
  const url = `https://trailhead.salesforce.com/content/learn/modules/soql-for-admins/${unitSlug}`;
  console.log(`\nNavigating to: ${url}`);
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  // Check if already completed
  const isDone = await page.evaluate(() => {
    return !!document.body.innerText.includes('Challenge Completed') || !!document.querySelector('.c-badge--success');
  });

  if (isDone) {
    console.log(`Unit ${unitSlug} is already completed!`);
    return true;
  }

  // Answer each question
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
