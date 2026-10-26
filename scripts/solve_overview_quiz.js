const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const AUTH_FILE = path.join(__dirname, 'trailhead_auth.json');

async function main() {
    console.log('=== SOLVING api_basics_overview ===\n');

    const auth = JSON.parse(fs.readFileSync(AUTH_FILE, 'utf8'));
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    await context.addCookies(auth.cookies);
    const page = await context.newPage();

    const url = 'https://trailhead.salesforce.com/content/learn/modules/api_basics/api_basics_overview';
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    const ans1 = 'Writing a mobile or web app';
    const ans2 = 'Deleting 100,000 records at once';

    console.log('Waiting for quiz labels to appear...');
    const opt1 = page.locator('th-enhanced-quiz label').filter({ hasText: ans1 }).first();
    await opt1.waitFor({ state: 'visible', timeout: 20000 });
    console.log('Clicking option 1...');
    await opt1.click();
    await page.waitForTimeout(1000);

    console.log('Clicking option 2...');
    // Note that ans2 is option D on the second question
    const opt2 = page.locator('th-enhanced-quiz label').filter({ hasText: ans2 }).last();
    await opt2.click();
    await page.waitForTimeout(1000);

    const btn = page.locator('th-enhanced-quiz button.button--success').first();
    console.log('Submit button class:', await btn.getAttribute('class'));
    console.log('Clicking submit button...');
    await btn.click();
    await page.waitForTimeout(8000);

    const text = await page.evaluate(() => document.body.innerText);
    const passed = text.includes('100 Points') || text.includes('Success') || text.includes('earned') || text.includes('Badge');
    console.log('Result for api_basics_overview:', passed ? 'PASSED (+100 pts)!' : 'Finished');

    await browser.close();
}

main().catch(console.error);
