const { chromium } = require('playwright');
const fs = require('fs');

async function main() {
    const auth = JSON.parse(fs.readFileSync('./scripts/trailhead_auth.json', 'utf8'));
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    await context.addCookies(auth.cookies);

    const page = await context.newPage();
    console.log('Navigating to unit...');
    await page.goto('https://trailhead.salesforce.com/content/learn/projects/keep-data-secure-in-a-recruiting-app/fls-perm-sets-sharing', { waitUntil: 'networkidle' });

    page.on('response', async res => {
        if (res.url().includes('check_challenge')) {
            console.log('API check_challenge status:', res.status());
            try {
                const body = await res.json();
                console.log('API Response body:', JSON.stringify(body, null, 2));
            } catch (e) {}
        }
    });

    console.log('Finding verify button...');
    const btn = page.locator('button:has-text("Verify step")').first();
    await btn.scrollIntoViewIfNeeded();
    console.log('Clicking verify button...');
    await btn.click();

    console.log('Waiting 15s for results...');
    await page.waitForTimeout(15000);

    await page.screenshot({ path: 'scratch_after_click.png' });
    console.log('Screenshot saved to scratch_after_click.png');
    await browser.close();
}

main().catch(console.error);
