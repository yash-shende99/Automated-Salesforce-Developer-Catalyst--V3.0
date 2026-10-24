const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const AUTH_FILE = path.join(__dirname, 'trailhead_auth.json');

async function dumpUnit(slug) {
    const auth = JSON.parse(fs.readFileSync(AUTH_FILE, 'utf8'));
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
    });
    await context.addCookies(auth.cookies);
    const page = await context.newPage();

    const url = `https://trailhead.salesforce.com/content/learn/modules/api_basics/${slug}`;
    console.log(`Navigating to ${url}...`);
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);

    const text = await page.evaluate(() => {
        const main = document.querySelector('main') || document.body;
        return main.innerText;
    });

    fs.writeFileSync(`scripts/${slug}_text.txt`, text, 'utf8');
    console.log(`Saved scripts/${slug}_text.txt, length: ${text.length}`);
    await browser.close();
}

async function main() {
    await dumpUnit('api_basics_rest');
    await dumpUnit('api_basics_bulk');
}

main().catch(console.error);
