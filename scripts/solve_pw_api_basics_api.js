const https = require('https');
const fs = require('fs');
const path = require('path');
const { solveQuizDirect } = require('./direct_quiz_solver');

const AUTH_FILE = path.join(__dirname, 'trailhead_auth.json');
const auth = JSON.parse(fs.readFileSync(AUTH_FILE, 'utf8'));
const cookieHeader = auth.cookies.map(c => `${c.name}=${c.value}`).join('; ');

function fetchUrl(url) {
    return new Promise((resolve, reject) => {
        https.get(url, { headers: { 'Cookie': cookieHeader, 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, res => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
        }).on('error', reject);
    });
}

const UNITS = [
    {
        unit: 'make-apis-for-you-and-me',
        answers: [
            'User interface',
            'A and C'
        ]
    },
    {
        unit: 'learn-the-benefits-of-apis',
        answers: [
            'GET, POST, PUT, DELETE',
            "A way for applications to retrieve data without having to directly engage with the source system's logic."
        ]
    },
    {
        unit: 'put-the-web-in-web-api',
        answers: [
            'False',
            'A type of API that sends data to the consuming application as soon as that data is updated or becomes available.'
        ]
    }
];

async function main() {
    console.log('=== SOLVING MODULE: API Basics (pw-api-basics) ===');
    for (const u of UNITS) {
        const url = `https://trailhead.salesforce.com/content/learn/modules/pw-api-basics/${u.unit}`;
        console.log(`\nFetching ${url}...`);
        const html = await fetchUrl(url);

        const matches = [...html.matchAll(/data-react-props="([^"]+)"/g)];
        let contentId = null;
        let isCompleted = false;

        for (const m of matches) {
            try {
                const raw = m[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&');
                const p = JSON.parse(raw);
                if (p.challenge) {
                    contentId = p.challenge.content_uid;
                    isCompleted = p.challenge.completed;
                    break;
                }
            } catch(e) {}
        }

        console.log(`Unit: ${u.unit}, Content ID: ${contentId}, Completed: ${isCompleted}`);
        if (isCompleted) {
            console.log('Already completed! Skipping.');
            continue;
        }

        if (contentId) {
            await solveQuizDirect(contentId, u.answers);
            await new Promise(r => setTimeout(r, 6000));
        }
    }
    console.log('\n=== API BASICS COMPLETE ===');
}

main().catch(console.error);
