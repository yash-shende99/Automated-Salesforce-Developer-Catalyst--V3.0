const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function checkState() {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        storageState: path.join(__dirname, 'trailhead_auth.json'),
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
    });
    const page = await context.newPage();
    const url = 'https://trailhead.salesforce.com/content/learn/modules/lex_implementation_data_management/lex_implementation_data_export';
    console.log(`Navigating to ${url}...`);
    try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 35000 });
    } catch(e) {
        console.log('Past timeout...');
    }
    console.log('Current URL after goto:', page.url());
    const rawContent = await page.content();
    console.log('Raw content length:', rawContent.length);
    fs.writeFileSync('scripts/debug_page_content.html', rawContent);

    if (rawContent.length < 500) {
        console.log('Raw content:', rawContent);
    }

    const title = await page.title();
    const body = await page.evaluate(() => document.body.innerText);
    console.log('Title:', title);
    console.log('Body length:', body.length);
    console.log('Contains "Is accessible":', body.includes('Is accessible'));
    console.log('Contains "Completed":', body.includes('Completed') || body.includes('Challenge Completed'));
    console.log('Contains "Points":', body.includes('Points'));
    console.log('Contains "Log In":', body.includes('Log In') || body.includes('Sign Up'));
    console.log('Contains "Gaurav" or username:', body.includes('Gaurav') || body.includes('Kapre'));
    
    // Last 1500 chars of body
    console.log('\n--- BOTTOM 1500 CHARACTERS ---');
    console.log(body.slice(-1500));

    await page.screenshot({ path: 'scripts/export_debug.png' });
    await browser.close();
}

checkState().catch(console.error);
