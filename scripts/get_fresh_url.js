const fs = require('fs');

async function getUrl() {
    const auth = JSON.parse(fs.readFileSync('./scripts/trailhead_auth.json', 'utf8'));
    const cookies = auth.cookies || [];
    const cookieHeader = cookies.map(c => `${c.name}=${c.value}`).join('; ');

    const res = await fetch('https://trailhead.salesforce.com/launch_org/23983359', {
        headers: { 'Cookie': cookieHeader, 'User-Agent': 'Mozilla/5.0' },
        redirect: 'manual'
    });
    console.log('FRONTDOOR_URL=' + res.headers.get('location'));
}
getUrl();
