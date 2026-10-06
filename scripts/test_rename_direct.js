const { chromium } = require('playwright');
const { execSync } = require('child_process');
const fs = require('fs');

async function main() {
    const out = JSON.parse(execSync('sf org open -r --json -o friend_org').toString());
    const loginUrl = out.result.url;
    const origin = new URL(loginUrl).origin;

    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    console.log('Logging into org...');
    await page.goto(loginUrl, { waitUntil: 'networkidle', timeout: 35000 });
    
    console.log('Navigating to RenameTabListPage...');
    await page.goto(`${origin}/ui/setup/rename/RenameTabListPage`, { waitUntil: 'domcontentloaded', timeout: 35000 });
    await page.waitForTimeout(3000);

    const title = await page.title();
    console.log('Page title:', title);

    // Save page content to check table structure
    const html = await page.content();
    fs.writeFileSync('scripts/scratch/rename_tabs.html', html);
    console.log('Saved rename_tabs.html (length:', html.length, ')');

    // Find links with 'Account'
    const accountLinks = await page.locator('a').filter({ hasText: /Account/i }).allInnerTexts();
    console.log('Account links:', accountLinks);

    // Look for Edit links
    const editHrefs = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('a'))
            .filter(a => a.innerText.includes('Edit'))
            .map(a => ({ text: a.innerText, href: a.href }));
    });
    console.log('Edit hrefs count:', editHrefs.length);
    if (editHrefs.length > 0) {
        console.log('Sample edit hrefs:', editHrefs.slice(0, 5));
    }

    await browser.close();
}

main().catch(console.error);
