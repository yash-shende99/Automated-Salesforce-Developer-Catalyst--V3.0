const { chromium } = require('playwright');
const path = require('path');

async function extractUnits(projectUrl) {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        storageState: path.join(__dirname, 'trailhead_auth.json')
    });
    const page = await context.newPage();

    await page.goto(projectUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(5000);

    const units = await page.evaluate(() => {
        const anchors = Array.from(document.querySelectorAll('a[href*="/projects/"], a[href*="/modules/"]'));
        const seen = new Set();
        const results = [];

        for (const a of anchors) {
            const href = a.href;
            if (!href.includes('?') && !seen.has(href)) {
                // If it looks like a unit link
                const text = a.innerText.trim();
                if (text && text.length > 3 && !text.includes('Trailmix') && !text.includes('Sign Up')) {
                    seen.add(href);
                    results.push({ title: text, url: href });
                }
            }
        }
        return results;
    });

    console.log(JSON.stringify(units, null, 2));
    await browser.close();
}

const targetUrl = process.argv[2] || 'https://trailhead.salesforce.com/content/learn/projects/customize-a-salesforce-object?trailmix_creator_id=trjha3&trailmix_slug=salesforce-developer-catalyst-v-3-0';
extractUnits(targetUrl);
