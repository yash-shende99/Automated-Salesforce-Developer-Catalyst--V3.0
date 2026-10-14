const { chromium } = require('playwright');
const fs = require('fs');

async function main() {
    const auth = JSON.parse(fs.readFileSync('scripts/trailhead_auth.json', 'utf8'));
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    await context.addCookies(auth.cookies);
    const page = await context.newPage();

    page.on('request', req => {
        if (req.url().includes('check_challenge') || req.url().includes('graphql') || req.url().includes('tds')) {
            console.log(`[REQ] ${req.method()} ${req.url()}`);
            if (req.postData()) console.log(`[REQ BODY] ${req.postData().slice(0, 300)}`);
        }
    });

    page.on('response', async res => {
        if (res.url().includes('check_challenge') || res.url().includes('graphql')) {
            try {
                const text = await res.text();
                console.log(`[RES ${res.status()}] ${res.url()}: ${text.slice(0, 400)}`);
            } catch(e) {}
        }
    });

    const targetUrl = 'https://trailhead.salesforce.com/content/learn/modules/screen-flows/build-a-screen-flow';
    console.log(`Navigating to ${targetUrl}...`);
    await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(5000);

    console.log('Finding Check Challenge button...');
    const checkBtn = page.locator('button:has-text("Check Challenge")').first();
    await checkBtn.scrollIntoViewIfNeeded();
    console.log('Clicking Check Challenge...');
    await checkBtn.click();

    console.log('Waiting 15s for verification response...');
    await page.waitForTimeout(15000);

    const resultText = await page.evaluate(() => {
        const modal = document.querySelector('.c-challenge-modal') || document.querySelector('.modal-content') || document.querySelector('.c-badge--success');
        return {
            modalText: modal ? modal.innerText : null,
            bodySnippet: document.body.innerText.slice(-1500)
        };
    });

    console.log('Result:', JSON.stringify(resultText, null, 2));
    await browser.close();
}

main().catch(console.error);
