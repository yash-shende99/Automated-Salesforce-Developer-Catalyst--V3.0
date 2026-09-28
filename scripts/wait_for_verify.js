const { chromium } = require('playwright');
const fs = require('fs');

async function main() {
    const auth = JSON.parse(fs.readFileSync('./scripts/trailhead_auth.json', 'utf8'));
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    await context.addCookies(auth.cookies);

    const page = await context.newPage();
    await page.goto('https://trailhead.salesforce.com/content/learn/projects/keep-data-secure-in-a-recruiting-app/fls-perm-sets-sharing', { waitUntil: 'networkidle' });

    console.log('Finding verify button...');
    const btn = page.locator('button:has-text("Verify step")').first();
    await btn.scrollIntoViewIfNeeded();

    page.on('response', async res => {
        if (res.url().includes('check_challenge')) {
            try {
                const body = await res.json();
                console.log(`[check_challenge] status: ${body.challenge_status}, response: ${body.challenge_response}`);
            } catch (e) {}
        }
    });

    console.log('Clicking verify button...');
    await btn.click();

    console.log('Waiting up to 45 seconds for completion...');
    for (let i = 0; i < 9; i++) {
        await page.waitForTimeout(5000);
        const text = await page.evaluate(() => {
            const err = document.querySelector('.slds-theme_error') || document.querySelector('[data-testid="error-message"]') || document.querySelector('.th-alert--error');
            const success = document.querySelector('.slds-theme_success') || document.querySelector('.celebration-modal');
            return {
                err: err ? err.innerText : null,
                success: success ? success.innerText : null,
                btnDisabled: document.querySelector('button[disabled]') ? true : false
            };
        });
        console.log(`Check ${i+1}:`, text);
        if (text.err || text.success) break;
    }

    await page.screenshot({ path: 'scratch_final_verify.png' });
    console.log('Final screenshot saved to scratch_final_verify.png');
    await browser.close();
}

main().catch(console.error);
