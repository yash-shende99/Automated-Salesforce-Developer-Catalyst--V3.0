const { chromium } = require('playwright');
const { execSync } = require('child_process');

async function test() {
    console.log('Generating fresh login URL with sf org open...');
    const out = JSON.parse(execSync('sf org open --url-only --path "/lightning/setup/RenameTab/home" --json -o friend_org').toString());
    const loginUrl = out.result.url;

    console.log('Launching real Chrome...');
    const browser = await chromium.launch({ channel: 'chrome', headless: true });
    const context = await browser.newContext({
        viewport: { width: 1440, height: 900 }
    });
    const page = await context.newPage();

    console.log('Navigating to login URL...');
    await page.goto(loginUrl, { waitUntil: 'commit', timeout: 45000 }).catch(() => {});

    console.log('Waiting 25 seconds for Lightning Experience to hydrate...');
    await page.waitForTimeout(25000);
    console.log('Current URL:', page.url());

    // Wait another 15s
    await page.waitForTimeout(15000);
    console.log('URL at 40s:', page.url());
    console.log('Page Title:', await page.title());

    await page.screenshot({ path: 'scripts/scratch/hydrated_setup.png' });
    console.log('Saved hydrated_setup.png');

    // List all iframes
    const frames = page.frames();
    console.log('Total frames in page:', frames.length);
    for (let i = 0; i < frames.length; i++) {
        console.log(`Frame ${i}: name=${frames[i].name()}, url=${frames[i].url()}`);
    }

    // Check if any frame has 'Rename' or 'Account'
    for (const f of frames) {
        const text = await f.innerText('body').catch(() => '');
        if (text.includes('Account')) {
            console.log(`MATCH IN FRAME ${f.url()}! Body text contains Account!`);
            const editLinks = await f.locator('tr:has-text("Accounts") a:has-text("Edit"), tr:has-text("Account") a:has-text("Edit")').all();
            console.log('Found edit links:', editLinks.length);
            if (editLinks.length > 0) {
                console.log('Clicking Edit...');
                await editLinks[0].click();
                await page.waitForTimeout(5000);
                await page.screenshot({ path: 'scripts/scratch/step1_click.png' });
                
                console.log('Clicking Next...');
                const nextBtn = f.locator('input[value="Next"], input[title="Next"], input[name="goNext"]').first();
                await nextBtn.waitFor({ timeout: 15000 });
                await nextBtn.click();
                await page.waitForTimeout(5000);
                await page.screenshot({ path: 'scripts/scratch/step2_click.png' });

                console.log('Finding Rating input...');
                const ratingRow = f.locator('tr:has-text("Rating")').first();
                await ratingRow.waitFor({ timeout: 15000 });
                const input = ratingRow.locator('input[type="text"]').first();
                console.log('Current value in input:', await input.inputValue());
                await input.fill('Prospect Rating');
                console.log('Filled Prospect Rating!');

                const saveBtn = f.locator('input[value="Save"], input[title="Save"], input[name="save"]').first();
                await saveBtn.click();
                await page.waitForTimeout(6000);
                console.log('SAVED SUCCESSFULLY!');
                await page.screenshot({ path: 'scripts/scratch/saved.png' });
                break;
            }
        }
    }

    await browser.close();
}

test().catch(console.error);
