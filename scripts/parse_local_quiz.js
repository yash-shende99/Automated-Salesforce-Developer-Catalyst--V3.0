const fs = require('fs');

const file = process.argv[2] || 'scripts/lex_implementation_data_management_lex_implementation_data_export.html';
const html = fs.readFileSync(file, 'utf8');
const matches = [...html.matchAll(/data-react-props="([^"]+)"/g)];
for (const m of matches) {
    try {
        const raw = m[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&');
        const p = JSON.parse(raw);
        if (p.challenge) {
            console.log('Challenge Content ID:', p.challenge.id || p.challenge.content_id || p.challenge.uuid || p.challenge.content_uid);
            console.log('Full challenge keys:', Object.keys(p.challenge));
            if (p.challenge.questions) {
            console.log('assessment_evaluation_context:', p.challenge.assessment_evaluation_context);
            }
        }
    } catch(e) {}
}
