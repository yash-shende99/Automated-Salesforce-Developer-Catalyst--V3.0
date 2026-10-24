const fs = require('fs');
const https = require('https');
const authData = JSON.parse(fs.readFileSync('./scripts/trailhead_auth.json', 'utf8'));
const cookies = authData.cookies || [];
const cookieHeader = cookies.map(c => `${c.name}=${c.value}`).join('; ');

async function getReqs(slug) {
  return new Promise((resolve) => {
    https.get('https://trailhead.salesforce.com/content/learn/modules/lightning_app_builder/' + slug, {
      headers: { Cookie: cookieHeader, 'User-Agent': 'Mozilla/5.0' }
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const m = data.match(/&quot;requirements&quot;:(\[[^\]]+\])/);
        if (m) {
          console.log('=== ' + slug + ' ===');
          const cleaned = m[1].replace(/&quot;/g, '"');
          try {
            console.log(JSON.parse(cleaned));
          } catch(e) {
            console.log(cleaned);
          }
        }
        resolve();
      });
    });
  });
}

(async () => {
  for (const slug of ['add-visibility-rules-for-dynamic-pages-lab', 'lightning_app_builder_apphome', 'lightning_app_builder_custom_comps']) {
    await getReqs(slug);
  }
})();
