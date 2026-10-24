const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function main() {
    const browser = await chromium.launch({ headless: true });
    const AUTH_FILE = path.join(__dirname, 'trailhead_auth.json');
    const context = await browser.newContext({
        storageState: AUTH_FILE,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
    });

    const page = await context.newPage();
    const url = 'https://trailhead.salesforce.com/content/learn/modules/lex_implementation_data_management/lex_implementation_data_export';
    console.log(`Navigating to ${url}...`);
    await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
    
    // Scroll to bottom
    console.log('Scrolling down...');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(4000);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(4000);

    const data = await page.evaluate(() => {
        // Find inputs or questions
        const radios = Array.from(document.querySelectorAll('input[type="radio"]')).map(r => ({
            id: r.id,
            name: r.name,
            value: r.value,
            checked: r.checked,
            parentText: r.parentElement ? r.parentElement.innerText.trim() : ''
        }));

        const buttons = Array.from(document.querySelectorAll('button, input[type="submit"]')).map(b => b.innerText || b.value).filter(t => t && (t.includes('Check') || t.includes('Submit') || t.includes('Points') || t.includes('Quiz')));

        return {
            radiosCount: radios.length,
            radios,
            buttons,
            bottomText: document.body.innerText.slice(-2500)
        };
    });

    console.log('Data:', JSON.stringify(data, null, 2));
    await page.screenshot({ path: 'scripts/export_bottom.png' });
    await browser.close();
}

main().catch(console.error);
