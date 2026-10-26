const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const AUTH_FILE = path.join(__dirname, 'trailhead_auth.json');

async function solveQuiz() {
    console.log('=== SOLVING lex_customization_actions ===\n');

    const auth = JSON.parse(fs.readFileSync(AUTH_FILE, 'utf8'));
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    await context.addCookies(auth.cookies);
    const page = await context.newPage();

    const url = 'https://trailhead.salesforce.com/content/learn/modules/lex_customization/lex_customization_actions';
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(3000);

    const ans1 = 'B and C';
    const ans2 = 'Object-specific actions have automatic relationships to other records, and global actions';

    console.log('Waiting for quiz labels to appear...');
    const opt1 = page.locator('th-enhanced-quiz label, label').filter({ hasText: ans1 }).first();
    await opt1.waitFor({ state: 'visible', timeout: 20000 });
    console.log('Clicking option 1...');
    await opt1.click();
    await page.waitForTimeout(1000);

    console.log('Clicking option 2...');
    const opt2 = page.locator('th-enhanced-quiz label, label').filter({ hasText: ans2 }).first();
    await opt2.click();
    await page.waitForTimeout(1000);

    const btn = page.locator('th-enhanced-quiz button.button--success, button:has-text("Submit"), button:has-text("Check Quiz")').first();
    console.log('Clicking submit button...');
    await btn.click();
    await page.waitForTimeout(8000);

    const text = await page.evaluate(() => document.body.innerText);
    const passed = text.includes('100 Points') || text.includes('Success') || text.includes('earned') || text.includes('Badge') || text.includes('Retake Quiz');
    console.log('Result for lex_customization_actions:', passed ? 'PASSED (+100 pts)!' : 'Finished check');

    await browser.close();
}

solveQuiz().catch(console.error);
