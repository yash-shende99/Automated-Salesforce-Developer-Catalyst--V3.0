const { chromium } = require('playwright');
const { execSync } = require('child_process');

async function renameRating() {
    console.log('[Renamer] Getting frontdoor login URL...');
    const out = JSON.parse(execSync('sf org open -r --json -o friend_org').toString());
    const loginUrl = out.result.url;
    const origin = new URL(loginUrl).origin;

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    console.log('[Renamer] Logging in...');
    await page.goto(loginUrl, { waitUntil: 'domcontentloaded', timeout: 35000 });
    await page.waitForTimeout(4000);

    // Navigate to Rename Tab / Fields page for Account
    console.log('[Renamer] Navigating to Rename Tabs and Labels...');
    const renameUrl = `${origin}/ui/setup/rename/RenameTabListPage`;
    await page.goto(renameUrl, { waitUntil: 'domcontentloaded', timeout: 35000 });
    await page.waitForTimeout(3000);

    // Click 'Edit' or 'Reset' next to Accounts
    // Let's find the Account row and click Edit
    console.log('[Renamer] Finding Account row...');
    const editLink = page.locator('tr:has-text("Accounts") a:has-text("Edit"), tr:has-text("Account") a:has-text("Edit")').first();
    await editLink.waitFor({ state: 'visible', timeout: 15000 });
    await editLink.click();
    await page.waitForTimeout(3000);

    // On Step 1 (Tab Name), click 'Next'
    console.log('[Renamer] Clicking Next on Tab names step...');
    const nextBtn = page.locator('input[value="Next"], input[name="goNext"]').first();
    await nextBtn.waitFor({ state: 'visible', timeout: 15000 });
    await nextBtn.click();
    await page.waitForTimeout(3000);

    // On Step 2 (Standard Fields), find Rating and set to "Prospect Rating"
    console.log('[Renamer] Finding Rating input field...');
    // Find row with "Rating"
    const ratingRow = page.locator('tr:has-text("Rating")');
    const input = ratingRow.locator('input[type="text"]').first();
    await input.waitFor({ state: 'visible', timeout: 15000 });
    console.log('[Renamer] Filling Prospect Rating...');
    await input.fill('Prospect Rating');

    // Click Save
    console.log('[Renamer] Saving...');
    const saveBtn = page.locator('input[value="Save"], input[name="save"]').first();
    await saveBtn.click();
    await page.waitForTimeout(4000);

    console.log('[Renamer] Successfully renamed Rating to Prospect Rating!');
    await browser.close();
}

renameRating().catch(console.error);
