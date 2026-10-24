const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const AUTH_FILE = path.join(__dirname, 'trailhead_auth.json');
const units = [
    'get-started-with-apex',
    'practice-in-the-developer-console',
    'use-collections',
    'control-data-flow',
    'use-loops'
];

async function main() {
    const auth = JSON.parse(fs.readFileSync(AUTH_FILE, 'utf8'));
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    await context.addCookies(auth.cookies);
    const page = await context.newPage();

    const results = {};
    for (const u of units) {
        const url = `https://trailhead.salesforce.com/content/learn/modules/apex-basics-for-admins/${u}`;
        await page.goto(url, { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(3000);

        const data = await page.evaluate(() => {
            const el = document.querySelector('[data-react-class="challenge/Challenge"]');
            if (el) {
                const props = JSON.parse(el.getAttribute('data-react-props') || '{}');
                return {
                    title: props.challenge?.title,
                    description: props.challenge?.description,
                    requirements: props.challenge?.requirements,
                    challenge_type: props.challenge?.type
                };
            }
            return { body: document.body.innerText.slice(-2000) };
        });

        results[u] = data;
        console.log(`\n=== UNIT: ${u} ===`);
        console.log('Title:', data.title);
        console.log('Description:', data.description);
        console.log('Requirements:', data.requirements);
    }

    fs.writeFileSync('scripts/apex_basics_requirements.json', JSON.stringify(results, null, 2));
    await browser.close();
}

main().catch(console.error);
