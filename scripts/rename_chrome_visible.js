const { chromium } = require('playwright');
const { execSync } = require('child_process');

async function test() {
    console.log('Generating fresh login URL with sf org open...');
    const out = JSON.parse(execSync('sf org open --url-only --path "/lightning/setup/RenameTab/home" --json -o friend_org').toString());
    const loginUrl = out.result.url;

    console.log('Launching REAL Chrome (headless: false)...');
    const browser = await chromium.launch({
        channel: 'chrome',
        headless: false,
        args: [
            '--disable-blink-features=AutomationControlled',
            '--start-maximized'
        ]
    });
    const context = await browser.newContext({
        viewport: null
    });
    const page = await context.newPage();

    console.log('Navigating to login URL...');
    await page.goto(loginUrl, { waitUntil: 'commit', timeout: 45000 }).catch(() => {});

    console.log('Waiting up to 25 seconds for iframe to appear...');
    let found = false;
    for (let i = 0; i < 25; i++) {
        const iframes = page.frames();
        for (const f of iframes) {
            const text = await f.innerText('body').catch(() => '');
            if (text.includes('Account')) {
                console.log(`FOUND ACCOUNTS IN FRAME! (at ${i}s)`);
                found = true;
                
                const editBtn = f.locator('tr:has-text("Accounts") a:has-text("Edit"), tr:has-text("Account") a:has-text("Edit")').first();
                console.log('Clicking Edit on Accounts...');
                await editBtn.click();
                await page.waitForTimeout(4000);

                console.log('Clicking Next...');
                const nextBtn = f.locator('input[value="Next"], input[title="Next"], input[name="goNext"]').first();
                await nextBtn.waitFor({ timeout: 15000 });
                await nextBtn.click();
                await page.waitForTimeout(4000);

                console.log('Finding Rating input...');
                const ratingRow = f.locator('tr:has-text("Rating")').first();
                await ratingRow.waitFor({ timeout: 15000 });
                const input = ratingRow.locator('input[type="text"]').first();
                console.log('Current value in input:', await input.inputValue());
                await input.fill('Prospect Rating');
                console.log('Filled Prospect Rating!');

                const saveBtn = f.locator('input[value="Save"], input[title="Save"], input[name="save"]').first();
                await saveBtn.click();
                await page.waitForTimeout(5000);
                console.log('SAVED SUCCESSFULLY!');
                break;
            }
        }
        if (found) break;
        await page.waitForTimeout(1000);
    }

    if (!found) {
        console.log('Could not find Accounts in iframe within 25s.');
        console.log('Current URL:', page.url());
        console.log('Page Title:', await page.title());
        await page.screenshot({ path: 'scripts/scratch/headless_false_result.png' });
    }

    await browser.close();
}

test().catch(console.error);
