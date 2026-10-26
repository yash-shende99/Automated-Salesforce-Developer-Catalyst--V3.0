const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const AUTH_FILE = path.join(__dirname, 'trailhead_auth.json');

async function captureSession() {
    console.log('\n============================================================');
    console.log(' 👉 Launching clean Chrome window (Stealth mode)...');
    console.log(' 👉 Please log in with your Google or Trailhead credentials.');
    console.log('============================================================\n');

    const browser = await chromium.launch({
        headless: false,
        channel: 'chrome',
        ignoreDefaultArgs: ['--enable-automation'],
        args: [
            '--disable-blink-features=AutomationControlled',
            '--start-maximized',
            '--no-sandbox',
            '--disable-infobars'
        ]
    });
    
    const context = await browser.newContext({ 
        viewport: null,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'
    });

    await context.addInitScript(() => {
        Object.defineProperty(navigator, 'webdriver', {
            get: () => undefined
        });
        window.navigator.chrome = {
            runtime: {}
        };
    });

    const page = await context.newPage();

    try {
        await page.goto('https://trailhead.salesforce.com/login', { waitUntil: 'domcontentloaded', timeout: 60000 });
    } catch (e) {
        console.log('[Auth Helper] Direct login URL note:', e.message);
        await page.goto('https://trailhead.salesforce.com', { waitUntil: 'domcontentloaded', timeout: 60000 });
    }

    console.log('[Auth Helper] Waiting for login completion (up to 5 minutes)...');
    let saved = false;
    const maxWaitSec = 300; // 5 minutes
    const start = Date.now();

    while (Date.now() - start < maxWaitSec * 1000) {
        await page.waitForTimeout(2000);
        try {
            const currentUrl = page.url();
            const text = await page.evaluate(() => document.body ? document.body.innerText : '');
            
            // Check if logged in
            if (!currentUrl.includes('/login') && !currentUrl.includes('accounts.google.com') && !currentUrl.includes('errors.edgesuite') && 
                (text.includes('Points') || text.includes('Rank') || text.includes('Log Out') || text.includes('Favorites') || text.includes('Profile') || text.includes('Today') || text.includes('Gaurav') || text.includes('gaurav'))) {
                console.log('\n============================================================');
                console.log('  SUCCESS! Active login session detected!');
                console.log('============================================================\n');
                await page.waitForTimeout(3000);
                await context.storageState({ path: AUTH_FILE });
                console.log('[Auth Helper] Saved session to: ' + AUTH_FILE);
                saved = true;
                break;
            }
        } catch (e) {
            // Ignore navigation transition errors
        }
    }

    if (!saved) {
        console.log('[Auth Helper] Saving current session state before closing...');
        await context.storageState({ path: AUTH_FILE });
    }

    await page.waitForTimeout(1500);
    await browser.close();
}

captureSession().catch(err => {
    console.error('Session capture error:', err.message);
});
