const fs = require('fs');
const path = require('path');
const https = require('https');

const AUTH_FILE = path.join(__dirname, 'trailhead_auth.json');
const auth = JSON.parse(fs.readFileSync(AUTH_FILE, 'utf8'));
const cookies = auth.cookieHeader || auth.cookies.map(c => `${c.name}=${c.value}`).join('; ');

const units = [
  'prepare-your-org',
  'create-an-approval-process',
  'create-initial-submission-actions',
  'specify-final-approval-and-rejection-actions'
];

function fetchPage(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { Cookie: cookies, 'User-Agent': 'Mozilla/5.0' } }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function main() {
  for (const u of units) {
    const url = `https://trailhead.salesforce.com/content/learn/projects/build-a-discount-approval-process/${u}`;
    console.log(`Downloading ${u}...`);
    const html = await fetchPage(url);
    fs.writeFileSync(`scripts/proj17_${u}.html`, html);

    // Also write cleaned text
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
    fs.writeFileSync(`scripts/proj17_${u}.txt`, lines.join('\n'));
    console.log(`Saved proj17_${u}.txt (${lines.length} lines)`);
  }
}

main().catch(console.error);
