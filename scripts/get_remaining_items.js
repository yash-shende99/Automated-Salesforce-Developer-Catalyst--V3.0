const fs = require('fs');
const { chromium } = require('playwright');
const path = require('path');

const AUTH_FILE = path.join(__dirname, 'trailhead_auth.json');

async function main() {
    const auth = JSON.parse(fs.readFileSync(AUTH_FILE, 'utf8'));
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    await context.addCookies(auth.cookies);
    const page = await context.newPage();

    await page.goto('https://trailhead.salesforce.com/users/trjha3/trailmixes/salesforce-developer-catalyst-v-3-0', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(4000);

    const items = await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('a[href*="/content/learn/"]'));
        const seen = new Set();
        const res = [];
        for (const a of links) {
            const href = a.href.split('?')[0];
            const text = a.innerText.trim();
            if (text && !seen.has(href)) {
                seen.add(href);
                res.push({ text, href });
            }
        }
        return res;
    });

    console.log(JSON.stringify(items, null, 2));
    await browser.close();
}

main().catch(console.error);
