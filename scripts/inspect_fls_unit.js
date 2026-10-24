const fs = require('fs');

async function main() {
    const auth = JSON.parse(fs.readFileSync('./scripts/trailhead_auth.json', 'utf8'));
    const cookieHeader = auth.cookies.map(c => `${c.name}=${c.value}`).join('; ');
    const res = await fetch('https://trailhead.salesforce.com/content/learn/projects/keep-data-secure-in-a-recruiting-app/fls-perm-sets-sharing', {
        headers: { Cookie: cookieHeader, 'User-Agent': 'Mozilla/5.0' }
    });
    const html = await res.text();
    fs.writeFileSync('./scripts/fls_unit.html', html, 'utf8');
    
    const matches = html.match(/"completed":(true|false)/g) || [];
    console.log('Matches for completed:', matches);
    
    // Check if challenge is completed
    const reactMatches = html.match(/data-react-props="([^"]+)"/g) || [];
    for (const m of reactMatches) {
        const decoded = m.replace('data-react-props="', '').slice(0, -1).replace(/&quot;/g, '"').replace(/&amp;/g, '&');
        try {
            const data = JSON.parse(decoded);
            if (data.unit) {
                console.log('Unit status:', data.unit.title, 'is_completed:', data.unit.is_completed, 'completed:', data.unit.completed);
            }
            if (data.project) {
                console.log('Project status:', data.project.title, 'is_completed:', data.project.is_completed);
            }
        } catch (e) {}
    }
}

main().catch(console.error);
