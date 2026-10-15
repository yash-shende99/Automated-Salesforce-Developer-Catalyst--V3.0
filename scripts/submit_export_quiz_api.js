const fs = require('fs');
const path = require('path');

const AUTH_FILE = path.join(__dirname, 'trailhead_auth.json');
const auth = JSON.parse(fs.readFileSync(AUTH_FILE, 'utf8'));
const cookieHeader = auth.cookies.map(c => `${c.name}=${c.value}`).join('; ');

async function getCsrfToken() {
    // We can fetch CSRF from home or any fast endpoint
    const res = await fetch('https://trailhead.salesforce.com/today', {
        headers: { 'Cookie': cookieHeader, 'User-Agent': 'Mozilla/5.0' }
    });
    const html = await res.text();
    const match = html.match(/name="csrf-token"\s+content="([^"]+)"/) || html.match(/content="([^"]+)"\s+name="csrf-token"/);
    return match ? match[1] : null;
}

async function main() {
    console.log('=== Submitting Export Data Quiz via Direct API ===');
    const contentId = '025ec72e-b5f0-7610-fbee-64f16244dc45';
    
    console.log('Fetching CSRF token from Trailhead...');
    const csrf = await getCsrfToken();
    console.log('CSRF Token:', csrf ? csrf.slice(0, 15) + '...' : 'Not found');

    const payload = {
        answers: {
            '23469a69-42f2-410a-92f2-a47e96826275': 'ddd9c543-3f18-5a0b-b1e8-f2901769b0c2',
            'd49b75ba-24be-4865-a955-6ced78e0b18f': 'bdc263f6-ea55-5c77-9571-38a4d72dff67',
            'a71923a6-bda6-4273-b98d-f06b71aac0c0': '2cd2b7cc-a73c-5448-aac2-c2d8df76b200'
        },
        breadcrumbs: {
            trailmix_creator_id: 'trjha3',
            trailmix_slug: 'salesforce-developer-catalyst-v-3-0'
        }
    };

    console.log('Submitting PUT request to /content_assessments/' + contentId + '...');
    const putRes = await fetch(`https://trailhead.salesforce.com/content_assessments/${contentId}`, {
        method: 'PUT',
        headers: {
            'Cookie': cookieHeader,
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-CSRF-Token': csrf
        },
        body: JSON.stringify(payload)
    });

    console.log('Status:', putRes.status);
    const result = await putRes.json();
    console.log('Result:', JSON.stringify(result, null, 2));
}

main().catch(console.error);
