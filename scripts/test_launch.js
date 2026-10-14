const { chromium } = require('playwright');
const path = require('path');

async function testLaunch() {
    const AUTH_FILE = path.join(__dirname, 'trailhead_auth.json');
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        storageState: AUTH_FILE,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
    });
    const page = await context.newPage();

    console.log('[Launch] Going to /launch_org/23980024...');
    let frontdoorUrl = null;

    page.on('request', req => {
        const u = req.url();
        if (u.includes('frontdoor.jsp') || u.includes('my.salesforce.com')) {
            console.log(`[Request URL]: ${u.slice(0, 150)}`);
            if (u.includes('frontdoor.jsp')) frontdoorUrl = u;
        }
    });

    try {
        await page.goto('https://trailhead.salesforce.com/launch_org/23980024', { waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.waitForTimeout(6000);
        console.log(`[Current URL]: ${page.url()}`);
        console.log(`[Captured Frontdoor URL]: ${frontdoorUrl}`);
    } catch (e) {
        console.error(e.message);
    } finally {
        await browser.close();
    }
}

testLaunch().catch(console.error);
