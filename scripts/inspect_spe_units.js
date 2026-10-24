const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const AUTH_FILE = path.join(__dirname, 'trailhead_auth.json');

const units = [
    'spe_admins_get_started',
    'spe_admins_set_up_hoc',
    'use-database-encryption-with-files-and-attachments-encryption',
    'spe_admins_deploy'
];

async function main() {
    const auth = JSON.parse(fs.readFileSync(AUTH_FILE, 'utf8'));
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ storageState: AUTH_FILE });
    const page = await context.newPage();

    for (const unit of units) {
        const url = `https://trailhead.salesforce.com/content/learn/modules/spe_admins/${unit}`;
        console.log(`\n================== UNIT: ${unit} ==================`);
        await page.goto(url, { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(3000);

        const data = await page.evaluate(() => {
            const el = document.querySelector('[data-react-class="challenge/Challenge"]');
            if (el) {
                const props = JSON.parse(el.getAttribute('data-react-props') || '{}');
                return {
                    type: props.challenge?.type,
                    title: props.challenge?.title,
                    questions: props.challenge?.questions,
                    completed: props.challenge?.completed
                };
            }
            return { raw: document.body.innerText.slice(-2000) };
        });

        console.log(JSON.stringify(data, null, 2));
    }

    await browser.close();
}

main().catch(console.error);
