const { chromium } = require('playwright');
const path = require('path');

async function main() {
    const browser = await chromium.launch({ headless: true });
    const AUTH_FILE = path.join(__dirname, 'trailhead_auth.json');
    const context = await browser.newContext({ storageState: AUTH_FILE });
    const page = await context.newPage();

    const url = 'https://trailhead.salesforce.com/content/learn/modules/lex_implementation_data_management/lex_implementation_data_export';
    console.log(`Navigating to ${url}...`);
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(4000);

    // Dismiss banner
    try {
        const accept = page.locator('#accept-recommended-btn-handler');
        if (await accept.isVisible()) await accept.click();
    } catch(e) {}

    // Find all text inside the quiz component
    const quizTexts = await page.locator('c-trailhead-quiz, [data-test-id="quiz"], [data-test-id="challenge"]').allInnerTexts();
    console.log('Quiz Component Texts:', quizTexts);

    // Also look for question elements using shadow piercing
    const legends = await page.locator('legend, .slds-form-element__legend, [data-test-id="question-title"]').allInnerTexts();
    console.log('Question Legends:', legends);

    const labels = await page.locator('label').allInnerTexts();
    console.log('All Labels:', labels.filter(l => l.length > 5));

    await browser.close();
}

main().catch(console.error);
