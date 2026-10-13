const { chromium } = require('playwright');
const path = require('path');

async function testLoad() {
    console.log('Testing commit + waitForSelector loading...');
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        storageState: path.join(__dirname, 'trailhead_auth.json'),
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    });
    const page = await context.newPage();
    const url = 'https://trailhead.salesforce.com/content/learn/modules/lex_implementation_data_management/lex_implementation_data_export';

    console.log(`Navigating to ${url} (commit wait)...`);
    await page.goto(url, { waitUntil: 'commit', timeout: 45000 });
    console.log('Navigation committed! Waiting for body...');

    await page.waitForSelector('body', { timeout: 45000 });
    console.log('Body tag present! Waiting for main container or quiz...');

    await page.waitForSelector('h1, article, main, .c-badge', { timeout: 45000 });
    console.log('Content loaded! Title:', await page.title());

    // Scroll to bottom
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(4000);

    const bodyText = await page.evaluate(() => document.body.innerText);
    console.log('Body length:', bodyText.length);
    console.log('Contains "Is accessible":', bodyText.includes('Is accessible'));
    console.log('Contains "100 Points":', bodyText.includes('100 Points'));
    console.log('Contains "Completed":', bodyText.includes('Completed'));

    if (bodyText.includes('Is accessible')) {
        console.log('Selecting answers...');
        await page.locator('text="Is accessible through the Setup menu."').first().click({ force: true });
        await page.waitForTimeout(1000);
        await page.locator('text="From Setup, open Data Export and then select Export Now."').first().click({ force: true });
        await page.waitForTimeout(1000);
        await page.locator('text="Monthly"').first().click({ force: true });
        await page.waitForTimeout(1000);

        console.log('Submitting...');
        const btn = page.locator('button:has-text("Check"), button:has-text("100 Points")').last();
        await btn.click({ force: true });
        await page.waitForTimeout(8000);

        const afterText = await page.evaluate(() => document.body.innerText);
        console.log('Passed:', afterText.includes('100 Points') || afterText.includes('Success') || afterText.includes('earned'));
    }

    await browser.close();
}

testLoad().catch(console.error);
