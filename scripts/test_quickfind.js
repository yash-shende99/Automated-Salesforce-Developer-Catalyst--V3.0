const { chromium } = require('playwright');
const { execSync } = require('child_process');

async function main() {
    const out = JSON.parse(execSync('sf org open -r --json -o friend_org').toString());
    const loginUrl = out.result.url;

    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

    console.log('Logging in via frontdoor (commit)...');
    await page.goto(loginUrl, { waitUntil: 'commit' }).catch(() => {});
    await page.waitForTimeout(8000);
    console.log('Landed on URL:', page.url());

    console.log('Filling Quick Find with "Rename Tabs and Labels"...');
    const qf = page.locator('input[placeholder="Quick Find"]').first();
    await qf.waitFor({ timeout: 15000 });
    await qf.fill('Rename Tabs and Labels');
    await page.waitForTimeout(2000);

    // Find link
    const item = page.locator('a').filter({ hasText: 'Rename Tabs and Labels' }).first();
    await item.waitFor({ timeout: 10000 });
    console.log('Found link, clicking!');
    await item.click();
    await page.waitForTimeout(8000);

    console.log('Current URL after click:', page.url());
    await page.screenshot({ path: 'scripts/scratch/after_quickfind_click.png' });

    // Look at all frames
    const frames = page.frames();
    console.log('Total frames:', frames.length);
    for (let i = 0; i < frames.length; i++) {
        const u = frames[i].url();
        console.log(`Frame ${i}: ${u}`);
        const c = await frames[i].content().catch(() => '');
        if (c.includes('Account')) {
            console.log(`>>> FRAME ${i} HAS ACCOUNT! URL: ${u}`);
            // Check for edit link
            const editBtn = frames[i].locator('tr:has-text("Accounts") a:has-text("Edit"), tr:has-text("Account") a:has-text("Edit")').first();
            const editCount = await editBtn.count();
            console.log(`Edit link count in frame ${i}: ${editCount}`);
            if (editCount > 0) {
                console.log('Clicking Edit on Accounts...');
                await editBtn.click();
                await page.waitForTimeout(4000);

                console.log('Clicking Next...');
                const nextBtn = frames[i].locator('input[value="Next"], input[title="Next"], input[name="goNext"]').first();
                await nextBtn.click();
                await page.waitForTimeout(4000);

                console.log('Finding Rating row...');
                const ratingRow = frames[i].locator('tr:has-text("Rating")').first();
                const ratingInput = ratingRow.locator('input[type="text"]').first();
                console.log('Current Rating input val:', await ratingInput.inputValue());
                await ratingInput.fill('Prospect Rating');
                console.log('Set to Prospect Rating!');

                console.log('Clicking Save...');
                const saveBtn = frames[i].locator('input[value="Save"], input[title="Save"], input[name="save"]').first();
                await saveBtn.click();
                await page.waitForTimeout(5000);
                console.log('SAVED SUCCESSFULLY!');
                break;
            }
        }
    }

    await browser.close();
    console.log('Done!');
}

main().catch(console.error);
