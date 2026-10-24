const fs = require('fs');

async function main() {
    const auth = JSON.parse(fs.readFileSync('./scripts/trailhead_auth.json', 'utf8'));
    const cookieHeader = (auth.cookies || []).map(c => `${c.name}=${c.value}`).join('; ');
    const res = await fetch('https://trailhead.salesforce.com/users/profiles/orgs', {
        headers: { 'Cookie': cookieHeader }
    });
    const html = await res.text();
    fs.writeFileSync('./scratch/orgs_page.html', html, 'utf8');
    
    // Look for react props or org list
    const m = html.match(/data-react-props="([^"]+)"/g) || [];
    console.log(`Found ${m.length} data-react-props matches.`);
    for (const match of m) {
        const raw = match.replace('data-react-props="', '').slice(0, -1).replace(/&quot;/g, '"');
        try {
            const data = JSON.parse(raw);
            if (data.orgs || data.authorized_accounts || data.user_orgs) {
                console.log('Org data found:', JSON.stringify(data, null, 2));
            }
        } catch (e) {}
    }
}

main().catch(console.error);
