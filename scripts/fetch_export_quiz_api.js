const fs = require('fs');
const path = require('path');

const AUTH_FILE = path.join(__dirname, 'trailhead_auth.json');
const auth = JSON.parse(fs.readFileSync(AUTH_FILE, 'utf8'));
const cookieHeader = auth.cookies.map(c => `${c.name}=${c.value}`).join('; ');

async function main() {
    const contentId = '025ec72e-b5f0-7610-fbee-64f16244dc45';
    console.log(`Fetching GET /content_assessments/${contentId}...`);
    const res = await fetch(`https://trailhead.salesforce.com/content_assessments/${contentId}`, {
        headers: {
            'Cookie': cookieHeader,
            'User-Agent': 'Mozilla/5.0',
            'Accept': 'application/json'
        }
    });

    console.log('Status:', res.status);
    const data = await res.json();
    console.log('Data:', JSON.stringify(data, null, 2));
}

main().catch(console.error);
