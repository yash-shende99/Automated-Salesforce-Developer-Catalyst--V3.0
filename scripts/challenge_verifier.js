const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const AUTH_FILE = path.join(__dirname, 'trailhead_auth.json');

async function verifyChallenge(unitUrl) {
    console.log(`[Verifier] Verifying unit: ${unitUrl}`);
    const browser = await chromium.launch({ headless: true });
    
    let contextOptions = {
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
    };
    if (fs.existsSync(AUTH_FILE)) {
        contextOptions.storageState = AUTH_FILE;
    }

    const context = await browser.newContext(contextOptions);
    const page = await context.newPage();

    try {
        await page.goto(unitUrl, { waitUntil: 'domcontentloaded', timeout: 35000 });
        await page.waitForTimeout(4000);

        // Check if already completed (button is gone, "Next step" or "Retake this Step" is visible)
        const initialText = await page.evaluate(() => document.body.innerText);
        if (initialText.includes('Retake this Step') || initialText.includes('Assessment Complete!')) {
            console.log('[Verifier] Unit is already completed!');
            return { success: true, message: 'Already completed' };
        }

        // Find the Verify / Check Challenge button
        const checkBtn = page.locator('button:has-text("Verify step to earn"), button:has-text("Check Challenge"), button:has-text("Verify Step"), button:has-text("Verify")').first();
        const isVisible = await checkBtn.isVisible().catch(() => false);

        if (!isVisible) {
            console.log('[Verifier] Check Challenge button not found on page.');
            return { success: false, error: 'Button not found on page' };
        }

        const btnLabel = await checkBtn.innerText();
        console.log(`[Verifier] Clicking button: "${btnLabel}"...`);
        await checkBtn.click();

        // Wait for Trailhead backend verification
        console.log('[Verifier] Waiting for Trailhead backend evaluation...');
        for (let i = 0; i < 30; i++) {
            await page.waitForTimeout(2000);
            const currentText = await page.evaluate(() => document.body.innerText);

            if (currentText.includes('Assessment Complete!') || currentText.includes('Next step:')) {
                console.log('[Verifier] SUCCESS! Assessment Complete confirmed.');
                return { success: true, message: 'Challenge passed successfully!' };
            }

            const errorMatch = currentText.match(/Step not yet complete in[^\n]+\n([^\n]+)/i) ||
                               currentText.match(/We couldn['’]t find[^\n]+/i) ||
                               currentText.match(/We can['’]t find[^\n]+/i) ||
                               currentText.match(/The field[^\n]+not a multi-picklist[^\n]*/i);
            
            if (errorMatch) {
                console.log(`[Verifier] FAILED: ${errorMatch[0]}`);
                return { success: false, error: errorMatch[0] };
            }
        }

        console.log('[Verifier] Timed out waiting for verification banner.');
        return { success: false, error: 'Verification timed out' };
    } catch (err) {
        console.error(`[Verifier Error]: ${err.message}`);
        return { success: false, error: err.message };
    } finally {
        await browser.close();
    }
}

if (require.main === module) {
    const url = process.argv[2];
    if (!url) {
        console.error('Usage: node scripts/challenge_verifier.js <unit_url>');
        process.exit(1);
    }
    verifyChallenge(url).then(res => {
        console.log(JSON.stringify(res, null, 2));
    });
}

module.exports = { verifyChallenge };
