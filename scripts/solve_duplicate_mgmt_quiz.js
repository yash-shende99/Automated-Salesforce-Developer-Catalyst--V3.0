const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const AUTH_FILE = path.join(__dirname, 'trailhead_auth.json');

async function solveQuiz() {
    console.log('=== SOLVING sales_admin_duplicate_management_unit_1 ===\n');

    const auth = JSON.parse(fs.readFileSync(AUTH_FILE, 'utf8'));
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    await context.addCookies(auth.cookies);
    const page = await context.newPage();

    const url = 'https://trailhead.salesforce.com/content/learn/modules/sales_admin_duplicate_management/sales_admin_duplicate_management_unit_1';
    console.log('Navigating to', url);
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 35000 });
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(4000);

    const answers = [
        'B and D',
        'Sales teams trust that you manage your CRM system with their success in mind',
        'B and C',
        "If your Salesforce org was created in Spring '15 or later",
        "Know when they're creating a potential duplicate record"
    ];

    for (let i = 0; i < answers.length; i++) {
        const ans = answers[i];
        console.log(`Selecting answer ${i + 1}: "${ans}"...`);
        const opt = page.locator('th-enhanced-quiz label, label').filter({ hasText: ans }).first();
        await opt.waitFor({ state: 'visible', timeout: 20000 });
        await opt.click();
        await page.waitForTimeout(800);
    }

    const btn = page.locator('th-enhanced-quiz button.button--success, button:has-text("Submit"), button:has-text("Check Quiz"), button:has-text("Check the Quiz")').first();
    console.log('Clicking submit button...');
    await btn.click();
    await page.waitForTimeout(8000);

    const text = await page.evaluate(() => document.body.innerText);
    const passed = text.includes('100 Points') || text.includes('Success') || text.includes('earned') || text.includes('Badge') || text.includes('Tackle the next unit');
    console.log('Result for unit 1:', passed ? 'PASSED (+100 pts)!' : 'Finished check, status undetermined');

    await browser.close();
}

solveQuiz().catch(console.error);
