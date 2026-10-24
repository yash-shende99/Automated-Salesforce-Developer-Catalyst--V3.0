const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function main() {
    const browser = await chromium.launch({ headless: true });
    const AUTH_FILE = path.join(__dirname, 'trailhead_auth.json');
    const context = await browser.newContext({
        storageState: AUTH_FILE,
        viewport: { width: 1440, height: 1000 },
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
    });

    const page = await context.newPage();
    const url = 'https://trailhead.salesforce.com/content/learn/modules/lex_implementation_data_management/lex_implementation_data_export';
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(4000);

    const matches = await page.evaluate(() => {
        const found = [];
        const all = document.querySelectorAll('*');
        for (const el of all) {
            if (el.children.length === 0 && el.innerText && el.innerText.includes('100 Points')) {
                found.push({
                    tag: el.tagName,
                    text: el.innerText,
                    className: el.className,
                    parentTag: el.parentElement ? el.parentElement.tagName : null,
                    parentClass: el.parentElement ? el.parentElement.className : null
                });
            }
        }
        return found;
    });

    console.log('Matches for 100 Points:', JSON.stringify(matches, null, 2));

    // Also look for questions
    const qMatches = await page.evaluate(() => {
        const qList = [];
        const text = document.body.innerText;
        // Search for lines starting with 1. or Question
        const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
        return lines.slice(-50);
    });
    console.log('Last 50 lines of page:');
    console.log(qMatches.join('\n'));

    await browser.close();
}

main().catch(console.error);
