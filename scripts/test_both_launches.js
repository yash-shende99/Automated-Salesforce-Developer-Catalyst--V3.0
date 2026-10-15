const { chromium } = require('playwright');
const fs = require('fs');

async function testLaunch(orgId) {
    const auth = JSON.parse(fs.readFileSync('scripts/trailhead_auth.json', 'utf8'));
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    await context.addCookies(auth.cookies);
    const page = await context.newPage();

    console.log(`[Launch Test] Navigating to /launch_org/${orgId}...`);
    try {
        const resp = await page.goto(`https://trailhead.salesforce.com/launch_org/${orgId}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.waitForTimeout(6000);
        console.log(`[Launch Test ${orgId}] Final URL: ${page.url()}`);
        console.log(`[Launch Test ${orgId}] Title: ${await page.title()}`);
    } catch(e) {
        console.error(`[Launch Test ${orgId}] Error:`, e.message);
    } finally {
        await browser.close();
    }
}

async function main() {
    await testLaunch('23980024');
    await testLaunch('23983359');
}

main().catch(console.error);
