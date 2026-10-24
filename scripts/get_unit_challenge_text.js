const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function getChallenge(url) {
    const AUTH_FILE = path.join(__dirname, 'trailhead_auth.json');
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        storageState: AUTH_FILE,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
    });
    const page = await context.newPage();
    console.log(`Loading ${url}...`);
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(4000);

    const challengeText = await page.evaluate(() => {
        // Find challenge container or bottom section
        const c = document.querySelector('[data-test="challenge-container"]') ||
                  document.querySelector('.challenge') ||
                  document.querySelector('#challenge') ||
                  document.body;
        return c.innerText;
    });

    const lines = challengeText.split('\n');
    const hocIdx = lines.findIndex(l => l.includes('Hands-on Challenge') || l.includes('Check Challenge') || l.includes('Quiz'));
    if (hocIdx !== -1) {
        console.log('--- CHALLENGE SECTION ---');
        console.log(lines.slice(Math.max(0, hocIdx - 5)).join('\n'));
    } else {
        console.log('--- LAST 2000 CHARS ---');
        console.log(challengeText.slice(-2000));
    }

    await browser.close();
}

const targetUrl = process.argv[2] || 'https://trailhead.salesforce.com/content/learn/modules/lex_customization/lex_customization_list';
getChallenge(targetUrl).catch(console.error);
