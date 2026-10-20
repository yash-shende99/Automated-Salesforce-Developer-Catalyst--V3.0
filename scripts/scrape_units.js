const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function scrapeUnits(projectSlug, units) {
    const browser = await chromium.launch({ headless: true });
    const AUTH_FILE = path.join(__dirname, 'trailhead_auth.json');
    const context = await browser.newContext({
        storageState: AUTH_FILE,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
    });

    for (let i = 0; i < units.length; i++) {
        const u = units[i];
        const page = await context.newPage();
        const url = `https://trailhead.salesforce.com/content/learn/projects/${projectSlug}/${u}`;
        console.log(`Scraping [${i+1}/${units.length}]: ${url}`);
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.waitForTimeout(3000);

        const content = await page.evaluate(() => {
            const article = document.querySelector('article') || document.querySelector('main') || document.body;
            return article.innerText;
        });

        const outPath = path.join(__dirname, `proj18_unit${i+1}_${u}.txt`);
        fs.writeFileSync(outPath, content, 'utf8');
        console.log(`Saved instructions to ${outPath} (${content.length} chars)`);
        await page.close();
    }

    await browser.close();
    console.log('All units scraped!');
}

const units = ['quickstart-app-builder1', 'quickstart-app-builder2', 'quickstart-app-builder3'];
scrapeUnits('quickstart-app-builder', units).catch(console.error);
