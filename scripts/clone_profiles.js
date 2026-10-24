const { chromium } = require('playwright');
const { execSync } = require('child_process');

async function cloneProfiles() {
    console.log('[ProfileCloner] Getting frontdoor login URL...');
    const out = JSON.parse(execSync('sf org open -r --json').toString());
    const loginUrl = out.result.url;

    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    console.log('[ProfileCloner] Logging into org...');
    await page.goto(loginUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);

    const profilesToCreate = ['Recruiter: Technical', 'Recruiter: Nontechnical'];
    const standardProfileId = '00eg8000007Mn3aAAC';

    for (const pName of profilesToCreate) {
        console.log(`[ProfileCloner] Navigating to clone page for: ${pName}`);
        const cloneUrl = `https://creative-badger-i5mqnc-dev-ed.trailblaze.my.salesforce.com/${standardProfileId}/e?clone=1`;
        await page.goto(cloneUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.waitForTimeout(2000);

        // Find the Profile Name input
        const nameInput = page.locator('input#ProfileName, input[name="ProfileName"], input[type="text"]').first();
        await nameInput.fill(pName);

        // Click Save
        const saveBtn = page.locator('input[name="save"], input[value=" Save "], input[value="Save"]').first();
        await saveBtn.click();
        await page.waitForTimeout(3000);
        console.log(`[ProfileCloner] Successfully created profile: ${pName}`);
    }

    await browser.close();
    console.log('[ProfileCloner] Done!');
}

if (require.main === module) {
    cloneProfiles().catch(console.error);
}

module.exports = { cloneProfiles };
