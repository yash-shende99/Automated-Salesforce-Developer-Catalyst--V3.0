const { chromium } = require('playwright');
const path = require('path');

async function interceptQuiz() {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ storageState: path.join(__dirname, 'trailhead_auth.json') });
    const page = await context.newPage();

    let capturedPost = null;
    page.on('request', req => {
        if (req.method() === 'POST' && (req.url().includes('check_challenge') || req.url().includes('quiz') || req.url().includes('assessments'))) {
            capturedPost = {
                url: req.url(),
                postData: req.postData()
            };
            console.log('\n======================================');
            console.log('[CAPTURED POST REQUEST]');
            console.log('URL:', req.url());
            console.log('Payload:', req.postData());
            console.log('======================================\n');
        }
    });

    await page.goto('https://trailhead.salesforce.com/content/learn/modules/flow-basics/get-started-with-flows', { waitUntil: 'domcontentloaded' });
    
    // Dismiss cookie banner
    try {
        const accept = page.locator('#accept-recommended-btn-handler');
        if (await accept.isVisible()) await accept.click();
    } catch(e) {}

    await page.waitForTimeout(3000);

    // Playwright automatically pierces Shadow DOM!
    console.log('Selecting answers via Playwright shadow-piercing locators...');
    await page.locator('text="True"').first().click();
    await page.locator('text="Schedule-triggered flow"').first().click();
    await page.waitForTimeout(1000);

    const checkBtn = page.locator('button:has-text("Check Quiz"), button:has-text("Check Challenge"), button:has-text("Submit")').last();
    console.log('Clicking check button...');
    await checkBtn.click();
    await page.waitForTimeout(5000);

    if (capturedPost) {
        console.log('SUCCESS! Captured payload:', capturedPost);
    } else {
        console.log('No post request captured.');
    }

    await browser.close();
}

interceptQuiz().catch(console.error);
