const { chromium } = require('playwright');
const fs = require('fs');

async function main() {
    const auth = JSON.parse(fs.readFileSync('./scripts/trailhead_auth.json', 'utf8'));
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    await context.addCookies(auth.cookies);

    const page = await context.newPage();
    const url = process.argv[2] || 'https://trailhead.salesforce.com/content/learn/projects/keep-data-secure-in-a-recruiting-app/fls-perm-sets-sharing';
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);

    const content = await page.evaluate(() => {
        const main = document.querySelector('main') || document.body;
        return main.innerText;
    });

    fs.writeFileSync('./scripts/fls_challenge_text.txt', content, 'utf8');
    console.log('Saved ./scripts/fls_challenge_text.txt, length:', content.length);
    await browser.close();
}

main().catch(console.error);
