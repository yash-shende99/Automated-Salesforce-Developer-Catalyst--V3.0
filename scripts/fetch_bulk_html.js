const fs = require('fs');
const https = require('https');

const auth = JSON.parse(fs.readFileSync('./scripts/trailhead_auth.json', 'utf8'));
const cookieHeader = auth.cookies.map(c => c.name + '=' + c.value).join('; ');

const req = https.request('https://trailhead.salesforce.com/content/learn/modules/api_basics/api_basics_bulk', {
    headers: {
        'Cookie': cookieHeader,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
    }
}, res => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        fs.writeFileSync('scripts/bulk_html.html', data);
        const idx = data.indexOf('bulkv2hocdata');
        if (idx !== -1) {
            console.log('Snippet around bulkv2hocdata:\n', data.slice(idx - 150, idx + 250));
        } else {
            console.log('bulkv2hocdata not found in raw html');
        }
    });
});
req.end();
