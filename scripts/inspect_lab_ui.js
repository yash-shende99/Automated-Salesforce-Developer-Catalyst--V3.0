const { chromium } = require('playwright');
const { execSync } = require('child_process');

async function main() {
    const orgInfo = JSON.parse(execSync('sf org display --json').toString());
    const instanceUrl = orgInfo.result.instanceUrl;
    const accessToken = orgInfo.result.accessToken;
    const frontdoor = `${instanceUrl}/secur/frontdoor.jsp?sid=${accessToken}&retURL=${encodeURIComponent('/visualEditor/appBuilder.app')}`;

    console.log('Launching browser...');
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    console.log('Navigating to App Builder...');
    await page.goto(frontdoor, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(5000);

    console.log('Page URL:', page.url());
    // Take a screenshot or dump text
    const text = await page.evaluate(() => document.body.innerText);
    console.log('Text preview:', text.slice(0, 500));

    // Look for New button or template options if modal open
    const buttons = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('button, a, input, [role="button"]')).map(el => ({
            tag: el.tagName,
            text: el.innerText || el.value || el.getAttribute('aria-label') || el.className
        })).filter(b => b.text && b.text.trim().length > 0);
    });
    console.log('Found buttons:', buttons.slice(0, 30));

    await browser.close();
}

main().catch(console.error);
