const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function getOrgs() {
    const AUTH_FILE = path.join(__dirname, 'trailhead_auth.json');
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        storageState: AUTH_FILE,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
    });
    const page = await context.newPage();

    // Listen to network responses to see GraphQL/REST calls returning org info
    page.on('response', async res => {
        const url = res.url();
        if (url.includes('graphql') || url.includes('tds') || url.includes('orgs') || url.includes('trailhead')) {
            try {
                const text = await res.text();
                if (text.includes('00D') || text.includes('username') || text.includes('Playground')) {
                    console.log(`[Network Response ${url.slice(0, 80)}] length: ${text.length}`);
                    // Search for org names or usernames
                    const matches = text.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g);
                    if (matches) console.log('Found emails/usernames:', [...new Set(matches)]);
                }
            } catch(e) {}
        }
    });

    console.log('[Orgs] Navigating to https://trailhead.salesforce.com/users/profiles/orgs');
    await page.goto('https://trailhead.salesforce.com/users/profiles/orgs', { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(5000);

    const bodyText = await page.evaluate(() => document.body.innerText);
    console.log('--- Page text preview ---');
    console.log(bodyText.slice(0, 1500));
    console.log('-------------------------');

    await browser.close();
}

getOrgs().catch(console.error);
