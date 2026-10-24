const fs = require('fs');

async function dumpRaw() {
    const authData = JSON.parse(fs.readFileSync('scripts/trailhead_auth.json', 'utf8'));
    const cookies = authData.cookies.map(c => `${c.name}=${c.value}`).join('; ');
    const res = await fetch('https://trailhead.salesforce.com/content/learn/modules/lex_customization/lex_customization_compact_layouts', {
        headers: { 'User-Agent': 'Mozilla/5.0', 'Cookie': cookies }
    });
    const html = await res.text();
    const matches = html.match(/check_challenge[^"]+/g);
    console.log('Check challenge matches:', matches);
    
    // Look for challenge title or requirement in the HTML
    const challengeDiv = html.match(/<div[^>]*class="[^"]*challenge[^"]*"[^>]*>[\s\S]*?<\/div>/gi);
    console.log('Challenge div count:', challengeDiv ? challengeDiv.length : 0);
    if (challengeDiv) {
        console.log(challengeDiv[0].slice(0, 500));
    }

    // Save full HTML to scratch file for inspection
    fs.writeFileSync('scripts/scratch/compact_layouts.html', html, 'utf8');
    console.log('Saved scripts/scratch/compact_layouts.html');
}

dumpRaw().catch(console.error);
