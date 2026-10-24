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

    const info = await page.evaluate(() => {
        function findInShadow(root) {
            let res = [];
            const btns = Array.from(root.querySelectorAll('button'));
            for (const b of btns) {
                if (b.className.includes('button--success') || b.className.includes('button--variant') || b.innerText.includes('Check') || b.innerText.includes('Quiz') || b.innerText.includes('Points')) {
                    res.push({
                        tag: b.tagName,
                        className: b.className,
                        text: b.innerText,
                        parentTag: b.parentElement ? b.parentElement.tagName : null,
                        shadowHost: root.host ? root.host.tagName : 'document'
                    });
                }
            }
            const walkers = Array.from(root.querySelectorAll('*'));
            for (const el of walkers) {
                if (el.shadowRoot) res = res.concat(findInShadow(el.shadowRoot));
            }
            return res;
        }

        return findInShadow(document);
    });

    console.log('Submit button info:', JSON.stringify(info, null, 2));
    await browser.close();
}

main().catch(console.error);
