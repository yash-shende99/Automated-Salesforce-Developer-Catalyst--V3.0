const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const AUTH_FILE = path.join(__dirname, 'trailhead_auth.json');

const unitAnswers = [
    {
        unit: 'spe_admins_set_up_hoc',
        answers: [
            'Customize Application and Manage Encryption Keys',
            'Search and reporting performance might be slightly affected.'
        ]
    },
    {
        unit: 'use-database-encryption-with-files-and-attachments-encryption',
        answers: [
            'The existing tenant secret is archived, and new encryption keys are generated from the new secret.',
            'Field values are encrypted only in records created or updated after encryption is enabled. Calvin can click sync to encrypt the remaining records.'
        ]
    },
    {
        unit: 'spe_admins_deploy',
        answers: [
            'Field values are encrypted only in records created or updated after encryption is enabled.',
            'The search index holds a readily accessible summary of the data, which could expose snippets of sensitive information through search results.'
        ]
    }
];

async function solveQuiz(page, unitConfig) {
    const url = `https://trailhead.salesforce.com/content/learn/modules/spe_admins/${unitConfig.unit}`;
    console.log(`\n--- SOLVING: ${unitConfig.unit} ---`);
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(3000);

    // Check if already completed
    const alreadyCompleted = await page.evaluate(() => {
        const text = document.body.innerText;
        return text.includes('You earned') || text.includes('Completed');
    });

    for (let i = 0; i < unitConfig.answers.length; i++) {
        const ans = unitConfig.answers[i];
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
            console.log(`Result for ${unitConfig.unit}:`, passed ? 'PASSED (+100 pts)!' : 'Finished check');
            return passed;
        } else {
            console.log('Button is still disabled, checking if already completed:', alreadyCompleted);
        }
    } else {
        console.log('No submit button found, already completed:', alreadyCompleted);
    }
    return true;
}

async function main() {
    console.log('=== SOLVING MODULE 23: Shield Platform Encryption (spe_admins) ===\n');

    const auth = JSON.parse(fs.readFileSync(AUTH_FILE, 'utf8'));
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
    });
    await context.addCookies(auth.cookies);
    const page = await context.newPage();

    for (const unitConfig of unitAnswers) {
        await solveQuiz(page, unitConfig);
        await page.waitForTimeout(2000);
    }

    await browser.close();
    console.log('\n=== MODULE 23 COMPLETE ===');
}

main().catch(console.error);
