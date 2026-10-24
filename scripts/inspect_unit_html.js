const fs = require('fs');

async function inspectUnitHtml() {
    const authData = JSON.parse(fs.readFileSync('scripts/trailhead_auth.json', 'utf8'));
    const cookies = authData.cookies.map(c => `${c.name}=${c.value}`).join('; ');
    const uUrl = 'https://trailhead.salesforce.com/content/learn/modules/lex_customization/lex_customization_list';
    const res = await fetch(uUrl, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
            'Cookie': cookies
        }
    });
    const html = await res.text();
    // Look for status badges or challenge footer
    const matches = html.match(/class="[^"]*(badge|status|complete|points|challenge)[^"]*"/gi) || [];
    console.log('Matches:', matches.slice(0, 20));
    // Look for state json
    const jsonMatches = html.match(/data-initial-state="([^"]+)"/) || html.match(/window\.__PRELOADED_STATE__\s*=\s*({[\s\S]*?});/);
    if (jsonMatches) {
        console.log('Found state match');
    } else {
        console.log('Checking for points earned or check challenge text:');
        const pointsMatch = html.match(/\d+\s*points/gi);
        console.log('Points matches:', pointsMatch);
    }
}

inspectUnitHtml().catch(console.error);
