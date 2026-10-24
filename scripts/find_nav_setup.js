const { chromium } = require('playwright');
const { execSync } = require('child_process');

async function main() {
    const out = execSync('sf org open --url-only --path "/lightning/setup/SetupOneHome/home" --json').toString();
    const loginUrl = JSON.parse(out).result.url;

    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

    console.log('Navigating to Setup Home...');
    await page.goto(loginUrl, { waitUntil: 'load', timeout: 60000 });
    await page.waitForTimeout(6000);

    console.log('Typing Salesforce Navigation into Quick Find...');
    const quickFind = page.locator('input[placeholder="Quick Find"]').first();
    await quickFind.fill('Salesforce Navigation');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'scripts/quickfind_nav.png' });

    // Look for link
    const link = page.locator('mark:has-text("Salesforce Navigation"), a:has-text("Salesforce Navigation")').first();
    if (await link.isVisible()) {
        console.log('Clicking Salesforce Navigation link...');
        await link.click();
        await page.waitForTimeout(6000);
        await page.screenshot({ path: 'scripts/nav_clicked.png' });
        console.log('Current URL after click:', page.url());
    } else {
        console.log('Link not found, typing Navigation...');
        await quickFind.fill('Navigation');
        await page.waitForTimeout(2000);
        await page.screenshot({ path: 'scripts/quickfind_nav2.png' });
    }

    await browser.close();
}

main().catch(console.error);
