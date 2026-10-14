const { chromium } = require('playwright');
const { execSync } = require('child_process');

async function test() {
    console.log('Generating frontdoor URL with sf org open...');
    const out = JSON.parse(execSync('sf org open -p "/setup/ui/tabcustomname.apexp" -r --json -o friend_org').toString());
    const frontdoorUrl = out.result.url;

    // Fetch frontdoor HTML to extract contentDoorUrl
    const res = await fetch(frontdoorUrl, { redirect: 'manual' });
    const body = await res.text();
    const match = body.match(/window\.location\.replace\("([^"]+)"\)/);
    if (!match) {
        console.error('No contentDoor found in frontdoor body!');
        return;
    }
    const contentDoorUrl = match[1].replace(/\\/g, '');
    console.log('Got contentDoorUrl! Navigating browser directly to it...');

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        viewport: { width: 1440, height: 900 }
    });
    const page = await context.newPage();

    // Navigate to contentDoorUrl with 30s timeout
    await page.goto(contentDoorUrl, { waitUntil: 'domcontentloaded', timeout: 35000 });
    console.log('Direct contentDoor goto finished! URL:', page.url());
    console.log('Waiting 5s for page to settle...');
    await page.waitForTimeout(5000);

    console.log('Final URL:', page.url());
    console.log('Final Title:', await page.title());

    const content = await page.content();
    console.log('Content length:', content.length);
    if (content.includes('Account')) {
        console.log('SUCCESS! Page contains Account!');
    }

    await page.screenshot({ path: 'scripts/scratch/contentdoor_landing.png' });
    await browser.close();
}

test().catch(console.error);
