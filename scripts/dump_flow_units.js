const fs = require('fs');
const auth = JSON.parse(fs.readFileSync('scripts/trailhead_auth.json', 'utf8'));
const cookieHeader = auth.cookies.map(c => `${c.name}=${c.value}`).join('; ');

const units = [
    'collect-contact-info-from-your-user',
    'check-for-a-matching-contact-in-your-org',
    'branch-the-flow',
    'create-or-update-a-contact',
    'present-confirmation-screens'
];

async function dumpUnit(slug) {
    const url = `https://trailhead.salesforce.com/content/learn/projects/build-a-simple-flow/${slug}`;
    const res = await fetch(url, { headers: { 'Cookie': cookieHeader, 'User-Agent': 'Mozilla/5.0' } });
    const html = await res.text();
    fs.writeFileSync(`scripts/unit_${slug}.html`, html, 'utf8');
    console.log(`Saved full scripts/unit_${slug}.html`);
}

async function main() {
    for (const u of units) {
        await dumpUnit(u);
    }
}

main().catch(console.error);
