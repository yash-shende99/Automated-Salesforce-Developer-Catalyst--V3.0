const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function main() {
    const browser = await chromium.launch({ headless: true });
    const AUTH_FILE = path.join(__dirname, 'trailhead_auth.json');
    const context = await browser.newContext({
        storageState: AUTH_FILE,
        viewport: { width: 1440, height: 1200 },
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
    });

    const page = await context.newPage();
    const url = 'https://trailhead.salesforce.com/content/learn/modules/lex_implementation_data_management/lex_implementation_data_export';
    await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
    
    // Find button
    const btn = page.locator('button:has-text("Check the Quiz")').first();
    await btn.scrollIntoViewIfNeeded();
    await page.waitForTimeout(2000);
    
    await page.screenshot({ path: 'scripts/quiz_visible.png' });

    // Look for form or container around button
    const quizCard = await page.evaluate(() => {
        const btn = document.querySelector('button[data-test-id="check-challenge-btn"]') || Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Check the Quiz'));
        if (!btn) return 'No button found';
        
        let parent = btn.parentElement;
        while (parent && parent.innerText.length < 300 && parent !== document.body) {
            parent = parent.parentElement;
        }
        return parent ? parent.innerText : 'No parent';
    });

    console.log('Quiz Card Text:\n', quizCard);

    // Also look for radio inputs or question elements in that parent
    const inputs = await page.evaluate(() => {
        const list = [];
        document.querySelectorAll('input[type="radio"], input[type="checkbox"]').forEach(i => {
            list.push({
                name: i.name,
                value: i.value,
                id: i.id,
                label: i.labels && i.labels[0] ? i.labels[0].innerText : (i.closest('label') ? i.closest('label').innerText : i.parentElement.innerText)
            });
        });
        return list;
    });
    console.log('Inputs found:', JSON.stringify(inputs, null, 2));

    await browser.close();
}

main().catch(console.error);
