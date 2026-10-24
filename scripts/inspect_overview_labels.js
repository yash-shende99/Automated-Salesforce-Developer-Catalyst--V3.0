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

    const url = 'https://trailhead.salesforce.com/content/learn/modules/api_basics/api_basics_overview';
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(4000);

    const labels = await page.evaluate(() => {
        function getShadow(root) {
            let res = Array.from(root.querySelectorAll('label'));
            const walkers = Array.from(root.querySelectorAll('*'));
            for (const el of walkers) {
                if (el.shadowRoot) res = res.concat(getShadow(el.shadowRoot));
            }
            return res;
        }
        return getShadow(document).map(l => l.innerText);
    });

    console.log('Labels found on overview:', labels);
    await page.screenshot({ path: 'scratch_overview_quiz.png' });
    await browser.close();
}

main().catch(console.error);
