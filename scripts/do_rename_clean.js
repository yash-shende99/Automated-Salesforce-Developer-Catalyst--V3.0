const fs = require('fs');
const { chromium } = require('playwright');

async function main() {
    const auth = JSON.parse(fs.readFileSync('./scripts/trailhead_auth.json', 'utf8'));
    const cookies = auth.cookies || [];
    const cookieHeader = cookies.map(c => `${c.name}=${c.value}`).join('; ');

    const orgId = 23983359;
    const res = await fetch(`https://trailhead.salesforce.com/launch_org/${orgId}`, {
        headers: {
            'Cookie': cookieHeader,
            'User-Agent': 'Mozilla/5.0'
        },
        redirect: 'manual'
    });

    const location = res.headers.get('location');
    console.log('Frontdoor redirect URL obtained!');

    // Append retURL to go directly to tabcustomname
    const targetUrl = location + '&retURL=' + encodeURIComponent('/setup/ui/tabcustomname.apexp');

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        viewport: { width: 1440, height: 900 }
    });
    const page = await context.newPage();

    console.log('Navigating to frontdoor with retURL...');
    await page.goto(targetUrl, { waitUntil: 'load', timeout: 60000 });
    await page.waitForTimeout(5000);

    console.log('Current URL:', page.url());
    console.log('Page Title:', await page.title());

    // Check if we are on Rename Tabs and Labels
    const content = await page.content();
    fs.writeFileSync('scripts/scratch/tabcustomname.html', content);

    // Look for Accounts Edit link
    // In Classic: <a href="/setup/ui/tabcustomnameedit.apexp?id=01I... or similar">Edit</a> in Account row
    const editLinks = await page.locator('tr:has-text("Accounts") a:has-text("Edit"), tr:has-text("Account") a:has-text("Edit")').all();
    console.log('Found Account edit links:', editLinks.length);

    if (editLinks.length > 0) {
        console.log('Clicking Edit on Accounts...');
        await editLinks[0].click();
        await page.waitForTimeout(4000);
        console.log('Landed on edit page:', page.url());

        // Step 1: Click Next
        const nextBtn = page.locator('input[value="Next"], input[title="Next"], input[name="goNext"]').first();
        if (await nextBtn.isVisible()) {
            console.log('Clicking Next...');
            await nextBtn.click();
            await page.waitForTimeout(4000);
            console.log('Landed on Step 2 page:', page.url());
        }

        // Step 2: Rating row
        const ratingRow = page.locator('tr:has-text("Rating")').first();
        if (await ratingRow.isVisible()) {
            console.log('Found Rating row!');
            const ratingInput = ratingRow.locator('input[type="text"]').first();
            console.log('Current input val:', await ratingInput.inputValue());
            await ratingInput.fill('Prospect Rating');
            console.log('Filled Prospect Rating!');

            const saveBtn = page.locator('input[value="Save"], input[title="Save"], input[name="save"]').first();
            await saveBtn.click();
            await page.waitForTimeout(5000);
            console.log('SUCCESSFULLY SAVED RATING AS PROSPECT RATING!');
        } else {
            console.log('Rating row not visible on step 2!');
            await page.screenshot({ path: 'scripts/scratch/step2.png' });
        }
    } else {
        console.log('No edit link found. Screenshotting...');
        await page.screenshot({ path: 'scripts/scratch/no_edit.png' });
    }

    await browser.close();
    console.log('Finished!');
}

main().catch(console.error);
