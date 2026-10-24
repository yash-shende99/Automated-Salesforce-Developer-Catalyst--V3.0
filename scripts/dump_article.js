const fs = require('fs');

async function dumpContent(url) {
    const auth = JSON.parse(fs.readFileSync('./scripts/trailhead_auth.json', 'utf8'));
    const cookieHeader = auth.cookies.map(c => `${c.name}=${c.value}`).join('; ');

    const res = await fetch(url, { headers: { Cookie: cookieHeader, 'User-Agent': 'Mozilla/5.0' } });
    const html = await res.text();
    fs.writeFileSync('./scripts/raw_dump.html', html, 'utf8');

    // Look for unit content container
    const m = html.match(/class="unit-content[^"]*"[^>]*>([\s\S]*?)<\/div>/i) ||
              html.match(/class="content-container[^"]*"[^>]*>([\s\S]*?)<\/main>/i) ||
              html.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
    
    // Also look for "Verify" or instructions headings
    const matches = html.match(/(?:<h[1-4][^>]*>[\s\S]*?<\/h[1-4]>|<p[^>]*>[\s\S]*?<\/p>|<li[^>]*>[\s\S]*?<\/li>)/gi) || [];
    const textLines = matches.map(m => m.replace(/<[^>]+>/g, '').trim()).filter(t => t.length > 5);
    console.log('Total text lines:', textLines.length);
    fs.writeFileSync('./scripts/extracted_text.txt', textLines.join('\n'), 'utf8');
    console.log('First 20 lines:\n', textLines.slice(0, 20).join('\n'));
}

dumpContent(process.argv[2] || 'https://trailhead.salesforce.com/content/learn/projects/customize-a-salesforce-object/standard-custom-fields');
