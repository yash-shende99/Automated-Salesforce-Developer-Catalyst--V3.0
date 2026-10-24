const fs = require('fs');

async function main() {
    const url = process.argv[2] || 'https://trailhead.salesforce.com/content/learn/modules/screen-flows/get-started-with-screen-flows';
    const auth = JSON.parse(fs.readFileSync('scripts/trailhead_auth.json', 'utf8'));
    const cookieHeader = (auth.cookies || []).map(c => `${c.name}=${c.value}`).join('; ');
    const res = await fetch(url, { headers: { 'Cookie': cookieHeader } });
    const html = await res.text();
    
    const matches = [...html.matchAll(/data-react-props="([^"]+)"/g)];
    for (const m of matches) {
        try {
            const raw = m[1].replace(/&quot;/g, '"');
            const p = JSON.parse(raw);
            if (p.challenge && p.challenge.questions) {
                console.log('Unit Completed:', p.challenge.completed);
                for (const q of p.challenge.questions) {
                    console.log('\nQuestion object:', JSON.stringify(q, null, 2));
                }
                return;
            }
        } catch(e) {}
    }
    console.log('No quiz questions found in react props.');
}

main().catch(console.error);
