const fs = require('fs');

async function main() {
    const auth = JSON.parse(fs.readFileSync('./scripts/trailhead_auth.json', 'utf8'));
    const cookieHeader = (auth.cookies || []).map(c => `${c.name}=${c.value}`).join('; ');
    const targetUrl = process.argv[2] || 'https://trailhead.salesforce.com/content/learn/projects/customize-the-ui-for-a-recruiting-app/create-object-specific-quick-action';
    const res = await fetch(targetUrl, {
        headers: { 'Cookie': cookieHeader }
    });
    const html = await res.text();
    const allProps = [...html.matchAll(/data-react-props="([^"]+)"/g)];
    for (const match of allProps) {
        const raw = match[1].replace(/&quot;/g, '"');
        try {
            const p = JSON.parse(raw);
            if (p.challenge) {
                console.log('Found challenge props!');
                console.log('challenge keys:', Object.keys(p.challenge));
                if (p.challenge.assessment_evaluation_context) {
                    console.log('evaluation context:', JSON.stringify(p.challenge.assessment_evaluation_context, null, 2));
                }
            }
        } catch (e) {}
    }
}

main().catch(console.error);
