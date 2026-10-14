const { chromium } = require('playwright');
const { execSync } = require('child_process');

async function test() {
    const out = execSync('sf org open --url-only --path "/lightning/setup/FlexiPageList/home" --json').toString();
    const loginUrl = JSON.parse(out).result.url;
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    console.log('Navigating...');
    await page.goto(loginUrl, { waitUntil: 'load', timeout: 60000 });
    await page.waitForTimeout(8000);
    console.log('Navigated to:', page.url());
    await page.screenshot({ path: 'scripts/flexipagelist.png' });
    const text = await page.evaluate(() => document.body.innerText);
    console.log('Text preview:', text.slice(0, 300));
    await browser.close();
}
test().catch(console.error);
