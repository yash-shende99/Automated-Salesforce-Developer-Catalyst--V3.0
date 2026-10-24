const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function inspectItem(targetUrl) {
    const browser = await chromium.launch({ headless: true });
    const AUTH_FILE = path.join(__dirname, 'trailhead_auth.json');
    const context = await browser.newContext({
        storageState: AUTH_FILE,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
    });
    const page = await context.newPage();
    console.log(`Inspecting: ${targetUrl}`);
    await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(4000);

    const data = await page.evaluate(() => {
        const units = [];
        // Match unit links inside this module/project
        const links = document.querySelectorAll('a[href*="/content/learn/"]');
        links.forEach(a => {
            const href = a.getAttribute('href');
            const text = a.innerText.trim();
            // Look for unit links (contain more path segments)
            if (href && (href.includes('/modules/') || href.includes('/projects/')) && text && !units.some(u => u.href === href)) {
                const parts = href.split('/').filter(Boolean);
                // e.g. ["content", "learn", "projects", "quickstart-app-builder", "unit-slug"]
                if (parts.length >= 5) {
                    units.push({
                        title: text.split('\n')[0],
                        href: href.startsWith('http') ? href : `https://trailhead.salesforce.com${href}`,
                        slug: parts[parts.length - 1].split('?')[0],
                        parentSlug: parts[parts.length - 2]
                    });
                }
            }
        });
        return {
            pageTitle: document.title,
            units
        };
    });

    console.log('Result:', JSON.stringify(data, null, 2));
    await browser.close();
    return data;
}

const target = process.argv[2] || 'https://trailhead.salesforce.com/content/learn/projects/quickstart-app-builder';
inspectItem(target).catch(console.error);
