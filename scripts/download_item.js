const fs = require('fs');
const path = require('path');
const https = require('https');

const AUTH_FILE = path.join(__dirname, 'trailhead_auth.json');
const auth = JSON.parse(fs.readFileSync(AUTH_FILE, 'utf8'));
const cookies = auth.cookieHeader || auth.cookies.map(c => `${c.name}=${c.value}`).join('; ');

function fetchPage(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { Cookie: cookies, 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function downloadUnits(itemType, itemSlug, units) {
  for (let i = 0; i < units.length; i++) {
    const u = units[i];
    const url = `https://trailhead.salesforce.com/content/learn/${itemType}/${itemSlug}/${u}`;
    console.log(`Downloading [${i+1}/${units.length}]: ${url}`);
    const html = await fetchPage(url);
    fs.writeFileSync(`scripts/${itemSlug}_${u}.html`, html);

    const text = html.replace(/<script[\s\S]*?<\/script>/gi, '')
                     .replace(/<style[\s\S]*?<\/style>/gi, '')
                     .replace(/<svg[\s\S]*?<\/svg>/gi, '')
                     .replace(/<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/gi, '\n\n=== $1 ===\n')
                     .replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, '\n* $1')
                     .replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, '\n$1\n')
                     .replace(/<tr[^>]*>([\s\S]*?)<\/tr>/gi, '\n| $1 |')
                     .replace(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi, ' $1 |')
                     .replace(/<[^>]+>/g, '')
                     .replace(/&nbsp;/g, ' ')
                     .replace(/&amp;/g, '&')
                     .replace(/&lt;/g, '<')
                     .replace(/&gt;/g, '>')
                     .replace(/&#39;/g, "'")
                     .replace(/&quot;/g, '"');
    const lines = text.split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 0 && !l.startsWith('All rights reserved') && !l.includes('Terms of Service'));
    fs.writeFileSync(`scripts/${itemSlug}_${u}.txt`, lines.join('\n'));
    console.log(`Saved ${itemSlug}_${u}.txt (${lines.length} lines)`);
  }
}

const itemType = process.argv[2] || 'projects';
const itemSlug = process.argv[3] || 'quickstart-app-builder';
const units = process.argv.slice(4).length > 0 ? process.argv.slice(4) : ['quickstart-app-builder1', 'quickstart-app-builder2', 'quickstart-app-builder3'];

downloadUnits(itemType, itemSlug, units).catch(console.error);
