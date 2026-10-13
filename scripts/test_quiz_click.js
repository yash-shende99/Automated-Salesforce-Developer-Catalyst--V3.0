const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const AUTH_FILE = path.join(__dirname, 'trailhead_auth.json');

async function main() {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ storageState: AUTH_FILE });
    const page = await context.newPage();

    await page.goto('https://trailhead.salesforce.com/content/learn/modules/spe_admins/spe_admins_get_started', { waitUntil: 'networkidle' });
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(3000);

    const ans1 = 'Primary secrets, tenant secrets, data encryption keys, and initialization vectors';
    const ans2 = 'Initialization vector, tenant secret, and primary secret';

    console.log('Finding option 1...');
    const opt1 = page.locator('th-enhanced-quiz label').filter({ hasText: ans1 });
    console.log('Opt1 count:', await opt1.count());
    if (await opt1.count() > 0) {
        await opt1.first().click();
        console.log('Clicked Opt1!');
    }

    console.log('Finding option 2...');
    const opt2 = page.locator('th-enhanced-quiz label').filter({ hasText: ans2 });
    console.log('Opt2 count:', await opt2.count());
    if (await opt2.count() > 0) {
        await opt2.first().click();
        console.log('Clicked Opt2!');
    }

    await page.waitForTimeout(1000);

    // Now check if submit button is enabled!
    const btn = page.locator('th-enhanced-quiz button.button--success');
    console.log('Btn count:', await btn.count());
    if (await btn.count() > 0) {
        const cls = await btn.first().getAttribute('class');
        console.log('Btn class after click:', cls);
        if (!cls.includes('button--disabled')) {
            console.log('BUTTON IS ENABLED! Clicking submit button...');
            await btn.first().click();
            await page.waitForTimeout(8000);

            const text = await page.evaluate(() => document.body.innerText);
            console.log('Passed:', text.includes('100 Points') || text.includes('Success') || text.includes('earned'));
        }
    }

    await browser.close();
}

main().catch(console.error);
