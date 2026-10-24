const fs = require('fs');

const units = [
  'formula_fields',
  'roll_up_summary_fields',
  'validation_rules'
];

async function run() {
  const auth = JSON.parse(fs.readFileSync('./scripts/trailhead_auth.json', 'utf8'));
  const cookieHeader = auth.cookies.map(c => `${c.name}=${c.value}`).join('; ');

  for (const u of units) {
    const url = `https://trailhead.salesforce.com/content/learn/modules/point_click_business_logic/${u}`;
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
      console.log('Assessment Evaluation Context:', JSON.stringify(d.challenge?.assessment_evaluation_context, null, 2));
    }
  }
}

run().catch(console.error);
