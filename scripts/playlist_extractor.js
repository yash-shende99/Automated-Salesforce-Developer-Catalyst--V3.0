const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function extractPlaylist() {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ storageState: path.join(__dirname, 'trailhead_auth.json') });
    const page = await context.newPage();
    await page.goto('https://trailhead.salesforce.com/users/trjha3/trailmixes/salesforce-developer-catalyst-v-3-0', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(5000);

    const data = await page.evaluate(() => {
        const rows = [];
        const links = Array.from(document.querySelectorAll('a[href*="/content/learn/"]'));
        for (const l of links) {
            const href = l.href;
            const text = l.innerText.trim();
            if (text && (href.includes('/modules/') || href.includes('/projects/'))) {
                rows.push({
                    title: text.split('\n')[0],
                    url: href,
                    type: href.includes('/modules/') ? 'Module' : 'Project',
                    slug: href.split('/').filter(Boolean).pop()
                });
            }
        }
        return rows;
    });

    await browser.close();
    // Deduplicate by URL
    const unique = [];
    const seen = new Set();
    for (const d of data) {
        if (!seen.has(d.url)) {
            seen.add(d.url);
            unique.push(d);
        }
    }
    fs.writeFileSync(path.join(__dirname, 'playlist_manifest.json'), JSON.stringify(unique, null, 2), 'utf8');
    console.log(`Saved ${unique.length} items to playlist_manifest.json`);
    return unique;
}

if (require.main === module) {
    extractPlaylist().catch(console.error);
}

module.exports = { extractPlaylist };
