const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const AUTH_FILE = path.join(__dirname, 'trailhead_auth.json');

async function main() {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ storageState: AUTH_FILE });
    const page = await context.newPage();

    await page.goto('https://trailhead.salesforce.com/content/learn/modules/spe_admins/spe_admins_get_started', { waitUntil: 'networkidle' });
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(3000);

    const questionHtml = await page.evaluate(() => {
        const quiz = document.querySelector('th-enhanced-quiz') || document.querySelector('tds-enhanced-quiz') || document.querySelector('[data-react-class="challenge/Challenge"]');
        return quiz ? quiz.outerHTML.slice(0, 3000) : 'Not found';
    });

    console.log('Quiz outer HTML preview:\n', questionHtml);

    // Let's also check shadow root of th-enhanced-quiz
    const shadowInfo = await page.evaluate(() => {
        const el = document.querySelector('th-enhanced-quiz');
        if (!el || !el.shadowRoot) return 'No shadow root on th-enhanced-quiz';
        return el.shadowRoot.innerHTML.slice(0, 3000);
    });

    console.log('Shadow HTML preview:\n', shadowInfo);
    await browser.close();
}

main().catch(console.error);
