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
    const html = await fetchPage('https://trailhead.salesforce.com/content/learn/projects/automate-business-processes-recruiting-app');
    const matches = [...html.matchAll(/\/content\/learn\/projects\/automate-business-processes-recruiting-app\/([a-zA-Z0-9_\-]+)/g)].map(m => m[1]);
    const units = [...new Set(matches)];
    console.log('Units in automate-business-processes-recruiting-app:', units);

    for (const unit of units) {
        const unitHtml = await fetchPage(`https://trailhead.salesforce.com/content/learn/projects/automate-business-processes-recruiting-app/${unit}`);
        const isQuiz = unitHtml.includes('content_assessments') || unitHtml.includes('data-assessment-id') || unitHtml.includes('quiz');
        console.log(`\n================== UNIT: ${unit} (isQuiz: ${isQuiz}) ==================`);
        const reqMatch = unitHtml.match(/&quot;requirements&quot;:(\[[^\]]+\])/);
        if (reqMatch) {
            console.log(`Requirements:`, reqMatch[1].replace(/&quot;/g, '"'));
        }
    }
})();
