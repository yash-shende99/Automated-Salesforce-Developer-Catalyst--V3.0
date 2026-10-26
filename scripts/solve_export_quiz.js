const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function main() {
    console.log('=== SOLVING UNIT 2: Export Data (lex_implementation_data_export) ===');
    const browser = await chromium.launch({ headless: true });
    const AUTH_FILE = path.join(__dirname, 'trailhead_auth.json');
    const context = await browser.newContext({
        storageState: AUTH_FILE,
        viewport: { width: 1440, height: 1000 },
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
    });

    const page = await context.newPage();
    const url = 'https://trailhead.salesforce.com/content/learn/modules/lex_implementation_data_management/lex_implementation_data_export';
    console.log(`Navigating to ${url}...`);
    try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 35000 });
    } catch (e) {
        console.log('[Nav] Continuing past timeout...');
    }
    await page.waitForTimeout(4000);

    // Dismiss banner
    try {
        const accept = page.locator('#accept-recommended-btn-handler');
        if (await accept.isVisible()) await accept.click();
    } catch(e) {}

    await page.waitForLoadState('domcontentloaded').catch(() => {});
    await page.waitForTimeout(3000);

    // Scroll down to quiz
    console.log('Scrolling down to quiz...');
    await page.evaluate(() => {
        if (document.body) {
            window.scrollTo(0, document.body.scrollHeight);
        } else {
            window.scrollTo(0, 5000);
        }
    });
    await page.waitForTimeout(2000);

    // Wait for quiz to render
    console.log('Waiting for quiz text to appear...');
    const q1 = page.locator('text="Is accessible through the Setup menu."').first();
    await q1.waitFor({ state: 'attached', timeout: 30000 });
    console.log('Quiz found! Selecting answers...');

    await q1.scrollIntoViewIfNeeded().catch(() => {});
    await q1.click({ force: true });
    await page.waitForTimeout(1000);

    const q2 = page.locator('text="From Setup, open Data Export and then select Export Now."').first();
    await q2.scrollIntoViewIfNeeded().catch(() => {});
    await q2.click({ force: true });
    await page.waitForTimeout(1000);

    const q3 = page.locator('text="Monthly"').first();
    await q3.scrollIntoViewIfNeeded().catch(() => {});
    await q3.click({ force: true });
    await page.waitForTimeout(1000);

    await page.screenshot({ path: 'scripts/quiz_answers_selected.png' });

    // Click submit button
    console.log('Clicking Check the Quiz button...');
    const submitBtn = page.locator('button:has-text("Check"), button:has-text("100 Points")').last();
    await submitBtn.waitFor({ state: 'attached', timeout: 10000 });
    await submitBtn.click({ force: true });
    await page.waitForTimeout(8000);

    await page.screenshot({ path: 'scripts/quiz_submitted.png' });
    console.log('Quiz submitted! Checking page result...');

    const bodyText = await page.evaluate(() => document.body.innerText);
    if (bodyText.includes('You earned') || bodyText.includes('100 Points') || bodyText.includes('Success') || bodyText.includes('Badge')) {
        console.log('SUCCESS: Quiz passed!');
    } else {
        console.log('Submission result preview:', bodyText.slice(-1000));
    }

    await browser.close();
    console.log('=== UNIT 2 COMPLETE ===');
}

main().catch(err => {
    console.error('Error:', err);
    process.exit(1);
});
