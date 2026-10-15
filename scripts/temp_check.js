const fs = require('fs');
const auth = JSON.parse(fs.readFileSync('scripts/trailhead_auth.json', 'utf8'));
const cookieHeader = auth.cookies.map(c => `${c.name}=${c.value}`).join('; ');

const units = [
    'lightning_app_builder_homepage',
    'lightning_app_builder_recordpage',
    'get-started-with-dynamic-forms-lab',
    'add-visibility-rules-for-dynamic-pages-lab',
    'lightning_app_builder_apphome',
    'lightning_app_builder_custom_comps'
];

async function inspectUnits() {
    for (const unit of units) {
        const url = `https://trailhead.salesforce.com/content/learn/modules/lightning_app_builder/${unit}`;
        const res = await fetch(url, { headers: { 'Cookie': cookieHeader, 'User-Agent': 'Mozilla/5.0' } });
        const html = await res.text();
        const matches = [...html.matchAll(/data-react-props="([^"]+)"/g)];
        let challenge = null;
        for (const m of matches) {
            const dec = m[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&');
            try {
                const d = JSON.parse(dec);
                if (d.challenge) {
                    challenge = d.challenge;
                    break;
                }
            } catch(e) {}
        }
        console.log(`\n================== UNIT: ${unit} ==================`);
        console.log('Title:', challenge?.title);
        console.log('Requirements:', JSON.stringify(challenge?.assessment_evaluation_context?.requirements || challenge?.requirements, null, 2));
    }
}

inspectUnits().catch(console.error);
