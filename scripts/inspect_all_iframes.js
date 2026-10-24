const { chromium } = require('playwright');
const { execSync } = require('child_process');

async function test() {
    const out = JSON.parse(execSync('sf org open --url-only --path "/lightning/setup/RenameTabAndLabels/home" --json -o friend_org').toString());
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto(out.result.url, { waitUntil: 'commit' }).catch(() => {});
    await page.waitForTimeout(6000);
    console.log('URL at 6s:', page.url());
    await page.waitForTimeout(6000);
    console.log('URL at 12s:', page.url());
    const bodyText = await page.locator('body').innerText();
    console.log('Body text preview:', bodyText.slice(0, 300));
    await page.screenshot({ path: 'scripts/scratch/renametab_current.png' });
    await browser.close();
}
test().catch(console.error);
