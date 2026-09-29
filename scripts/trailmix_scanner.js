const { chromium } = require('playwright');

async function scanTrailmix(url) {
    console.log(`[Navigator] Launching browser to scan Trailmix: ${url}`);
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    try {
        await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 });
        
        // Wait for trailmix content to load
        await page.waitForSelector('article, [data-testid="trailmix-item"], .trailmix-body, a[href*="/content/learn/"]', { timeout: 15000 });

        // Extract module/project links
        const items = await page.evaluate(() => {
            const results = [];
            // Find all anchor links that point to modules or projects
            const links = Array.from(document.querySelectorAll('a[href*="/content/learn/modules/"], a[href*="/content/learn/projects/"]'));
            
            const seen = new Set();
            for (const link of links) {
                const href = link.href.split('?')[0];
                if (seen.has(href)) continue;
                seen.add(href);

                // Find title and completion state in the parent container
                let container = link.closest('li') || link.closest('article') || link.parentElement;
                const text = container ? container.innerText : link.innerText;
                const isCompleted = text.includes('Completed') || text.includes('100%');
                const title = link.innerText.trim() || link.getAttribute('aria-label') || href;

                results.push({
                    title,
                    url: href,
                    isCompleted,
                    type: href.includes('/projects/') ? 'Project' : 'Module'
                });
            }
            return results;
        });

        console.log(`[Navigator] Found ${items.length} items in Trailmix.`);
        const incomplete = items.filter(i => !i.isCompleted);
        console.log(`[Navigator] Incomplete items: ${incomplete.length}`);
        
        return { total: items.length, items, incomplete };
    } catch (err) {
        console.error(`[Navigator Error]: ${err.message}`);
        return { error: err.message };
    } finally {
        await browser.close();
    }
}

if (require.main === module) {
    const url = process.argv[2] || 'https://trailhead.salesforce.com/users/trjha3/trailmixes/salesforce-developer-catalyst-v-3-0';
    scanTrailmix(url).then(res => {
        console.log(JSON.stringify(res, null, 2));
    });
}

module.exports = { scanTrailmix };
