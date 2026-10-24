const fs = require('fs');

const units = [
  'formula_fields',
  'roll_up_summary_fields',
  'validation_rules'
];

async function dumpReqs() {
  const auth = JSON.parse(fs.readFileSync('./scripts/trailhead_auth.json', 'utf8'));
  const cookieHeader = auth.cookies.map(c => `${c.name}=${c.value}`).join('; ');

  for (const u of units) {
    const url = `https://trailhead.salesforce.com/content/learn/modules/point_click_business_logic/${u}`;
    const res = await fetch(url, { headers: { Cookie: cookieHeader, 'User-Agent': 'Mozilla/5.0' } });
    const html = await res.text();
    
    // Look for challenge section: <div class="challenge" or <h2>Your Challenge</h2> or text after "Challenge"
    const textMatch = html.match(/(?:<h[1-4][^>]*>[\s\S]*?<\/h[1-4]>|<p[^>]*>[\s\S]*?<\/p>|<li[^>]*>[\s\S]*?<\/li>)/gi) || [];
    const textLines = textMatch.map(m => m.replace(/<[^>]+>/g, '').trim()).filter(t => t.length > 5);
    
    // Find where "Challenge" appears
    const challengeIdx = textLines.findIndex(t => t.includes('Challenge') || t.includes('Check Challenge'));
    const relevant = challengeIdx !== -1 ? textLines.slice(Math.max(0, challengeIdx - 5)) : textLines.slice(-30);

    console.log(`\n================ ${u} ================`);
    console.log(relevant.join('\n'));
    fs.writeFileSync(`./scripts/req_${u}.txt`, relevant.join('\n'), 'utf8');
  }
}

dumpReqs().catch(console.error);
