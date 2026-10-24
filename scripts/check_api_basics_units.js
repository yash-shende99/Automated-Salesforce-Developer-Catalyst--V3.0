const https = require('https');
const fs = require('fs');

const auth = JSON.parse(fs.readFileSync('scripts/trailhead_auth.json', 'utf8'));
const cookieHeader = auth.cookies.map(c => `${c.name}=${c.value}`).join('; ');

function fetchUrl(url) {
    return new Promise((resolve, reject) => {
        https.get(url, { headers: { 'Cookie': cookieHeader, 'User-Agent': 'Mozilla/5.0' } }, res => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
        }).on('error', reject);
    });
}

const units = ['api_basics_overview', 'api_basics_rest', 'api_basics_bulk', 'api_basics_streaming'];

async function main() {
    console.log('=== Checking api_basics Units ===');
    for (const u of units) {
        const url = `https://trailhead.salesforce.com/content/learn/modules/api_basics/${u}`;
        const html = await fetchUrl(url);
        const matches = [...html.matchAll(/data-react-props="([^"]+)"/g)];
        for (const m of matches) {
            try {
                const raw = m[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&');
                const p = JSON.parse(raw);
                if (p.challenge) {
                    console.log(`- ${u}: Content ID: ${p.challenge.content_uid}, Type: ${p.challenge.type}, Completed: ${p.challenge.completed}`);
                    break;
                }
            } catch(e) {}
        }
    }
}

main().catch(console.error);
