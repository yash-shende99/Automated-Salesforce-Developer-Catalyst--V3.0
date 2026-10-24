const fs = require('fs');
const html = fs.readFileSync('scripts/quiz_approvals.html', 'utf8');
const m = html.match(/data-react-class="challenge\/Challenge" data-react-props="([^"]+)"/);
if (m) {
    const json = JSON.parse(m[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&'));
    console.log(JSON.stringify(json.challenge, null, 2));
} else {
    console.log('Not found');
}
