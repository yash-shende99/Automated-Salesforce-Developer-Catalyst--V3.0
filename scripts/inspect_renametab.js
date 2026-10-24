const { chromium } = require('playwright');
const { execSync } = require('child_process');

async function test() {
    const out = JSON.parse(execSync('sf org open -r --json -o friend_org').toString());
    const loginUrl = out.result.url;
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    console.log('Logging in with waitUntil commit...');
    await page.goto(loginUrl, { waitUntil: 'commit' });
    console.log('Committed loginUrl, waiting 8 seconds for redirects to settle...');
    await page.waitForTimeout(8000);
    console.log('Landed on URL:', page.url());

    const setupUrl = 'https://curious-moose-vbdewg-dev-ed.trailblaze.my.salesforce-setup.com/lightning/setup/RenameTab/home';
    console.log('Navigating to:', setupUrl);
    await page.goto(setupUrl, { waitUntil: 'commit' });
    await page.waitForTimeout(10000);
    console.log('Setup page URL:', page.url());

    const iframes = await page.locator('iframe').all();
    console.log('Found iframe tags count:', iframes.length);
    for (let i = 0; i < iframes.length; i++) {
        const src = await iframes[i].getAttribute('src');
        const title = await iframes[i].getAttribute('title');
        console.log(`iframe ${i}: src=${src}, title=${title}`);
    }

    await browser.close();
    console.log('Done test!');
}
test().catch(console.error);
