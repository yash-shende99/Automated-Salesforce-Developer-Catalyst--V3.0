const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const AUTH_FILE = path.join(__dirname, 'trailhead_auth.json');

async function main() {
    const moduleSlug = process.argv[2] || 'pw-api-basics';
    console.log(`=== INSPECTING MODULE: ${moduleSlug} ===\n`);

    const auth = JSON.parse(fs.readFileSync(AUTH_FILE, 'utf8'));
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    await context.addCookies(auth.cookies);
    const page = await context.newPage();

    const moduleUrl = `https://trailhead.salesforce.com/content/learn/modules/${moduleSlug}`;
    await page.goto(moduleUrl, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);

    const units = await page.evaluate((slug) => {
        const links = Array.from(document.querySelectorAll(`a[href*="/content/learn/modules/${slug}/"]`));
        return Array.from(new Set(links.map(a => a.href))).filter(h => !h.endsWith(`/${slug}`));
    }, moduleSlug);

    console.log(`Found ${units.length} units in ${moduleSlug}:`);

    const unitDetails = [];
    for (const unitUrl of units) {
        const slug = unitUrl.split('/').pop();
        await page.goto(unitUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
        await page.waitForTimeout(3000);

        const data = await page.evaluate(() => {
            const el = document.querySelector('[data-react-class="challenge/Challenge"]');
            if (el) {
                const props = JSON.parse(el.getAttribute('data-react-props') || '{}');
                return {
                    type: props.challenge?.type,
                    title: props.challenge?.title,
                    questions: props.challenge?.questions,
                    completed: props.challenge?.completed,
                    points: props.challenge?.points
                };
            }
            return {
                type: 'unknown',
                text: document.body.innerText.slice(-1500)
            };
        });

        unitDetails.push({ unitUrl, slug, data });
        console.log(`\nUnit: ${slug} | Type: ${data.type} | Completed: ${data.completed}`);
        if (data.questions) {
            console.log('Questions:', JSON.stringify(data.questions, null, 2));
        }
    }

    fs.writeFileSync(`scripts/${moduleSlug}_details.json`, JSON.stringify(unitDetails, null, 2));
    console.log(`\nSaved scripts/${moduleSlug}_details.json`);
    await browser.close();
}

main().catch(console.error);
