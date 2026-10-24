const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function main() {
    const browser = await chromium.launch({ headless: true });
    const AUTH_FILE = path.join(__dirname, 'trailhead_auth.json');
    const context = await browser.newContext({
        storageState: AUTH_FILE,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
    });

    const urls = [
        'https://trailhead.salesforce.com/content/learn/modules/lex_implementation_data_management/lex_implementation_data_import',
        'https://trailhead.salesforce.com/content/learn/modules/lex_implementation_data_management/lex_implementation_data_export'
    ];

    for (const url of urls) {
        console.log(`\n========================================`);
        console.log(`Inspecting: ${url}`);
        const page = await context.newPage();
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.waitForTimeout(5000);

        const result = await page.evaluate(() => {
            // Check for challenge / assessment / quiz
            const challengeEl = document.querySelector('[data-test-id="challenge"]') || 
                                document.querySelector('#challenge') ||
                                document.querySelector('.challenge-container') ||
                                document.querySelector('section[aria-label*="Challenge"]') ||
                                document.querySelector('section:has(button[data-test-id="check-challenge-btn"])');
            
            // Check for quiz form
            const quizForm = document.querySelector('form[action*="assessment"]') || document.querySelector('[data-test-id="quiz"]');

            return {
                title: document.title,
                challengeText: challengeEl ? challengeEl.innerText : 'No challenge element found directly',
                hasQuizForm: !!quizForm,
                quizText: quizForm ? quizForm.innerText : null,
                allButtons: Array.from(document.querySelectorAll('button')).map(b => b.innerText).filter(t => t.includes('Check') || t.includes('Retest') || t.includes('Quiz') || t.includes('Points'))
            };
        });

        console.log(JSON.stringify(result, null, 2));

        // If no challenge element found directly, let's grab the bottom 3000 chars of body
        const bodyText = await page.evaluate(() => document.body.innerText);
        const challengeIdx = bodyText.lastIndexOf('Challenge');
        if (challengeIdx !== -1) {
            console.log('\n--- Challenge section from innerText ---');
            console.log(bodyText.slice(challengeIdx, challengeIdx + 2000));
        }

        await page.close();
    }

    await browser.close();
}

main().catch(console.error);
