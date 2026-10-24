const { chromium } = require('playwright');
const { execSync } = require('child_process');

(async () => {
    console.log('[ProfileCloner] Getting frontdoor login URL...');
    const out = JSON.parse(execSync('sf org open -r -o trailhead --json').toString());
    const loginUrl = out.result.url;

    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    console.log('[ProfileCloner] Logging into org...');
    await page.goto(loginUrl, { waitUntil: 'load', timeout: 30000 });
    await page.waitForTimeout(4000);

    const standardProfileId = '00eg8000007Mn3aAAC';
    const myDomain = page.url().split('.lightning.force.com')[0].split('.my.salesforce-setup.com')[0];
    const cloneUrl = `${myDomain}.my.salesforce.com/${standardProfileId}/e?clone=1`;
    console.log('[ProfileCloner] Navigating to classic clone page:', cloneUrl);
    await page.goto(cloneUrl, { waitUntil: 'load', timeout: 30000 });
    await page.waitForTimeout(3000);

    const nameInput = page.locator('input#ProfileName, input[name="ProfileName"]').first();
    await nameInput.waitFor({ state: 'visible', timeout: 15000 });
    await nameInput.fill('HR Recruiter');

    const saveBtn = page.locator('input[name="save"], input[value=" Save "], input[value="Save"]').first();
    await saveBtn.click();
    await page.waitForTimeout(5000);
    console.log('[ProfileCloner] Successfully cloned profile: HR Recruiter');

    await browser.close();
})();
