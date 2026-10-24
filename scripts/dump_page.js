const { chromium } = require('playwright');
const { execSync } = require('child_process');
const fs = require('fs');

async function test() {
    const out = JSON.parse(execSync('sf org open --url-only --path "/lightning/setup/RenameTabAndLabels/home" --json -o friend_org').toString());
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        viewport: { width: 1440, height: 900 }
    });
    const page = await context.newPage();
    await page.goto(out.result.url, { waitUntil: 'commit' }).catch(() => {});
    console.log('Waiting 15 seconds with real User-Agent...');
    await page.waitForTimeout(15000);
    const html = await page.content();
    fs.writeFileSync('scripts/scratch/renametab_page_dump2.html', html);
    console.log('Saved dump2, length:', html.length);
    const hasCssError = html.includes('CSS Error');
    console.log('Has CSS Error?', hasCssError);
    const iframes = await page.locator('iframe').count();
    console.log('Iframes count:', iframes);
    await browser.close();
}
test().catch(console.error);
