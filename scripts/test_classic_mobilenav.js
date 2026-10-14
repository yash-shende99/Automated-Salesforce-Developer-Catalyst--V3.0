const { chromium } = require('playwright');
const { execSync } = require('child_process');

async function main() {
    const out = execSync('sf org open --url-only --path "/_ui/core/chatter/appmenu/MobileNavMenuSetupPage" --json').toString();
    const loginUrl = JSON.parse(out).result.url;

    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

    console.log('Navigating to Classic Mobile Navigation Setup...');
    await page.goto(loginUrl, { waitUntil: 'load', timeout: 60000 });
    await page.waitForTimeout(4000);

    console.log('Current URL:', page.url());
    await page.screenshot({ path: 'scripts/classic_mobilenav.png' });

    // Look for duel_select
    const selects = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('select')).map(s => ({
            id: s.id,
            name: s.name,
            options: Array.from(s.options).map(o => ({ value: o.value, text: o.text }))
        }));
    });
    console.log('Selects:', JSON.stringify(selects, null, 2));

    const avail = page.locator('select[id*="duel_select_0"]');
    if (await avail.isVisible()) {
        console.log('Found Available! Selecting Field Sales App...');
        await avail.selectOption({ label: 'Field Sales App' });
        await page.waitForTimeout(500);

        console.log('Clicking Add arrow...');
        await page.locator('a[id*="duel_select_0_right"], img.rightArrowIcon').first().click();
        await page.waitForTimeout(1000);

        // In Selected (duel_select_1), move below Today
        // Today is value "Standard.MyDay" or similar
        // Let's see the selected options order
        console.log('Saving...');
        await page.locator('input[type="submit"][name="save"], input[value="Save"]').first().click();
        await page.waitForTimeout(4000);
        console.log('Saved! Final URL:', page.url());
    } else {
        console.log('duel_select_0 not visible');
    }

    await browser.close();
}

main().catch(console.error);
