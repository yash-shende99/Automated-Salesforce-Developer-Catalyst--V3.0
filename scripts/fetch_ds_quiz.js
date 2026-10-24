const fs = require('fs');

async function run() {
  const auth = JSON.parse(fs.readFileSync('./scripts/trailhead_auth.json', 'utf8'));
  const cookieHeader = auth.cookies.map(c => c.name + '=' + c.value).join('; ');
  const res = await fetch('https://trailhead.salesforce.com/content/learn/modules/data_security/data_security_overview', { headers: { Cookie: cookieHeader } });
  const html = await res.text();
  const m = html.match(/content_assessments\/([a-f0-9-]+)/) || html.match(/content_uid&quot;:&quot;([a-f0-9-]+)&quot;/);
  console.log('Content Assessment ID:', m ? m[1] : 'not found');
  
  const qm = html.match(/data-react-props="([^"]+)"/);
  if (qm) {
    const raw = qm[1].replace(/&quot;/g, '"').replace(/&#39;/g, "'");
    const d = JSON.parse(raw);
    console.log('React props questions:', d.challenge?.questions?.length || 0);
    if (d.challenge?.questions) {
      d.challenge.questions.forEach((q, i) => {
        console.log(`Q${i+1}: ${q.title}`);
        q.answers.forEach(a => console.log(`  - [${a.id}] ${a.title}`));
      });
    }
  }
}
run();
