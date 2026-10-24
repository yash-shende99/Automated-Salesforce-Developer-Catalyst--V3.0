const fs = require('fs');

const units = [
  'standard-custom-fields',
  'picklists-field-dependencies',
  'create-lookup-filters',
  'create-formula-fields',
  'create-record-types',
  'create-account-page-layouts',
  'account-field-history-tracking',
  'create-validation-rules-1'
];

async function run() {
  const auth = JSON.parse(fs.readFileSync('./scripts/trailhead_auth.json', 'utf8'));
  const cookieHeader = auth.cookies.map(c => `${c.name}=${c.value}`).join('; ');

  for (const u of units) {
    const url = `https://trailhead.salesforce.com/content/learn/projects/customize-a-salesforce-object/${u}`;
    const res = await fetch(url, { headers: { Cookie: cookieHeader } });
    const html = await res.text();

    const m = html.match(/data-react-class="challenge\/Challenge"\s+data-react-props="([^"]+)"/) ||
              html.match(/data-react-props="([^"]+)"\s+data-react-class="challenge\/Challenge"/);
    if (m) {
      const decoded = m[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&#39;/g, "'");
      const d = JSON.parse(decoded);
      console.log(`\n================ ${u} ================`);
      console.log('Title:', d.challenge?.title);
      console.log('Description:', d.challenge?.description);
      console.log('Requirements:', d.challenge?.requirements);
      console.log('Type:', d.challenge?.type);
    }
  }
}

run().catch(console.error);
