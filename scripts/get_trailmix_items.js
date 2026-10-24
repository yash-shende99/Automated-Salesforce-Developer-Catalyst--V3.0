const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function main() {
    const browser = await chromium.launch({ headless: true });
    const AUTH_FILE = path.join(__dirname, 'trailhead_auth.json');
    const context = await browser.newContext({
        storageState: AUTH_FILE,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
    });
    const page = await context.newPage();
    const url = 'https://trailhead.salesforce.com/users/trjha3/trailmixes/salesforce-developer-catalyst-v-3-0';
    console.log(`Navigating to ${url}...`);
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(5000);

    const items = await page.evaluate(() => {
        const results = [];
        // Look for links that point to /content/learn/
        const links = document.querySelectorAll('a[href*="/content/learn/"]');
        links.forEach(a => {
            const href = a.getAttribute('href');
            const text = a.innerText.trim();
            if (href && (href.includes('/modules/') || href.includes('/projects/'))) {
                // exclude unit level links if any
                results.push({ text, href });
            }
        });
        return results;
    });

    console.log(`Extracted ${items.length} link elements`);
    
    // Group and deduplicate
    const unique = [];
    const seen = new Set();
    for (const item of items) {
        if (!seen.has(item.href) && item.text) {
            seen.add(item.href);
            unique.push(item);
        }
    }
    
    fs.writeFileSync(path.join(__dirname, 'trailmix_links.json'), JSON.stringify(unique, null, 2));
    console.log(`Saved ${unique.length} unique items to scripts/trailmix_links.json`);
    console.log(unique);
    await browser.close();
}

main().catch(console.error);
