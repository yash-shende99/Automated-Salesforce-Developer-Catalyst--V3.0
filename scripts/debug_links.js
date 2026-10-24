const { chromium } = require('playwright');
const path = require('path');

async function debugPage() {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        storageState: path.join(__dirname, 'trailhead_auth.json')
    });
    const page = await context.newPage();

    await page.goto('https://trailhead.salesforce.com/content/learn/projects/customize-a-salesforce-object?trailmix_creator_id=trjha3&trailmix_slug=salesforce-developer-catalyst-v-3-0', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(5000);

    const allLinks = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('a')).map(a => ({
            text: a.innerText.trim(),
            href: a.href
        })).filter(l => l.text.length > 3 && l.href.includes('salesforce.com'));
    });

    console.log(`Found ${allLinks.length} links on page:`);
    for (let i = 25; i < allLinks.length; i++) {
        console.log(`${i}: [${allLinks[i].text.replace(/\n/g, ' ')}] -> ${allLinks[i].href}`);
    }

    await browser.close();
}

debugPage();
