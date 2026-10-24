const fs = require('fs');
const https = require('https');
const authData = JSON.parse(fs.readFileSync('./scripts/trailhead_auth.json', 'utf8'));
const cookies = authData.cookies || [];
const cookieHeader = cookies.map(c => `${c.name}=${c.value}`).join('; ');

async function fetchPage(url) {
    return new Promise((resolve) => {
        https.get(url, { headers: { Cookie: cookieHeader, 'User-Agent': 'Mozilla/5.0' } }, res => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
        });
    });
}

(async () => {
    const units = [
        'build-process-interview-records',
        'groundwork-approval-process',
        'create-approval-process-rec-app',
        'process-submitting-positions-approval',
        'candidate-rating-flow'
    ];

    for (const unit of units) {
        const html = await fetchPage(`https://trailhead.salesforce.com/content/learn/projects/automate-business-processes-recruiting-app/${unit}`);
        const m = html.match(/data-react-class="challenge\/Challenge" data-react-props="([^"]+)"/);
        console.log(`\n================== ${unit} ==================`);
        if (m) {
            const dec = m[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&');
            const data = JSON.parse(dec);
            console.log('Title:', data.challenge?.title);
            console.log('Requirements:', data.challenge?.requirements);
            console.log('Description:', data.challenge?.description?.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim());
        } else {
            console.log('Challenge container not found in data-react-props');
        }
    }
})();
