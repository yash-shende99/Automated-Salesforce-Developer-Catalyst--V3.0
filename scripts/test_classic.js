const { chromium } = require('playwright');
const { execSync } = require('child_process');

async function test() {
    const out = JSON.parse(execSync('sf org open --url-only --path "/lightning/setup/RenameTabAndLabels/home" --json -o friend_org').toString());
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    
    console.log('Navigating with commit...');
    await page.goto(out.result.url, { waitUntil: 'commit' }).catch(() => {});
    
    console.log('Waiting 15 seconds for multi-domain redirect to finish...');
    await page.waitForTimeout(15000);
    console.log('Landed on:', page.url());

    console.log('Waiting for iframe to appear...');
    await page.waitForSelector('iframe', { timeout: 35000 });
    console.log('Iframe appeared! Waiting 5s for iframe DOM...');
    await page.waitForTimeout(5000);

    const frame = page.frameLocator('iframe').first();
    console.log('Looking for Accounts in iframe...');
    const editBtn = frame.locator('tr:has-text("Accounts") a:has-text("Edit"), tr:has-text("Account") a:has-text("Edit")').first();
    await editBtn.waitFor({ timeout: 25000 });
    console.log('Found edit button! Clicking...');
    await editBtn.click();
    await page.waitForTimeout(5000);

    console.log('Clicking Next in frame...');
    const nextBtn = frame.locator('input[value="Next"], input[title="Next"], input[name="goNext"]').first();
    await nextBtn.waitFor({ timeout: 15000 });
    await nextBtn.click();
    await page.waitForTimeout(5000);

    console.log('Looking for Rating row...');
    const ratingRow = frame.locator('tr:has-text("Rating")').first();
    await ratingRow.waitFor({ timeout: 15000 });
    const ratingInput = ratingRow.locator('input[type="text"]').first();
    console.log('Current value in input:', await ratingInput.inputValue());
    await ratingInput.fill('Prospect Rating');
    console.log('Filled Prospect Rating!');

    const saveBtn = frame.locator('input[value="Save"], input[title="Save"], input[name="save"]').first();
    await saveBtn.click();
    await page.waitForTimeout(6000);
    console.log('SAVED SUCCESSFULLY!');
    await browser.close();
}
test().catch(console.error);
