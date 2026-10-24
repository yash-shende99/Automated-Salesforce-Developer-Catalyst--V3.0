const { chromium } = require('playwright');
const { execSync } = require('child_process');

async function main() {
    const out = JSON.parse(execSync('sf org open -r --json -o friend_org').toString());
    const loginUrl = out.result.url;

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    console.log('Logging in via frontdoor...');
    await page.goto(loginUrl, { waitUntil: 'domcontentloaded', timeout: 35000 });
    await page.waitForTimeout(5000);
    const setupOrigin = new URL(page.url()).origin;
    console.log('Current Setup Origin:', setupOrigin);

    console.log('Navigating to RenameTab setup...');
    await page.goto(`${setupOrigin}/lightning/setup/RenameTab/home`, { waitUntil: 'domcontentloaded', timeout: 35000 });
    await page.waitForTimeout(6000);

    console.log('Current URL:', page.url());
    
    // Check frames
    let targetFrame = null;
    for (let attempt = 0; attempt < 5; attempt++) {
        const frames = page.frames();
        console.log(`Attempt ${attempt}: ${frames.length} frames found.`);
        for (const f of frames) {
            const u = f.url();
            console.log('Frame URL:', u);
            if (u.includes('tabcustomname') || u.includes('setup')) {
                const text = await f.content().catch(() => '');
                if (text.includes('Accounts') || text.includes('Account')) {
                    targetFrame = f;
                    break;
                }
            }
        }
        if (targetFrame) break;
        await page.waitForTimeout(2000);
    }

    if (!targetFrame) {
        // Fallback: check main frame or all frames for "Accounts"
        for (const f of page.frames()) {
            const text = await f.content().catch(() => '');
            if (text.includes('Accounts') || text.includes('Account')) {
                targetFrame = f;
                break;
            }
        }
    }

    if (!targetFrame) {
        console.error('Could not find frame with Accounts!');
        await page.screenshot({ path: 'scripts/scratch/rename_fail.png' });
        await browser.close();
        return;
    }

    console.log('Found target frame with Accounts:', targetFrame.url());
    // Find the edit link in the Accounts row
    const editLink = targetFrame.locator('tr:has-text("Accounts") a:has-text("Edit"), tr:has-text("Account") a:has-text("Edit")').first();
    await editLink.waitFor({ timeout: 10000 });
    console.log('Clicking Edit on Accounts...');
    await editLink.click();
    await page.waitForTimeout(4000);

    // Now Step 1: Click Next
    console.log('Clicking Next...');
    const nextBtn = targetFrame.locator('input[value="Next"], input[title="Next"], input[name="goNext"]').first();
    await nextBtn.waitFor({ timeout: 10000 });
    await nextBtn.click();
    await page.waitForTimeout(4000);

    // Step 2: Find Rating field row and input
    console.log('Looking for Rating row...');
    const ratingRow = targetFrame.locator('tr:has-text("Rating")').first();
    await ratingRow.waitFor({ timeout: 10000 });
    const ratingInput = ratingRow.locator('input[type="text"]').first();
    const curVal = await ratingInput.inputValue();
    console.log('Current value in Rating singular:', curVal);

    await ratingInput.fill('Prospect Rating');
    console.log('Filled Prospect Rating!');

    // Click Save
    const saveBtn = targetFrame.locator('input[value="Save"], input[title="Save"], input[name="save"]').first();
    await saveBtn.click();
    await page.waitForTimeout(5000);
    console.log('Save completed successfully!');

    await browser.close();
    console.log('ALL DONE!');
}

main().catch(err => {
    console.error('Error in main:', err);
    process.exit(1);
});
