const { chromium } = require('playwright');
const fs = require('fs');

async function main() {
    const auth = JSON.parse(fs.readFileSync('./scripts/trailhead_auth.json', 'utf8'));
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    await context.addCookies(auth.cookies);

    const page = await context.newPage();
    await page.goto('https://trailhead.salesforce.com/content/learn/projects/keep-data-secure-in-a-recruiting-app/fls-perm-sets-sharing', { waitUntil: 'networkidle' });

    // Scroll to bottom
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(2000);

    await page.screenshot({ path: 'scratch_challenge_ui.png', fullPage: false });
    console.log('Screenshot taken: scratch_challenge_ui.png');

    const html = await page.evaluate(() => {
        const bottomSection = document.querySelector('[data-testid="challenge-container"]') || document.querySelector('.challenge-container') || document.querySelector('c-trailhead-challenge') || document.querySelector('.th-card');
        return bottomSection ? bottomSection.outerHTML : document.body.innerHTML.slice(-3000);
    });
    fs.writeFileSync('scratch_challenge_ui.html', html, 'utf8');

    await browser.close();
}

main().catch(console.error);
