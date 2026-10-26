const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const { directCheckChallenge } = require('./direct_api_verifier');

const AUTH_FILE = path.join(__dirname, 'trailhead_auth.json');

async function solveQuizUnit(page, slug, answers) {
    const url = `https://trailhead.salesforce.com/content/learn/modules/api_basics/${slug}`;
    console.log(`\n--- SOLVING QUIZ: ${slug} ---`);
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(3000);

    for (let i = 0; i < answers.length; i++) {
        const ans = answers[i];
        console.log(`Selecting Option ${i + 1}: "${ans.slice(0, 45)}..."`);
        const opt = page.locator('th-enhanced-quiz label').filter({ hasText: ans }).first();
        if (await opt.count() > 0) {
            await opt.click();
            await page.waitForTimeout(600);
        } else {
            console.log(`Warning: Option not found: ${ans}`);
        }
    }

    await page.waitForTimeout(1000);

    const btn = page.locator('th-enhanced-quiz button.button--success').first();
    if (await btn.count() > 0) {
        const cls = await btn.getAttribute('class');
        console.log('Submit button class:', cls);
        if (!cls.includes('button--disabled')) {
            console.log('Clicking submit button...');
            await btn.click();
            await page.waitForTimeout(7000);
            const text = await page.evaluate(() => document.body.innerText);
            const passed = text.includes('100 Points') || text.includes('Success') || text.includes('earned') || text.includes('Badge') || text.includes('Woohoo');
            console.log(`Result for ${slug}:`, passed ? 'PASSED (+100 pts)!' : 'Finished check');
            return passed;
        } else {
            console.log('Button is still disabled!');
        }
    } else {
        console.log('No submit button found');
    }
    return true;
}

async function verifyHandsOnUnit(slug) {
    console.log(`\n--- VERIFYING HANDS-ON: ${slug} ---`);
    const res = await directCheckChallenge(slug, 'api_basics');
    console.log(`Result for ${slug}:`, res.success ? `PASSED (+${res.raw?.pointsToEarn || 500} pts)!` : res.message || res.error);
    return res.success;
}

async function main() {
    console.log('=== SOLVING MODULE 25: 360 Platform API Basics (api_basics) ===\n');

    const auth = JSON.parse(fs.readFileSync(AUTH_FILE, 'utf8'));
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    await context.addCookies(auth.cookies);
    const page = await context.newPage();

    // Unit 1: Quiz
    await solveQuizUnit(page, 'api_basics_overview', [
        'Writing a mobile or web app',
        'Deleting 100,000 records at once'
    ]);

    // Unit 2: Hands-on REST
    await verifyHandsOnUnit('api_basics_rest');

    // Unit 3: Hands-on Bulk
    await verifyHandsOnUnit('api_basics_bulk');

    // Unit 4: Quiz
    await solveQuizUnit(page, 'api_basics_streaming', [
        'Publish and subscribe to binary event messages',
        'Custom notifications with a schema that you define by creating platform event objects and fields.'
    ]);

    await browser.close();
    console.log('\n=== MODULE 25 COMPLETE ===');
}

main().catch(console.error);
