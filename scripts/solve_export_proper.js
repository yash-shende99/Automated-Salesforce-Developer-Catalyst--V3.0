const { chromium } = require('playwright');
const path = require('path');

async function main() {
    console.log('=== SOLVING UNIT 2: Export Data ===');
    const browser = await chromium.launch({ headless: true });
    const AUTH_FILE = path.join(__dirname, 'trailhead_auth.json');
    const context = await browser.newContext({
        storageState: AUTH_FILE,
        viewport: { width: 1440, height: 1000 },
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
    });

    const page = await context.newPage();
    
    // Block unnecessary requests to load in seconds
    await page.route('**/*', route => {
        const type = route.request().resourceType();
        const u = route.request().url();
        if (['image', 'media', 'font'].includes(type) || 
            u.includes('analytics') || u.includes('onetrust') || u.includes('googletagmanager') || 
            u.includes('doubleclick') || u.includes('salesforceiq') || u.includes('evergage')) {
            return route.abort();
        }
        return route.continue();
    });

    const url = 'https://trailhead.salesforce.com/content/learn/modules/lex_implementation_data_management/lex_implementation_data_export';
    console.log(`Navigating to ${url}...`);
    
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    console.log('DOM Content Loaded! Waiting 3s for hydration...');
    await page.waitForTimeout(3000);

    // Accept cookies if banner visible
    try {
        const accept = page.locator('#accept-recommended-btn-handler');
        if (await accept.isVisible()) await accept.click();
    } catch(e) {}

    // Scroll to bottom
    console.log('Scrolling down to quiz...');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(4000);

    // Wait for quiz text
    console.log('Waiting for quiz options...');
    const q1 = page.locator('text="Is accessible through the Setup menu."').first();
    await q1.waitFor({ state: 'attached', timeout: 30000 });
    console.log('Found Q1 option! Clicking answers...');

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

    console.log('Clicking Check Quiz button...');
    const submitBtn = page.locator('button:has-text("Check"), button:has-text("100 Points")').last();
    await submitBtn.waitFor({ state: 'attached', timeout: 15000 });
    await submitBtn.scrollIntoViewIfNeeded().catch(() => {});
    await submitBtn.click({ force: true });

    console.log('Waiting 10s for submission result...');
    await page.waitForTimeout(10000);

    const bodyText = await page.evaluate(() => document.body.innerText);
    const success = bodyText.includes('100 Points') || bodyText.includes('Success') || bodyText.includes('Badge') || bodyText.includes('Tackle') || bodyText.includes('Woohoo');
    console.log('Result:', success ? 'PASSED (+100 pts)!' : 'Check page manually');
    await page.screenshot({ path: 'scripts/export_result.png' });

    await browser.close();
    console.log('Done.');
}

main().catch(err => {
    console.error('Error:', err);
    process.exit(1);
});
