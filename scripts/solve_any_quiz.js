const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const AUTH_FILE = path.join(__dirname, 'trailhead_auth.json');

async function solveQuiz(url, answers) {
    console.log(`\n=== Fast Quiz Solver: ${url} ===`);
    console.log('Answers to select:', answers);

    const auth = JSON.parse(fs.readFileSync(AUTH_FILE, 'utf8'));
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    await context.addCookies(auth.cookies);
    const page = await context.newPage();

    try {
        console.log('Navigating to quiz page...');
        try {
            await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 35000 });
        } catch (e) {
            console.log('[Nav] Proceeding past navigation timeout...');
        }
        await page.waitForTimeout(4000);
        await page.evaluate(() => window.scrollTo(0, document.body ? document.body.scrollHeight : 5000));
        await page.waitForTimeout(3000);

        const isDone = await page.evaluate(() => {
            const body = document.body.innerText;
            return !!document.querySelector('.option-label_correct') || 
                   !!document.querySelector('.c-badge--success') ||
                   body.includes('Challenge Completed') ||
                   body.includes('Tackle the next unit') ||
                   body.includes('100 Points');
        });

        if (isDone) {
            console.log(`[Quiz] Unit is ALREADY completed! Skipping quiz submission.`);
            return true;
        }

        console.log('Waiting for quiz elements to attach...');
        const firstLabel = page.locator('th-enhanced-quiz label, label').first();
        await firstLabel.waitFor({ state: 'attached', timeout: 25000 }).catch(() => {});

        for (let i = 0; i < answers.length; i++) {
            const ans = answers[i];
            console.log(`[Q${i + 1}] Selecting: "${ans}"...`);
            const opt = page.locator('th-enhanced-quiz label, label').filter({ hasText: ans }).first();
            await opt.waitFor({ state: 'attached', timeout: 15000 });
            await opt.scrollIntoViewIfNeeded().catch(() => {});
            await opt.click({ force: true });
            await page.waitForTimeout(1000);
        }

        await page.waitForTimeout(1500);

        const btn = page.locator('th-enhanced-quiz button.button--success, button:has-text("Check the Quiz"), button:has-text("Submit"), button:has-text("Check Quiz")').first();
        console.log('Clicking Submit button...');
        await btn.waitFor({ state: 'attached', timeout: 15000 });
        await btn.scrollIntoViewIfNeeded().catch(() => {});
        await btn.click({ force: true });
        await page.waitForTimeout(8000);

        const bodyText = await page.evaluate(() => document.body.innerText);
        const passed = bodyText.includes('100 Points') || bodyText.includes('Success') || bodyText.includes('earned') || bodyText.includes('Badge') || bodyText.includes('Woohoo') || bodyText.includes('Tackle the next unit');
        console.log('Result:', passed ? 'PASSED (+100 pts)!' : 'Submitted (check audit)');
        return passed;
    } finally {
        await browser.close();
    }
}

if (require.main === module) {
    const url = process.argv[2];
    const answers = JSON.parse(process.argv[3]);
    solveQuiz(url, answers).catch(console.error);
}

module.exports = { solveQuiz };
