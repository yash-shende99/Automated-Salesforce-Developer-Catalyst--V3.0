const { chromium } = require('playwright');
const { execSync } = require('child_process');

async function cloneProfiles() {
    console.log('[ProfileCloner] Getting frontdoor login URL for friend_org...');
    const out = JSON.parse(execSync('sf org open -r --json -o friend_org').toString());
    const loginUrl = out.result.url;

    // Get baseUrl
    const urlObj = new URL(loginUrl);
    const origin = urlObj.origin;

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    console.log('[ProfileCloner] Logging into org...');
    await page.goto(loginUrl, { waitUntil: 'domcontentloaded', timeout: 35000 });
    await page.waitForTimeout(4000);

    const standardProfileId = '00edM00000VdgFyQAJ'; // Standard User
    const profilesToCreate = ['Sales User', 'Support User'];

    for (const pName of profilesToCreate) {
        console.log(`[ProfileCloner] Navigating to clone page for: ${pName}`);
        const cloneUrl = `${origin}/${standardProfileId}/e?clone=1`;
        await page.goto(cloneUrl, { waitUntil: 'domcontentloaded', timeout: 35000 });
        await page.waitForTimeout(3000);

        // Find the Profile Name input
        const nameInput = page.locator('input#ProfileName, input[name="ProfileName"]').first();
        await nameInput.waitFor({ state: 'visible', timeout: 15000 });
        await nameInput.fill(pName);

        // Click Save
        const saveBtn = page.locator('input[name="save"], input[value=" Save "], input[value="Save"]').first();
        await saveBtn.click();
        await page.waitForTimeout(4000);
        console.log(`[ProfileCloner] Successfully created profile: ${pName}`);
    }

    await browser.close();
    console.log('[ProfileCloner] Done cloning profiles!');
}

cloneProfiles().catch(console.error);
