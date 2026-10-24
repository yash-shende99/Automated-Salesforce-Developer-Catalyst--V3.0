const fs = require('fs');
const path = require('path');

const AUTH_FILE = path.join(__dirname, 'trailhead_auth.json');
const auth = JSON.parse(fs.readFileSync(AUTH_FILE, 'utf8'));
const cookieHeader = auth.cookies.map(c => `${c.name}=${c.value}`).join('; ');

async function getQuizOptions(contentId) {
    const res = await fetch(`https://trailhead.salesforce.com/content_assessments/${contentId}`, {
        headers: { 'Cookie': cookieHeader, 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json' }
    });
    const data = await res.json();
    return data.assessment_ui?.questions;
}

async function main() {
    console.log('--- UNIT 2 (02a3ec6f-0405-de7c-32e6-89d17da4464a) ---');
    const u2 = await getQuizOptions('02a3ec6f-0405-de7c-32e6-89d17da4464a');
    console.log(JSON.stringify(u2, null, 2));

    console.log('--- UNIT 3 (0260fdbe-4a6f-acd2-56ac-8242f19855bc) ---');
    const u3 = await getQuizOptions('0260fdbe-4a6f-acd2-56ac-8242f19855bc');
    console.log(JSON.stringify(u3, null, 2));
}

main().catch(console.error);
