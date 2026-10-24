const { chromium } = require('playwright');
const path = require('path');

async function checkModuleWithBrowser(moduleSlug = 'lex_customization') {
    const AUTH_FILE = path.join(__dirname, 'trailhead_auth.json');
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        storageState: AUTH_FILE,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
    });
    const page = await context.newPage();

    await page.goto(`https://trailhead.salesforce.com/content/learn/modules/${moduleSlug}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(4000);

    const units = await page.evaluate(() => {
        const results = [];
        // Look for unit links or items
        document.querySelectorAll('a[href*="/modules/"]').forEach(a => {
            const href = a.getAttribute('href');
            const text = a.innerText.trim();
            if (href && href.includes(location.pathname) && href !== location.pathname) {
                // Find parent or sibling badge/status
                const parent = a.closest('li') || a.parentElement;
                results.push({
                    title: text,
                    href: href,
                    parentText: parent ? parent.innerText.slice(0, 100) : ''
                });
            }
        });
        return results;
    });

    console.log('Units found on module page:');
    console.log(JSON.stringify(units, null, 2));

    await browser.close();
}

checkModuleWithBrowser().catch(console.error);
