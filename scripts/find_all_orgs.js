const { chromium } = require('playwright');
const fs = require('fs');

async function main() {
    const auth = JSON.parse(fs.readFileSync('scripts/trailhead_auth.json', 'utf8'));
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    await context.addCookies(auth.cookies);
    const page = await context.newPage();

    await page.goto('https://trailhead.salesforce.com/content/learn/modules/screen-flows/build-a-screen-flow', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(5000);

    // Click org picker if present or inspect hands-on org dropdown
    const orgInfo = await page.evaluate(() => {
        // Look for buttons or links mentioning org or playground
        const allElements = Array.from(document.querySelectorAll('*'));
        const orgButtons = allElements.filter(el => 
            el.innerText && (el.innerText.includes('Playground') || el.innerText.includes('curious-moose') || el.innerText.includes('Cunning Impala'))
        ).map(el => ({ tag: el.tagName, text: el.innerText.trim(), className: el.className, id: el.id }));
        
        return {
            orgButtons: orgButtons.slice(0, 15)
        };
    });

    console.log(JSON.stringify(orgInfo, null, 2));

    // Look for the 3-dots or org dropdown button
    const orgSelectorBtn = page.locator('button:has-text("Playground"), [data-testid="hands-on-org-button"], .th-org-picker').first();
    if (await orgSelectorBtn.count() > 0) {
        console.log('Clicking org selector button...');
        await orgSelectorBtn.click();
        await page.waitForTimeout(2000);
        const dropdownOptions = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('[role="menuitem"], [role="option"], li, button')).map(el => el.innerText.trim()).filter(t => t.includes('Playground') || t.includes('Dev') || t.includes('curious') || t.includes('Impala') || t.includes('Moose'));
        });
        console.log('Dropdown Options:', [...new Set(dropdownOptions)]);
    }

    await browser.close();
}

main().catch(console.error);
