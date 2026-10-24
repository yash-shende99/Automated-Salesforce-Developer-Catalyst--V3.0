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

    const buttons = await page.evaluate(() => {
        function getShadowElements(root, selector) {
            let res = Array.from(root.querySelectorAll(selector));
            const walkers = Array.from(root.querySelectorAll('*'));
            for (const el of walkers) {
                if (el.shadowRoot) {
                    res = res.concat(getShadowElements(el.shadowRoot, selector));
                }
            }
            return res;
        }

        const allBtns = getShadowElements(document, 'button, input[type="submit"], [role="button"]');
        return allBtns.map(b => ({
            tag: b.tagName,
            type: b.type,
            text: b.innerText || b.value,
            id: b.id,
            className: b.className
        }));
    });

    console.log('Buttons found:', JSON.stringify(buttons, null, 2));
    await page.screenshot({ path: 'scratch_quiz_buttons.png' });
    await browser.close();
}

main().catch(console.error);
