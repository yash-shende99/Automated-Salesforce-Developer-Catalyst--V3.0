const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const AUTH_FILE = path.join(__dirname, 'trailhead_auth.json');

async function main() {
    const auth = JSON.parse(fs.readFileSync(AUTH_FILE, 'utf8'));
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    await context.addCookies(auth.cookies);
    const page = await context.newPage();

    await page.goto('https://trailhead.salesforce.com/content/learn/modules/api_basics/api_basics_bulk', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(4000);

    const href = await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('a'));
        const hoc = links.find(a => a.innerText.includes('bulkv2hocdata') || (a.href && a.href.includes('bulkv2hocdata')));
        return hoc ? { text: hoc.innerText, href: hoc.href } : null;
    });

    console.log('HOC file link:', href);
    await browser.close();
}

main().catch(console.error);
