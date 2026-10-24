const fs = require('fs');
const path = require('path');

const AUTH_FILE = path.join(__dirname, 'trailhead_auth.json');
const auth = JSON.parse(fs.readFileSync(AUTH_FILE, 'utf8'));
const cookieHeader = auth.cookies.map(c => `${c.name}=${c.value}`).join('; ');

async function inspectUnits(moduleSlug) {
    const units = [
        'go-with-the-flow-th',
        'meet-flow-builder',
        'learn-about-flow-variables'
    ];

    for (const unit of units) {
        const url = `https://trailhead.salesforce.com/content/learn/modules/${moduleSlug}/${unit}`;
        const res = await fetch(url, { headers: { 'Cookie': cookieHeader, 'User-Agent': 'Mozilla/5.0' } });
        const html = await res.text();
        const match = html.match(/data-react-props="([^"]+)"/g);
        let challenge = null;
        if (match) {
            for (const m of match) {
                const dec = m.replace(/&quot;/g, '"').replace(/&amp;/g, '&');
                try {
                    const d = JSON.parse(dec.replace(/^data-react-props="/, '').replace(/"$/, ''));
                    if (d.challenge) {
                        challenge = d.challenge;
                        break;
                    }
                } catch(e) {}
            }
        }
        console.log(`\n================== UNIT: ${unit} ==================`);
        console.log('Content UID:', challenge?.content_uid);
        console.log('Completed:', challenge?.completed);
        console.log('Type:', challenge?.type);
        console.log('Questions:', JSON.stringify(challenge?.assessment_evaluation_context?.questions || challenge?.questions, null, 2));
    }
}

inspectUnits('flow-basics').catch(console.error);
