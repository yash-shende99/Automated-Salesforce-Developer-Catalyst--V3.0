const { chromium } = require('playwright');
const path = require('path');

async function inspectOrgsPage() {
    const AUTH_FILE = path.join(__dirname, 'trailhead_auth.json');
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        storageState: AUTH_FILE,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
    });
    const page = await context.newPage();

    console.log('[Orgs] Navigating to https://trailhead.salesforce.com/users/profiles/orgs');
    await page.goto('https://trailhead.salesforce.com/users/profiles/orgs', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(6000);

    const text = await page.evaluate(() => document.body.innerText);
    console.log('--- Page text ---');
    console.log(text.slice(0, 2000));
    console.log('-----------------');

    const buttonsAndLinks = await page.evaluate(() => {
        const items = [];
        document.querySelectorAll('a, button').forEach(el => {
            const t = (el.innerText || el.getAttribute('aria-label') || '').trim();
            const h = el.getAttribute('href');
            if (t || h) {
                items.push({ tag: el.tagName, text: t, href: h });
            }
        });
        return items;
    });

    console.log('Actionable elements:');
    console.log(buttonsAndLinks.filter(x => x.text.includes('Launch') || x.text.includes('curious') || (x.href && x.href.includes('salesforce'))));

    await browser.close();
}

inspectOrgsPage().catch(console.error);
