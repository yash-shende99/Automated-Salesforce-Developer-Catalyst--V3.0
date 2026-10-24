const fs = require('fs');
const path = require('path');

const AUTH_FILE = path.join(__dirname, 'trailhead_auth.json');
const auth = JSON.parse(fs.readFileSync(AUTH_FILE, 'utf8'));
const cookieHeader = auth.cookies.map(c => `${c.name}=${c.value}`).join('; ');

async function inspectUnit4() {
    const url = 'https://trailhead.salesforce.com/content/learn/modules/flow-basics/learn-about-flow-variables';
    const res = await fetch(url, { headers: { 'Cookie': cookieHeader, 'User-Agent': 'Mozilla/5.0' } });
    const html = await res.text();
    
    // Find all matches for data-react-props
    const matches = [...html.matchAll(/data-react-props="([^"]+)"/g)];
    for (let i = 0; i < matches.length; i++) {
        const dec = matches[i][1].replace(/&quot;/g, '"').replace(/&amp;/g, '&');
        try {
            const d = JSON.parse(dec);
            if (d.challenge) {
                console.log('CHALLENGE:', JSON.stringify(d.challenge, null, 2));
            }
        } catch(e) {}
    }

    // Also check GET /content_assessments/02a3ec6f-0405-deec-2753-b8038270fca2
    const assessRes = await fetch('https://trailhead.salesforce.com/content_assessments/02a3ec6f-0405-deec-2753-b8038270fca2', {
        headers: { 'Cookie': cookieHeader, 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json' }
    });
    console.log('Assess status:', assessRes.status);
    const assessData = await assessRes.json();
    console.log('Assess data:', JSON.stringify(assessData, null, 2));
}

inspectUnit4().catch(console.error);
