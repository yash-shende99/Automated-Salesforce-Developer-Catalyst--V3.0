const fs = require('fs');

async function auditTrailmix() {
    const auth = JSON.parse(fs.readFileSync('./scripts/trailhead_auth.json', 'utf8'));
    const cookieHeader = auth.cookies.map(c => `${c.name}=${c.value}`).join('; ');
    const url = 'https://trailhead.salesforce.com/users/trjha3/trailmixes/salesforce-developer-catalyst-v-3-0';

    console.log('Fetching Trailmix page for Gaurav...');
    const res = await fetch(url, { headers: { Cookie: cookieHeader, 'User-Agent': 'Mozilla/5.0' } });
    const html = await res.text();

    fs.writeFileSync('./scripts/trailmix_dump.html', html, 'utf8');

    // Find all links to modules and projects
    const linkRegex = /href="(\/content\/learn\/(modules|projects)\/([^"?]+))[^"]*"/g;
    const items = [];
    const seen = new Set();
    let m;
    while ((m = linkRegex.exec(html)) !== null) {
        const fullPath = m[1];
        const type = m[2];
        const slug = m[3];
        if (!seen.has(slug)) {
            seen.add(slug);
            items.push({ slug, type, url: `https://trailhead.salesforce.com${fullPath}` });
        }
    }

    console.log(`Found ${items.length} items in Trailmix.`);

    // Check completion state of each item via its page or react props
    for (const item of items) {
        // Fetch item page
        try {
            const itemRes = await fetch(item.url, { headers: { Cookie: cookieHeader, 'User-Agent': 'Mozilla/5.0' } });
            const itemHtml = await itemRes.text();
            
            // Check completed status
            const isCompleted = itemHtml.includes('"completed":true') || 
                                itemHtml.includes('badge_earned') ||
                                itemHtml.includes('Earned Badge') ||
                                (itemHtml.match(/data-react-props="([^"]+)"/) && itemHtml.includes('"completed":true'));
            
            const titleMatch = itemHtml.match(/<title>([^<]+)<\/title>/);
            const title = titleMatch ? titleMatch[1].replace(' | Salesforce Trailhead', '').trim() : item.slug;
            
            console.log(`[${items.indexOf(item) + 1}/${items.length}] ${item.type}: ${item.slug} -> ${isCompleted ? 'COMPLETED' : 'PENDING'} (${title})`);
        } catch (e) {
            console.log(`Error checking ${item.slug}: ${e.message}`);
        }
    }
}

auditTrailmix().catch(console.error);
