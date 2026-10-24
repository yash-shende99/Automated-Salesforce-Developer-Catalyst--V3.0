const fs = require('fs');

const items = [
  { slug: 'apex_triggers', type: 'modules' },
  { slug: 'apex_testing', type: 'modules' },
  { slug: 'keep-data-secure-in-a-recruiting-app', type: 'projects' },
  { slug: 'customize-a-salesforce-object', type: 'projects' }
];

async function check() {
  const auth = JSON.parse(fs.readFileSync('./scripts/trailhead_auth.json', 'utf8'));
  const cookieHeader = auth.cookies.map(c => `${c.name}=${c.value}`).join('; ');

  console.log('--- AUDITING REMAINING 4 ITEMS ---');
  for (const item of items) {
    const url = `https://trailhead.salesforce.com/content/learn/${item.type}/${item.slug}`;
    const res = await fetch(url, { headers: { Cookie: cookieHeader, 'User-Agent': 'Mozilla/5.0' } });
    const html = await res.text();
    
    // Extract data-react-props
    const allProps = [...html.matchAll(/data-react-props="([^"]+)"/g)];
    let completedCount = 0;
    let totalCount = 0;
    let isFinished = false;

    for (const m of allProps) {
        const decoded = m[1].replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');
        try {
            const data = JSON.parse(decoded);
            if (data.units && Array.isArray(data.units)) {
                totalCount = data.units.length;
                completedCount = data.units.filter(u => u.isComplete || u.is_complete).length;
            }
            if (data.user && (data.user.completed || data.user.finishedAt)) {
                isFinished = true;
            }
            if (data.completed === true || data.badge_earned === true) {
                isFinished = true;
            }
        } catch (e) {}
    }

    const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : (isFinished ? 100 : 0);
    console.log(`${item.slug}: ${pct}% (${completedCount}/${totalCount} units) ${pct === 100 ? '✅ BADGE EARNED' : ''}`);
  }
}

check().catch(console.error);
