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
    const url = 'https://trailhead.salesforce.com/content/learn/modules/lex_implementation_data_management/lex_implementation_data_import';
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(5000);

    const data = await page.evaluate(() => {
        const links = [];
        document.querySelectorAll('a').forEach(a => {
            const href = a.getAttribute('href') || '';
            const text = a.innerText.trim();
            if (href.includes('.csv') || text.includes('CSV') || text.includes('Download') || href.includes('salesforce') && href.includes('file')) {
                links.push({ text, href });
            }
        });
        return links;
    });

    console.log('Links found:', JSON.stringify(data, null, 2));

    // Also download the file if found
    if (data.length > 0 && data[0].href) {
        let csvUrl = data[0].href;
        if (!csvUrl.startsWith('http')) csvUrl = 'https://trailhead.salesforce.com' + csvUrl;
        console.log('Fetching CSV from:', csvUrl);
        const res = await page.request.get(csvUrl);
        const text = await res.text();
        fs.writeFileSync('scripts/contacts_import.csv', text);
        console.log('Saved CSV! Content preview:\n', text.slice(0, 500));
    }

    await browser.close();
}

main().catch(console.error);
