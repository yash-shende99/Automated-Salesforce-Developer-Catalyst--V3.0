const { chromium } = require('playwright');
const fs = require('fs');

async function main() {
    const auth = JSON.parse(fs.readFileSync('scripts/trailhead_auth.json', 'utf8'));
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    await context.addCookies(auth.cookies);
    const page = await context.newPage();

    const url = 'https://trailhead.salesforce.com/content/learn/modules/screen-flows/get-started-with-screen-flows';
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 35000 }).catch(() => {});
    await page.waitForTimeout(5000);

    const challengeData = await page.evaluate(() => {
        const quizTag = document.querySelector('th-enhanced-quiz');
        const allButtons = Array.from(document.querySelectorAll('button')).map(b => b.innerText.trim());
        const allLabels = Array.from(document.querySelectorAll('label')).map(l => l.innerText.trim());
        const completedBadge = document.querySelector('.c-badge--success');
        return {
            hasQuizTag: !!quizTag,
            quizInnerSnippet: quizTag ? quizTag.innerText.slice(0, 1000) : null,
            buttons: allButtons.filter(b => b.length > 0 && b.length < 50),
            labels: allLabels.filter(l => l.length > 0 && l.length < 100),
            hasCompletedBadge: !!completedBadge,
            completedBadgeText: completedBadge ? completedBadge.innerText : null
        };
    });

    console.log(JSON.stringify(challengeData, null, 2));
    await browser.close();
}

main().catch(console.error);
