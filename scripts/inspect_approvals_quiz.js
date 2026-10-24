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
    const html = await fetchPage('https://trailhead.salesforce.com/content/learn/modules/business_process_automation/approvals');
    fs.writeFileSync('scripts/quiz_approvals.html', html);
    
    // Find content assessment ID or question data
    const assessmentMatch = html.match(/\/content_assessments\/([a-zA-Z0-9_\-]+)/);
    console.log('Assessment match:', assessmentMatch ? assessmentMatch[1] : 'not found directly');
    
    // Check questions in html
    const qMatches = [...html.matchAll(/data-question-id="([^"]+)"/g)].map(m => m[1]);
    console.log('Questions found:', qMatches);
    
    // Look for JSON assessment data embedded in script tags
    const jsonMatch = html.match(/assessmentJSON\s*=\s*({[\s\S]*?});/) || html.match(/content_assessment:\s*({[\s\S]*?})/);
    if (jsonMatch) {
        console.log('Found assessment JSON!');
    }
})();
