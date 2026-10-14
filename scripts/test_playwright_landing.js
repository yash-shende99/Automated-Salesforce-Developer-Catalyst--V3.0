const { chromium } = require('playwright');
const { execSync } = require('child_process');

async function test() {
    const out = JSON.parse(execSync('sf org open -p "/lightning/setup/RenameTab/home" -r --json -o friend_org').toString());
    const loginUrl = out.result.url;
    console.log('Login URL generated.');

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    console.log('Navigating to frontdoor...');
    try {
        await page.goto(loginUrl, { timeout: 45000, waitUntil: 'commit' });
    } catch(e) {
        console.log('Goto commit caught:', e.message);
    }

    console.log('Waiting 15 seconds for multi-domain redirect to finish...');
    await page.waitForTimeout(15000);

    console.log('Landed on:', page.url());
    console.log('Page title:', await page.title());

    await page.screenshot({ path: 'scripts/scratch/renametab_landing.png' });
    console.log('Screenshot saved to scripts/scratch/renametab_landing.png');

    await browser.close();
}

test().catch(console.error);
