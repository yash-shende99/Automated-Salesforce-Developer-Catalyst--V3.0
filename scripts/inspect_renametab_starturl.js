const { chromium } = require('playwright');
const { execSync } = require('child_process');
const fs = require('fs');

async function main() {
    const out = execSync('sf org open --url-only --path "/lightning/setup/RenameTab/home" --json -o friend_org').toString();
    const loginUrl = JSON.parse(out).result.url;

    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

    console.log('Navigating directly with startURL...');
    await page.goto(loginUrl, { waitUntil: 'load', timeout: 60000 });
    await page.waitForTimeout(10000);

    console.log('Current URL:', page.url());
    await page.screenshot({ path: 'scripts/scratch/renametab_page.png' });

    // Look for iframes
    const frames = page.frames();
    console.log('Frames count:', frames.length);
    for (let i = 0; i < frames.length; i++) {
        console.log(`Frame ${i}: ${frames[i].url()}`);
        const content = await frames[i].content().catch(() => '');
        if (content.includes('Account')) {
            console.log(`Frame ${i} HAS ACCOUNT!`);
            // Find edit link
            const editLinks = await frames[i].locator('a:has-text("Edit")').all();
            console.log(`Frame ${i} edit links:`, editLinks.length);
        }
    }

    await browser.close();
    console.log('Inspection complete!');
}

main().catch(console.error);
