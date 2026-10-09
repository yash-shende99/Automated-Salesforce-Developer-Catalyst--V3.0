const { chromium } = require('playwright');
const fs = require('fs');

async function main() {
    const auth = JSON.parse(fs.readFileSync('scripts/trailhead_auth.json', 'utf8'));
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ viewport: { width: 1280, height: 1200 } });
    await context.addCookies(auth.cookies);
    const page = await context.newPage();

    const url = 'https://trailhead.salesforce.com/content/learn/modules/screen-flows/get-started-with-screen-flows';
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 35000 }).catch(() => {});
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    
    console.log('Waiting for quiz component to hydrate...');
    const label = page.locator('th-enhanced-quiz label, label:has-text("Input")').first();
    await label.waitFor({ state: 'attached', timeout: 25000 });
    console.log('Quiz loaded! Taking screenshot...');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'scripts/screen_flows_quiz_hydrated.png' });
    console.log('Saved to scripts/screen_flows_quiz_hydrated.png');
    await browser.close();
}

main().catch(console.error);
