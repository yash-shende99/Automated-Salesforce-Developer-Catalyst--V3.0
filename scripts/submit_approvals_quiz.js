const fs = require('fs');
const path = require('path');

const AUTH_FILE = path.join(__dirname, 'trailhead_auth.json');
const auth = JSON.parse(fs.readFileSync(AUTH_FILE, 'utf8'));
const cookieHeader = auth.cookies.map(c => `${c.name}=${c.value}`).join('; ');

async function run() {
    const pageRes = await fetch('https://trailhead.salesforce.com/content/learn/modules/business_process_automation/approvals', {
        headers: { Cookie: cookieHeader, 'User-Agent': 'Mozilla/5.0' }
    });
    const html = await pageRes.text();
    const csrfMatch = html.match(/name="csrf-token"\s+content="([^"]+)"/);
    const csrf = csrfMatch ? csrfMatch[1] : null;

    const putRes = await fetch('https://trailhead.salesforce.com/content_assessments/0260fdbe-9a87-a992-fb16-86647dbdc738', {
        method: 'PUT',
        headers: {
            Cookie: cookieHeader,
            'User-Agent': 'Mozilla/5.0',
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'X-CSRF-Token': csrf
        },
        body: JSON.stringify({
            answers: {
                '3e009da6-1ff4-4666-b6e1-1e277851dcac': 'eef48c4c-f967-5588-8577-217d959651ef',
                '9e75a7df-5478-49f7-a1ed-1e2a962ac399': 'db8cd53d-22b4-50bb-8343-e73ac725bd46'
            },
            breadcrumbs: {
                trailmix_creator_id: 'trjha3',
                trailmix_slug: 'salesforce-developer-catalyst-v-3-0'
            }
        })
    });

    const res = await putRes.json();
    console.log('Quiz Result:', JSON.stringify(res, null, 2));
}

run().catch(console.error);
