const fs = require('fs');
const auth = JSON.parse(fs.readFileSync('scripts/trailhead_auth.json', 'utf8'));
const cookieHeader = auth.cookies.map(c => c.name + '=' + c.value).join('; ');

const units = [
    'collect-contact-info-from-your-user',
    'check-for-a-matching-contact-in-your-org',
    'branch-the-flow',
    'create-or-update-a-contact',
    'present-confirmation-screens'
];

async function inspectAllUnits() {
    for (const unit of units) {
        const url = `https://trailhead.salesforce.com/content/learn/projects/build-a-simple-flow/${unit}`;
        const res = await fetch(url, { headers: { 'Cookie': cookieHeader, 'User-Agent': 'Mozilla/5.0' } });
        const html = await res.text();
        const matches = [...html.matchAll(/data-react-props="([^"]+)"/g)];
        let challenge = null;
        for (const m of matches) {
            const dec = m[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&');
            try {
                const d = JSON.parse(dec);
                if (d.challenge) {
                    challenge = d.challenge;
                    break;
                }
            } catch(e) {}
        }
        // Find challenge section (usually near the bottom)
        const challengeSectionMatch = html.match(/<div[^>]*class="[^"]*challenge[^"]*"[^>]*>([\s\S]*?)<\/div>/i) 
            || html.match(/<section[^>]*class="[^"]*challenge[^"]*"[^>]*>([\s\S]*?)<\/section>/i)
            || html.match(/class="tds-challenge[\s\S]*?<\/article>/i);
        
        // Find all headings and instructions
        const h2Matches = [...html.matchAll(/<h2[^>]*>([^<]+)<\/h2>/g)].map(m => m[1]);
        const h3Matches = [...html.matchAll(/<h3[^>]*>([^<]+)<\/h3>/g)].map(m => m[1]);
        
        console.log(`\n================== UNIT: ${unit} ==================`);
        console.log('H2s:', h2Matches);
        console.log('H3s:', h3Matches);

        // Find instruction tables or lists
        const lists = [...html.matchAll(/<(?:ul|ol)[^>]*>([\s\S]*?)<\/(?:ul|ol)>/g)].map(m => m[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim());
        console.log('Key lists:', lists.filter(l => l.includes('Flow') || l.includes('Contact') || l.includes('Screen') || l.includes('Label') || l.includes('API Name')).slice(0, 5));
    }
}

inspectAllUnits().catch(console.error);
