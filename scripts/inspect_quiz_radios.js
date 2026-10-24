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

    const radios = await page.evaluate(() => {
        function getShadow(root) {
            let res = Array.from(root.querySelectorAll('input[type="radio"], label'));
            const walkers = Array.from(root.querySelectorAll('*'));
            for (const el of walkers) {
                if (el.shadowRoot) res = res.concat(getShadow(el.shadowRoot));
            }
            return res;
        }

        return getShadow(document).map(el => ({
            tag: el.tagName,
            type: el.type,
            name: el.name,
            value: el.value,
            id: el.id,
            text: el.innerText
        }));
    });

    console.log('Radios & Labels:', JSON.stringify(radios, null, 2));
    await browser.close();
}

main().catch(console.error);
