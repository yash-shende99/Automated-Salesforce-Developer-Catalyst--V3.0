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
    // 1. Fetch module page
    const html = await fetchPage('https://trailhead.salesforce.com/content/learn/modules/business_process_automation');
    const matches = [...html.matchAll(/\/content\/learn\/modules\/business_process_automation\/([a-zA-Z0-9_\-]+)/g)].map(m => m[1]);
    const units = [...new Set(matches)];
    console.log('Units in business_process_automation:', units);

    for (const unit of units) {
        const unitHtml = await fetchPage(`https://trailhead.salesforce.com/content/learn/modules/business_process_automation/${unit}`);
        const isQuiz = unitHtml.includes('content_assessments') || unitHtml.includes('data-assessment-id') || unitHtml.includes('quiz');
        const hasChallenge = unitHtml.includes('check_challenge');
        console.log(`Unit: ${unit} | isQuiz: ${isQuiz} | hasChallenge: ${hasChallenge}`);
        
        // Extract challenge/quiz info
        const reqMatch = unitHtml.match(/&quot;requirements&quot;:(\[[^\]]+\])/);
        if (reqMatch) {
            console.log(`  Requirements:`, reqMatch[1].replace(/&quot;/g, '"'));
        }
    }
})();
