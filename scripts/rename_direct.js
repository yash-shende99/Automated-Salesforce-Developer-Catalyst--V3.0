const { chromium } = require('playwright');
const { execSync } = require('child_process');

async function main() {
    console.log('Getting frontdoor URL directly into RenameTabListPage...');
    const out = JSON.parse(execSync('sf org open -p /ui/setup/rename/RenameTabListPage -r --json -o friend_org').toString());
    const loginUrl = out.result.url;

    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    console.log('Navigating directly via frontdoor...');
    await page.goto(loginUrl, { waitUntil: 'load', timeout: 45000 });
    await page.waitForTimeout(4000);

    console.log('Current URL:', page.url());
    console.log('Finding Account row Edit link...');
    const editLink = page.locator('tr:has-text("Accounts") a:has-text("Edit"), tr:has-text("Account") a:has-text("Edit")').first();
    await editLink.waitFor({ state: 'visible', timeout: 15000 });
    await editLink.click();
    await page.waitForTimeout(3000);

    console.log('Clicking Next on Tab Name step...');
    const nextBtn = page.locator('input[value="Next"], input[name="goNext"]').first();
    await nextBtn.waitFor({ state: 'visible', timeout: 15000 });
    await nextBtn.click();
    await page.waitForTimeout(3000);

    console.log('Finding Rating input and filling Prospect Rating...');
    const ratingRow = page.locator('tr:has-text("Rating")');
    const input = ratingRow.locator('input[type="text"]').first();
    await input.waitFor({ state: 'visible', timeout: 15000 });
    await input.fill('Prospect Rating');

    console.log('Saving...');
    const saveBtn = page.locator('input[value="Save"], input[name="save"]').first();
    await saveBtn.click();
    await page.waitForTimeout(4000);

    console.log('Successfully saved Prospect Rating rename!');
    await browser.close();
}

main().catch(console.error);
