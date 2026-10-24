const fs = require('fs');
const https = require('https');
const authData = JSON.parse(fs.readFileSync('./scripts/trailhead_auth.json', 'utf8'));
const cookies = authData.cookies || [];
const cookieHeader = cookies.map(c => `${c.name}=${c.value}`).join('; ');

async function fetchUnitHtml(slug) {
    return new Promise((resolve) => {
        https.get(`https://trailhead.salesforce.com/content/learn/projects/automate-business-processes-recruiting-app/${slug}`, {
            headers: { Cookie: cookieHeader, 'User-Agent': 'Mozilla/5.0' }
        }, res => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                fs.writeFileSync(`scripts/proj16_${slug}.html`, data);
                resolve(data);
            });
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
        console.log(`\n================================================================`);
        console.log(`UNIT: ${unit}`);
        console.log(`================================================================`);
        const html = await fetchUnitHtml(unit);

        // Find tables
        const tables = [...html.matchAll(/<table[^>]*>([\s\S]*?)<\/table>/gi)].map(m => m[1].replace(/<tr[^>]*>/gi, '\nTR: ').replace(/<[^>]+>/g, ' | ').replace(/\s+/g, ' '));
        if (tables.length > 0) {
            console.log('\n--- Tables ---');
            tables.forEach(t => console.log(t));
        }

        // Find ordered lists (steps)
        const ols = [...html.matchAll(/<ol[^>]*>([\s\S]*?)<\/ol>/gi)].map(m => m[1]);
        for (let i = 0; i < ols.length; i++) {
            const lis = [...ols[i].matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)].map(m => m[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim());
            console.log(`\n--- Step ${i + 1} (${lis.length} items) ---`);
            lis.forEach((li, idx) => {
                console.log(`  ${idx + 1}. ${li}`);
            });
        }
    }
})();
