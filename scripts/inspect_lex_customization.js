const fs = require('fs');
const path = require('path');

async function inspectModule(moduleSlug = process.argv[2] || 'lex_customization') {
    const authData = JSON.parse(fs.readFileSync('scripts/trailhead_auth.json', 'utf8'));
    const cookies = authData.cookies.map(c => `${c.name}=${c.value}`).join('; ');
    const url = `https://trailhead.salesforce.com/content/learn/modules/${moduleSlug}`;
    
    const res = await fetch(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
            'Cookie': cookies
        }
    });
    const html = await res.text();
    // find units
    const unitMatches = [...html.matchAll(new RegExp(`/modules/${moduleSlug}/([^"\\s?#/]+)`, 'g'))].map(m => m[1]);
    console.log(`Units for ${moduleSlug}:`, [...new Set(unitMatches)]);
}

inspectModule().catch(console.error);
