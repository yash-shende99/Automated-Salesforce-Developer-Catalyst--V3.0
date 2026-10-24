const { chromium } = require('playwright');
const { execSync } = require('child_process');
const fs = require('fs');

async function main() {
    console.log('Getting authenticated org URL...');
    const out = execSync('sf org open --url-only --path "/visualEditor/appBuilder.app" --json').toString();
    const loginUrl = JSON.parse(out).result.url;

    console.log('Launching browser...');
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        viewport: { width: 1440, height: 900 }
    });
    const page = await context.newPage();

    console.log('Navigating to App Builder...');
    await page.goto(loginUrl, { waitUntil: 'load', timeout: 60000 });
    await page.waitForTimeout(6000);

    console.log('Current URL:', page.url());
    await page.screenshot({ path: 'scripts/appbuilder_1.png' });

    // In the App Builder wizard modal:
    // 1. Select App Page
    console.log('Selecting App Page...');
    // Look for App Page option
    const appPageRadio = page.locator('text="App Page"').first();
    await appPageRadio.waitFor({ timeout: 15000 });
    await appPageRadio.click();
    await page.waitForTimeout(500);

    // Click Next
    console.log('Clicking Next...');
    await page.locator('button:has-text("Next")').click();
    await page.waitForTimeout(2000);

    // 2. Enter Label: Field Sales App
    console.log('Entering Label: Field Sales App...');
    const labelInput = page.locator('input[type="text"]').first();
    await labelInput.fill('Field Sales App');
    await page.waitForTimeout(500);

    // Click Next
    console.log('Clicking Next...');
    await page.locator('button:has-text("Next")').click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'scripts/appbuilder_2_templates.png' });

    // 3. Inspect templates
    const templates = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('*')).map(el => el.innerText).filter(t => t && t.includes('Regions') || t && t.includes('Two'));
    });
    console.log('Templates found:', templates);

    // Select "Two Regions"
    console.log('Selecting Two Regions...');
    const twoRegions = page.locator('text="Two Regions"').first();
    await twoRegions.click();
    await page.waitForTimeout(500);

    // Click Done
    console.log('Clicking Done / Finish...');
    await page.locator('button:has-text("Done"), button:has-text("Finish")').first().click();
    await page.waitForTimeout(5000);
    await page.screenshot({ path: 'scripts/appbuilder_3_canvas.png' });

    // Click Save
    console.log('Saving empty page first to establish metadata...');
    const saveBtn = page.locator('button:has-text("Save")').first();
    if (await saveBtn.isVisible()) {
        await saveBtn.click();
        await page.waitForTimeout(3000);
        // If popup "Not Yet"
        const notYet = page.locator('button:has-text("Not Yet")').first();
        if (await notYet.isVisible()) {
            await notYet.click();
            await page.waitForTimeout(1000);
        }
    }

    console.log('Page created and saved in App Builder!');
    await browser.close();
}

main().catch(err => {
    console.error('Error:', err);
    process.exit(1);
});
