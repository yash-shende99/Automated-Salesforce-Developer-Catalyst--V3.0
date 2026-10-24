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

async function checkStatus() {
  const authFile = 'scripts/trailhead_auth.json';
  const cookies = JSON.parse(fs.readFileSync(authFile, 'utf8')).cookies;
  const cookieHeader = cookies.map(c => `${c.name}=${c.value}`).join('; ');

  for (const u of units) {
    const url = `https://trailhead.salesforce.com/content/learn/projects/customize-a-salesforce-object/${u}`;
    const res = await fetch(url, { headers: { Cookie: cookieHeader } });
    const html = await res.text();
    const isCompleted = html.includes('"completed":true') || html.includes('challenge_completed');
    const match = html.match(/data-react-props="([^"]+)"/);
    let completed = false;
    let title = u;
    if (match) {
      const raw = match[1].replace(/&quot;/g, '"').replace(/&#39;/g, "'");
      try {
        const data = JSON.parse(raw);
        completed = data.completed || false;
        title = data.title || u;
      } catch (e) {}
    }
    console.log(`Unit: ${u} | Completed: ${completed}`);
  }
}

checkStatus();
