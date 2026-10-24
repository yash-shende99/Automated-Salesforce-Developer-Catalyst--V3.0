const { chromium } = require('playwright');
const { execSync } = require('child_process');
const fs = require('fs');

async function main() {
    const orgUrl = execSync('sf org open -r -o trailhead --json', { encoding: 'utf8' });
    const { url } = JSON.parse(orgUrl).result;

    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'load' });
    await page.waitForTimeout(4000);

    await page.goto('https://creative-badger-i5mqnc-dev-ed.trailblaze.lightning.force.com/lightning/setup/SecuritySharing/home', { waitUntil: 'load' });
    await page.waitForTimeout(8000);

    const frame = page.frameLocator('iframe').first();
    const tableText = await frame.locator('table').allInnerTexts().catch(() => []);
    fs.writeFileSync('scratch_owd_tables.txt', JSON.stringify(tableText, null, 2));
    console.log('OWD tables text dumped, found tables:', tableText.length);

    await browser.close();
}

main().catch(console.error);
