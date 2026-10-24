const https = require('https');
const fs = require('fs');

const auth = JSON.parse(fs.readFileSync('scripts/trailhead_auth.json'));
const cookies = auth.cookies.map(c => c.name + '=' + c.value).join('; ');

https.get('https://trailhead.salesforce.com/content/learn/modules/soql-for-admins/create-relationship-queries-with-custom-objects', {
    headers: { Cookie: cookies, 'User-Agent': 'Mozilla/5.0' }
}, res => {
    let d = '';
    res.on('data', c => d += c);
    res.on('end', () => {
        const pkgMatches = d.match(/04t[a-zA-Z0-9]{12,15}/g);
        console.log('Package IDs:', pkgMatches);
        const textSnippets = d.match(/DreamHouse[^<]{0,200}/gi);
        console.log('Snippets:', textSnippets ? textSnippets.slice(0, 10) : 'none');
    });
});
