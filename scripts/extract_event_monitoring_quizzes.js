const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function extractQuiz(slug) {
    const browser = await chromium.launch({ headless: true });
    const AUTH_FILE = path.join(__dirname, 'trailhead_auth.json');
    const context = await browser.newContext({ storageState: AUTH_FILE });
    const page = await context.newPage();

    const url = `https://trailhead.salesforce.com/content/learn/modules/event_monitoring/${slug}`;
    console.log(`\n========================================`);
    console.log(`Inspecting ${slug}...`);
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(4000);

    const questions = await page.locator('legend, .slds-form-element__legend, [data-test-id="question-title"]').allInnerTexts();
    const labels = await page.locator('label').allInnerTexts();

    console.log('Questions:', questions);
    console.log('Options:', labels.filter(l => l.length > 5 && !l.includes('Cookie') && !l.includes('Search') && !l.includes('language')));

    await browser.close();
}

async function main() {
    for (const slug of ['event_monitoring_intro', 'event_monitoring_query', 'event_monitoring_download']) {
        await extractQuiz(slug);
    }
}

main().catch(console.error);
