const { chromium } = require('playwright');
const fs = require('fs');

async function test() {
    const auth = JSON.parse(fs.readFileSync('./scripts/trailhead_auth.json', 'utf8'));
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    await context.addCookies(auth.cookies);
    const page = await context.newPage();

    console.log('Navigating to trailmix...');
    await page.goto('https://trailhead.salesforce.com/users/trjha3/trailmixes/salesforce-developer-catalyst-v-3-0', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(6000);
    
    const progress = await page.evaluate(() => {
        const bodyText = document.body.innerText;
        const match = bodyText.match(/(\d+)%\s*Complete/i) || bodyText.match(/Completed\s*(\d+)\s*of\s*(\d+)/i);
        
        const links = Array.from(document.querySelectorAll('a[href*="/content/learn/"]'));
        const linkData = [];
        for (const l of links) {
            const container = l.closest('li') || l.closest('article') || l.parentElement;
            const text = container ? container.innerText : l.innerText;
            const isCompleted = /completed/i.test(text) || /badge earned/i.test(text) || text.includes('Completed');
            linkData.push({
                href: l.href.split('?')[0],
                title: l.innerText.trim(),
                isCompleted,
                containerSnippet: text.slice(0, 100).replace(/\n/g, ' ')
            });
        }
        return { match: match ? match[0] : null, linkCount: links.length, linkData };
    });

    console.log('Progress header:', progress.match);
    
    const unique = {};
    for (const d of progress.linkData) {
        if (!unique[d.href] && d.title && !d.href.includes('/users/')) {
            unique[d.href] = d;
        }
    }
    
    const items = Object.values(unique);
    console.log('Unique learning items:', items.length);
    const completed = items.filter(i => i.isCompleted);
    const pending = items.filter(i => !i.isCompleted);
    
    console.log('Completed count:', completed.length);
    console.log('Pending count:', pending.length);
    console.log('\n--- PENDING ITEMS ---');
    pending.forEach(p => console.log('-', p.title, p.href));

    console.log('\n--- ALL ITEMS STATUS ---');
    items.forEach((it, idx) => {
        console.log(`[${idx+1}] ${it.isCompleted ? '✓' : '✗'} ${it.title} (${it.href})`);
    });
    
    await browser.close();
}

test().catch(console.error);
