const fs = require('fs');
const path = require('path');
const https = require('https');

const AUTH_FILE = path.join(__dirname, 'trailhead_auth.json');
const auth = JSON.parse(fs.readFileSync(AUTH_FILE, 'utf8'));
const cookies = auth.cookieHeader || auth.cookies.map(c => `${c.name}=${c.value}`).join('; ');

const projectUrl = 'https://trailhead.salesforce.com/content/learn/projects/build-a-discount-approval-process';

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
  console.log('Fetching Project 17 page...');
  const html = await fetchPage(projectUrl);
  
  // Extract units
  const popoverMatch = html.match(/data-react-class=["']units\/UnitsBreadcrumbPopover["']\s+data-react-props=["']([^"']+)["']/i);
  if (popoverMatch) {
    const props = JSON.parse(popoverMatch[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>'));
    console.log('Units found in Popover:');
    props.units.forEach((u, idx) => {
      console.log(`Unit ${idx + 1}: ${u.title} (${u.path}) - ${u.time} mins - Complete: ${u.isComplete}`);
    });
  } else {
    // Regex search
    const unitMatches = [...html.matchAll(/href="(\/content\/learn\/projects\/build-a-discount-approval-process\/[^"]+)"/g)];
    const unique = [...new Set(unitMatches.map(m => m[1]))];
    console.log('Unique unit paths:', unique);
  }
}

main().catch(console.error);
