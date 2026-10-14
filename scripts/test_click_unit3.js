const { chromium } = require('playwright');
const path = require('path');

async function testClick() {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ storageState: path.join(__dirname, 'trailhead_auth.json') });
    const page = await context.newPage();

    await page.goto('https://trailhead.salesforce.com/content/learn/projects/customize-a-salesforce-object/create-lookup-filters?trailmix_creator_id=trjha3&trailmix_slug=salesforce-developer-catalyst-v-3-0', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(4000);

    const btn = page.locator('button:has-text("Verify step to earn"), button:has-text("Check Challenge"), button:has-text("Verify Step")').first();
    const btnText = await btn.innerText();
    console.log('[Clicker] Button found:', btnText);
    await btn.click();
    console.log('[Clicker] Clicked! Waiting for Trailhead backend evaluation...');

    for (let i = 0; i < 30; i++) {
        await page.waitForTimeout(2000);
        const text = await page.evaluate(() => document.body.innerText);

        if (text.includes('Assessment Complete!') || text.includes('Next step:')) {
            console.log('[Clicker] SUCCESS! Assessment Complete confirmed.');
            const bottom = text.split('\n').filter(Boolean).slice(-20).join('\n');
            console.log(bottom);
            await browser.close();
            return { success: true };
        }

        const errMatch = text.match(/Step not yet complete[^\n]+\n[^\n]+/i) || text.match(/We can['’]t find[^\n]+/i) || text.match(/We couldn['’]t find[^\n]+/i);
        if (errMatch) {
            console.log('[Clicker] ERROR DETECTED:', errMatch[0]);
            await browser.close();
            return { success: false, error: errMatch[0] };
        }
    }

    console.log('[Clicker] Timed out waiting for evaluation');
    await browser.close();
    return { success: false, error: 'Timed out' };
}

testClick();
