const { chromium } = require('playwright');
const fs = require('fs');

async function testClean() {
    console.log('Testing clean context with addCookies only...');
    const auth = JSON.parse(fs.readFileSync('scripts/trailhead_auth.json', 'utf8'));
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
    });
    await context.addCookies(auth.cookies);
    const page = await context.newPage();

    const t0 = Date.now();
    const url = 'https://trailhead.salesforce.com/content/learn/modules/lex_implementation_data_management/lex_implementation_data_export';
    console.log(`Navigating to ${url}...`);
    
    try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
        console.log(`Loaded in ${Date.now() - t0}ms! Title: ${await page.title()}`);
        
        await page.waitForTimeout(3000);
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await page.waitForTimeout(2000);

        const text = await page.evaluate(() => document.body.innerText);
        console.log('Body length:', text.length);
        console.log('Contains "Is accessible":', text.includes('Is accessible'));
        console.log('Contains "Completed":', text.includes('Challenge Completed') || text.includes('100 Points'));
    } catch (e) {
        console.error('Error loading:', e.message);
    } finally {
        await browser.close();
    }
}

testClean().catch(console.error);
