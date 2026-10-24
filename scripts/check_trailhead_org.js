const fs = require('fs');

async function check() {
    const auth = JSON.parse(fs.readFileSync('./scripts/trailhead_auth.json', 'utf8'));
    const cookieHeader = auth.cookies.map(c => `${c.name}=${c.value}`).join('; ');
    const res = await fetch('https://trailhead.salesforce.com/content/learn/projects/customize-the-ui-for-a-recruiting-app/create-object-specific-quick-action', {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
            'Cookie': cookieHeader
        }
    });
    const html = await res.text();
    fs.writeFileSync('./scratch/page_dump.html', html, 'utf8');
    
    // Look for org info in HTML
    const orgIdMatches = [...html.matchAll(/00D[a-zA-Z0-9]{12,15}/g)].map(m => m[0]);
    console.log('Org IDs found in page:', [...new Set(orgIdMatches)]);
    
    // Look for trailhead playground / developer edition info
    const handsOnMatches = html.match(/data-hands-on-org-[^=]+="[^"]+"/g);
    console.log('Hands-on org attributes:', handsOnMatches);
}

check().catch(console.error);
