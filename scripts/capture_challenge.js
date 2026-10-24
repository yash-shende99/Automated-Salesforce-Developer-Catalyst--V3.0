const { chromium } = require('playwright');
const path = require('path');

async function captureChallengeData(unitSlug = 'lex_customization_compact_layouts') {
    const AUTH_FILE = path.join(__dirname, 'trailhead_auth.json');
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        storageState: AUTH_FILE,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
    });
    const page = await context.newPage();

    const url = `https://trailhead.salesforce.com/content/learn/modules/lex_customization/${unitSlug}`;
    console.log(`Navigating to ${url}...`);
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(4000);

    const challengeText = await page.evaluate(() => {
        // Scroll down to bottom to trigger hydration of challenge
        window.scrollTo(0, document.body.scrollHeight);
        const el = document.querySelector('[data-test="challenge-container"]') ||
                   document.querySelector('.challenge') ||
                   document.querySelector('#challenge') ||
                   document.body;
        return el ? el.innerText : 'NOT_FOUND';
    });

    const lines = challengeText.split('\n').map(l => l.trim()).filter(Boolean);
    const idx = lines.findIndex(l => l.includes('Hands-on Challenge') || l.includes('YOUR CHALLENGE') || l.includes('Check Challenge'));
    if (idx !== -1) {
        console.log('--- CHALLENGE SECTION ---');
        console.log(lines.slice(Math.max(0, idx - 2), idx + 35).join('\n'));
    } else {
        console.log('--- BOTTOM 30 LINES ---');
        console.log(lines.slice(-30).join('\n'));
    }

    await browser.close();
}

const slug = process.argv[2] || 'lex_customization_compact_layouts';
captureChallengeData(slug).catch(console.error);
