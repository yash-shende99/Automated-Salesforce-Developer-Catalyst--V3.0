const fs = require('fs');

async function getChallengeFast(unitUrl) {
    const authData = JSON.parse(fs.readFileSync('scripts/trailhead_auth.json', 'utf8'));
    const cookies = authData.cookies.map(c => `${c.name}=${c.value}`).join('; ');
    
    console.log(`[FastFetcher] Fetching: ${unitUrl}`);
    const res = await fetch(unitUrl, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
            'Cookie': cookies
        }
    });

    const html = await res.text();
    // Strip HTML tags roughly to extract text
    const cleanText = html.replace(/<script[\s\S]*?<\/script>/gi, '')
                          .replace(/<style[\s\S]*?<\/style>/gi, '')
                          .replace(/<[^>]+>/g, '\n')
                          .replace(/&quot;/g, '"')
                          .replace(/&#39;/g, "'")
                          .replace(/&amp;/g, '&')
                          .replace(/\n\s*\n/g, '\n');

    const lines = cleanText.split('\n').map(l => l.trim()).filter(Boolean);
    const hocIdx = lines.findIndex(l => l.includes('Hands-on Challenge') || l.includes('YOUR CHALLENGE') || l.includes('Check Challenge to Earn'));
    if (hocIdx !== -1) {
        console.log('--- CHALLENGE EXTRACTED ---');
        console.log(lines.slice(Math.max(0, hocIdx - 2), hocIdx + 40).join('\n'));
    } else {
        console.log('--- LAST 40 LINES ---');
        console.log(lines.slice(-40).join('\n'));
    }
}

const targetUrl = process.argv[2] || 'https://trailhead.salesforce.com/content/learn/modules/lex_customization/lex_customization_compact_layouts';
getChallengeFast(targetUrl).catch(console.error);
