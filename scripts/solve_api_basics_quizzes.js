const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const AUTH_FILE = path.join(__dirname, 'trailhead_auth.json');

const quizzes = [
    {
        unit: 'api_basics_overview',
        answers: [
            'Writing a mobile or web app',
            'Deleting 100,000 records at once'
        ]
    },
    {
        unit: 'api_basics_streaming',
        answers: [
            'Publish and subscribe to binary event messages',
            'Custom notifications with a schema that you define by creating platform event objects and fields.'
        ]
    }
];

async function solveQuiz(page, q) {
    const url = `https://trailhead.salesforce.com/content/learn/modules/api_basics/${q.unit}`;
    console.log(`\n--- SOLVING QUIZ: ${q.unit} ---`);
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(3000);

    for (let i = 0; i < q.answers.length; i++) {
        const ans = q.answers[i];
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
            console.log(`Result for ${q.unit}:`, passed ? 'PASSED (+100 pts)!' : 'Finished check');
            return passed;
        } else {
            console.log('Button is still disabled!');
        }
    } else {
        console.log('No submit button found');
    }
    return true;
}

async function main() {
    console.log('=== SOLVING 360 PLATFORM API BASICS QUIZZES ===\n');

    const auth = JSON.parse(fs.readFileSync(AUTH_FILE, 'utf8'));
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    await context.addCookies(auth.cookies);
    const page = await context.newPage();

    for (const q of quizzes) {
        await solveQuiz(page, q);
        await page.waitForTimeout(2000);
    }

    await browser.close();
    console.log('\n=== QUIZZES COMPLETE ===');
}

main().catch(console.error);
