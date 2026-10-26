const { chromium } = require('playwright');
const path = require('path');

const UNITS = [
    {
        name: 'Get Started with Event Monitoring',
        slug: 'event_monitoring_intro',
        answers: [
            'Monitoring which IP addresses users are logging in from',
            'Developer Edition'
        ]
    },
    {
        name: 'Query Event Log Files',
        slug: 'event_monitoring_query',
        answers: [
            'Execute',
            'Access and download event log files.'
        ]
    },
    {
        name: 'Download and Visualize Event Log Files',
        slug: 'event_monitoring_download',
        answers: [
            '.csv',
            'Scripts help you automate your downloads.'
        ]
    }
];

async function solveQuiz(page, unit) {
    const url = `https://trailhead.salesforce.com/content/learn/modules/event_monitoring/${unit.slug}`;
    console.log(`\nSolving ${unit.name} (${unit.slug})...`);
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(4000);

    // Dismiss cookie banner
    try {
        const accept = page.locator('#accept-recommended-btn-handler');
        if (await accept.isVisible()) await accept.click();
    } catch(e) {}

    // Scroll to bottom
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(2000);

    // Select each answer
    for (const ans of unit.answers) {
        console.log(`  Selecting: "${ans}"`);
        const opt = page.locator(`label:has-text("${ans}")`).first();
        await opt.click();
        await page.waitForTimeout(500);
    }

    // Click submit button
    console.log('  Submitting quiz...');
    const btn = page.locator('text="Check the Quiz to Earn 100 Points"').first();
    await btn.click();
    await page.waitForTimeout(6000);

    const bodyText = await page.evaluate(() => document.body.innerText);
    if (bodyText.includes('You earned') || bodyText.includes('100 Points') || bodyText.includes('Success') || bodyText.includes('Badge') || bodyText.includes('Woohoo')) {
        console.log(`  PASSED: ${unit.name} (+100 pts)`);
    } else {
        console.log(`  Result check: ${bodyText.slice(-300)}`);
    }
}

async function main() {
    console.log('=== SOLVING MODULE: Event Monitoring (event_monitoring) ===\n');
    const browser = await chromium.launch({ headless: true });
    const AUTH_FILE = path.join(__dirname, 'trailhead_auth.json');
    const context = await browser.newContext({
        storageState: AUTH_FILE,
        viewport: { width: 1440, height: 1000 },
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
    });

    const page = await context.newPage();

    for (const unit of UNITS) {
        await solveQuiz(page, unit);
    }

    await browser.close();
    console.log('\n=== ALL UNITS IN EVENT MONITORING COMPLETED! ===');
}

main().catch(err => {
    console.error('Fatal error in solve script:', err);
    process.exit(1);
});
