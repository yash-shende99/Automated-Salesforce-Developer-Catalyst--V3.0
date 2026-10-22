const { chromium } = require('playwright');
const fs = require('fs');

async function main() {
    const auth = JSON.parse(fs.readFileSync('scripts/trailhead_auth.json', 'utf8'));
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    await context.addCookies(auth.cookies);
    const page = await context.newPage();

    const targetUrl = process.argv[2] || 'https://trailhead.salesforce.com/content/learn/modules/screen-flows/build-a-screen-flow';
    console.log(`Navigating to ${targetUrl}...`);
    await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(5000);

    const info = await page.evaluate(() => {
        const orgSelector = document.querySelector('select[name="hands_on_org_id"]') || document.querySelector('[data-testid="hands-on-org-select"]') || document.querySelector('.th-select-org');
        const orgName = document.querySelector('[data-testid="hands-on-org-name"]') || document.querySelector('.c-hands-on-org-details');
        const allLinks = Array.from(document.querySelectorAll('a'));
        const launchBtn = allLinks.find(a => (a.getAttribute('href') || '').includes('/launch_org/') || a.innerText.includes('Launch'));
        const checkBtn = document.querySelector('button[data-testid="check-challenge-button"]') || document.querySelector('.c-challenge-button') || Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Check Challenge'));
        
        return {
            orgSelectorText: orgSelector ? orgSelector.innerText : null,
            orgNameText: orgName ? orgName.innerText : null,
            launchHref: launchBtn ? (launchBtn.getAttribute('href') || launchBtn.innerText) : null,
            checkBtnText: checkBtn ? checkBtn.innerText : null,
            bodySnippet: document.body.innerText.slice(-2500)
        };
    });

    console.log('Page Evaluation:', JSON.stringify(info, null, 2));
    await browser.close();
}

main().catch(console.error);
