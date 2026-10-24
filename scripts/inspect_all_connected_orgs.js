const { chromium } = require('playwright');
const fs = require('fs');

async function main() {
    const auth = JSON.parse(fs.readFileSync('scripts/trailhead_auth.json', 'utf8'));
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    await context.addCookies(auth.cookies);
    const page = await context.newPage();

    console.log('Navigating to https://trailhead.salesforce.com/users/profiles/orgs...');
    await page.goto('https://trailhead.salesforce.com/users/profiles/orgs', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(5000);

    const data = await page.evaluate(() => {
        const rows = Array.from(document.querySelectorAll('tr, .tds-card, [data-testid="org-item"], li'));
        const orgs = [];
        for (const r of rows) {
            const text = r.innerText.trim();
            if (text.includes('Playground') || text.includes('Developer Edition') || text.includes('@')) {
                orgs.push(text.replace(/\n+/g, ' | '));
            }
        }
        return {
            fullText: document.body.innerText.slice(0, 3000),
            orgs: [...new Set(orgs)]
        };
    });

    console.log('Orgs Found:\n', data.orgs.join('\n---\n'));
    await browser.close();
}

main().catch(console.error);
