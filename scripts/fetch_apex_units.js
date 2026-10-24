const fs = require('fs');
const path = require('path');

const AUTH_FILE = path.join(__dirname, 'trailhead_auth.json');
const auth = JSON.parse(fs.readFileSync(AUTH_FILE, 'utf8'));
const cookieHeader = auth.cookies.map(c => `${c.name}=${c.value}`).join('; ');

const units = [
    'get-started-with-apex',
    'practice-in-the-developer-console',
    'use-collections',
    'control-data-flow',
    'use-loops'
];

async function main() {
    console.log('=== FETCHING APEX BASICS UNITS VIA FETCH ===\n');

    const results = {};
    for (const u of units) {
        const url = `https://trailhead.salesforce.com/content/learn/modules/apex-basics-for-admins/${u}`;
        console.log(`Fetching ${u}...`);
        const res = await fetch(url, {
            headers: {
                'Cookie': cookieHeader,
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
            }
        });
        const html = await res.text();
        const match = html.match(/data-react-class="challenge\/Challenge"[^>]*data-react-props="([^"]*)"/);
        if (match) {
            const rawProps = match[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&');
            const props = JSON.parse(rawProps);
            results[u] = {
                type: props.challenge?.type,
                title: props.challenge?.title,
                description: props.challenge?.description,
                requirements: props.challenge?.requirements
            };
            console.log(`[${u}] Title: ${props.challenge?.title}`);
            console.log(`Requirements:`, props.challenge?.requirements);
        } else {
            console.log(`[${u}] Challenge props not found in HTML`);
        }
    }

    fs.writeFileSync('scripts/apex_basics_requirements.json', JSON.stringify(results, null, 2));
    console.log('\nSaved scripts/apex_basics_requirements.json');
}

main().catch(console.error);
